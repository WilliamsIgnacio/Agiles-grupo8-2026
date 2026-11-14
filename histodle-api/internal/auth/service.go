package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/crypto/argon2"
	"golang.org/x/oauth2"
	"gorm.io/gorm"
	"histodle-api/config"
	"histodle-api/internal/user"
)

var (
	ErrInvalidCredentials = errors.New("credenciales inválidas")
	ErrInvalidCSRF        = errors.New("token CSRF inválido")
)

type Service struct {
	db             *gorm.DB
	users          *user.Service
	userRepository *user.Repository
	config         config.Config
	oauthConfig    *oauth2.Config
	verifier       *oidc.IDTokenVerifier
}

type GoogleClaims struct {
	Subject       string `json:"sub"`
	Email         string `json:"email"`
	EmailVerified bool   `json:"email_verified"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	Nonce         string `json:"nonce"`
}

func NewService(ctx context.Context, db *gorm.DB, cfg config.Config, users *user.Service, userRepository *user.Repository) (*Service, error) {
	s := &Service{db: db, users: users, userRepository: userRepository, config: cfg}
	if cfg.GoogleClientID == "" || cfg.GoogleClientSecret == "" || cfg.GoogleRedirectURL == "" {
		return s, nil
	}
	provider, err := oidc.NewProvider(ctx, "https://accounts.google.com")
	if err != nil {
		return nil, fmt.Errorf("configurar proveedor OIDC de Google: %w", err)
	}
	s.verifier = provider.Verifier(&oidc.Config{ClientID: cfg.GoogleClientID})
	s.oauthConfig = &oauth2.Config{
		ClientID: cfg.GoogleClientID, ClientSecret: cfg.GoogleClientSecret,
		Endpoint: provider.Endpoint(), RedirectURL: cfg.GoogleRedirectURL,
		Scopes: []string{oidc.ScopeOpenID, "email", "profile"},
	}
	return s, nil
}

func randomToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(bytes), nil
}

func hashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	digest := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	return base64.RawStdEncoding.EncodeToString(salt) + "$" + base64.RawStdEncoding.EncodeToString(digest), nil
}

func verifyPassword(password, encoded string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 2 {
		return false
	}
	salt, saltErr := base64.RawStdEncoding.DecodeString(parts[0])
	expected, hashErr := base64.RawStdEncoding.DecodeString(parts[1])
	if saltErr != nil || hashErr != nil {
		return false
	}
	actual := argon2.IDKey([]byte(password), salt, 1, 64*1024, 4, 32)
	if len(actual) != len(expected) {
		return false
	}
	var difference byte
	for index := range actual {
		difference |= actual[index] ^ expected[index]
	}
	return difference == 0
}

func (s *Service) CreateLocalUser(email, password, name string) (user.User, error) {
	if len(password) < 8 || len(password) > 1024 {
		return user.User{}, errors.New("la contraseña debe tener al menos 8 caracteres")
	}
	hash, err := hashPassword(password)
	if err != nil {
		return user.User{}, err
	}
	u, err := s.users.RegisterWithPassword(email, name, hash)
	if err != nil {
		return user.User{}, err
	}
	return u, nil
}

func (s *Service) AuthenticateLocal(email, password string) (user.User, error) {
	if len(password) > 1024 {
		return user.User{}, ErrInvalidCredentials
	}
	u, err := s.userRepository.FindByEmail(email)
	if err != nil || u.PasswordHash == nil || !verifyPassword(password, *u.PasswordHash) {
		return user.User{}, ErrInvalidCredentials
	}
	return u, nil
}

func (s *Service) NewSession(u user.User) (token, csrf string, err error) {
	token, err = randomToken()
	if err != nil {
		return "", "", err
	}
	csrf, err = randomToken()
	if err != nil {
		return "", "", err
	}
	session := Session{UserID: u.ID, TokenHash: hash(token), CSRFTokenHash: hash(csrf), ExpiresAt: time.Now().Add(24 * time.Hour), LastUsedAt: time.Now()}
	return token, csrf, s.db.Create(&session).Error
}

func (s *Service) UserFromRequest(r *http.Request) (user.User, *Session, error) {
	cookie, err := r.Cookie("histodle_session")
	if err != nil {
		return user.User{}, nil, ErrInvalidCredentials
	}
	var session Session
	if err := s.db.Preload("User").Where("token_hash = ? AND expires_at > ?", hash(cookie.Value), time.Now()).First(&session).Error; err != nil {
		return user.User{}, nil, ErrInvalidCredentials
	}
	s.db.Model(&session).Update("last_used_at", time.Now())
	return session.User, &session, nil
}

func (s *Service) DeleteSession(r *http.Request) error {
	cookie, err := r.Cookie("histodle_session")
	if err != nil {
		return nil
	}
	return s.db.Where("token_hash = ?", hash(cookie.Value)).Delete(&Session{}).Error
}

func (s *Service) UpdatePassword(userID uint, updates map[string]interface{}) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&user.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
			return err
		}
		return tx.Where("user_id = ?", userID).Delete(&Session{}).Error
	})
}

func (s *Service) ValidateCSRF(r *http.Request, session *Session) error {
	if r.Method == http.MethodGet || r.Method == http.MethodHead || r.Method == http.MethodOptions {
		return nil
	}
	token := r.Header.Get("X-CSRF-Token")
	if token == "" || session == nil || hash(token) != session.CSRFTokenHash {
		return ErrInvalidCSRF
	}
	return nil
}

func (s *Service) GoogleAuthURL(state, nonce string) string {
	return s.oauthConfig.AuthCodeURL(state, oauth2.SetAuthURLParam("nonce", nonce))
}

func (s *Service) ExchangeGoogleClaims(ctx context.Context, code, nonce string) (GoogleClaims, error) {
	if s.oauthConfig == nil || s.verifier == nil {
		return GoogleClaims{}, errors.New("Google OAuth no está configurado")
	}
	token, err := s.oauthConfig.Exchange(ctx, code)
	if err != nil {
		return GoogleClaims{}, err
	}
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return GoogleClaims{}, errors.New("Google no devolvió un ID token")
	}
	idToken, err := s.verifier.Verify(ctx, rawIDToken)
	if err != nil {
		return GoogleClaims{}, err
	}
	var claims GoogleClaims
	if err := idToken.Claims(&claims); err != nil || claims.Nonce != nonce || !claims.EmailVerified {
		return GoogleClaims{}, errors.New("ID token de Google inválido")
	}
	return claims, nil
}

func (s *Service) ExchangeGoogle(ctx context.Context, code, nonce string) (user.User, error) {
	claims, err := s.ExchangeGoogleClaims(ctx, code, nonce)
	if err != nil {
		return user.User{}, err
	}
	return s.users.FindOrCreateGoogle(claims.Subject, strings.ToLower(claims.Email), claims.Name, claims.Picture)
}

func (s *Service) LinkGoogle(ctx context.Context, userID uint, code, nonce string) (user.User, error) {
	claims, err := s.ExchangeGoogleClaims(ctx, code, nonce)
	if err != nil {
		return user.User{}, err
	}
	return s.users.LinkGoogle(userID, claims.Subject, strings.ToLower(claims.Email), claims.Name, claims.Picture)
}
