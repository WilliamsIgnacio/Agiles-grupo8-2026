package user

import (
	"errors"
	"strings"

	"gorm.io/gorm"
)

var ErrEmailTaken = errors.New("el email ya está registrado")
var ErrGoogleAlreadyLinked = errors.New("la cuenta de Google ya está vinculada a otro usuario")

type Service struct{ repository *Repository }

func NewService(repository *Repository) *Service { return &Service{repository: repository} }

func (s *Service) RegisterWithPassword(email, name, passwordHash string) (User, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if existing, err := s.repository.FindByEmail(email); err == nil && existing.ID != 0 {
		return User{}, ErrEmailTaken
	} else if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return User{}, err
	}
	u := User{Provider: "local", Email: email, Name: strings.TrimSpace(name), Role: "user", PasswordHash: &passwordHash}
	if err := s.repository.Create(&u); err != nil {
		return User{}, err
	}
	return u, nil
}

func (s *Service) FindOrCreateGoogle(subject, email, name, avatar string) (User, error) {
	u, err := s.repository.FindByProviderSubject("google", subject)
	if err == nil {
		u.Email, u.Name, u.AvatarURL = strings.ToLower(email), name, avatar
		return u, s.repository.Save(&u)
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return User{}, err
	}
	if _, err := s.repository.FindByEmail(email); err == nil {
		return User{}, ErrEmailTaken
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return User{}, err
	}
	u = User{Provider: "google", ProviderSubject: &subject, Email: strings.ToLower(email), Name: name, AvatarURL: avatar, Role: "user"}
	return u, s.repository.Create(&u)
}

func (s *Service) LinkGoogle(userID uint, subject, email, name, avatar string) (User, error) {
	linked, err := s.repository.FindByProviderSubject("google", subject)
	if err == nil && linked.ID != userID {
		return User{}, ErrGoogleAlreadyLinked
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return User{}, err
	}
	u, err := s.repository.FindByID(userID)
	if err != nil {
		return User{}, err
	}
	u.ProviderSubject = &subject
	u.Provider = "both"
	u.Email, u.Name, u.AvatarURL = strings.ToLower(email), name, avatar
	return u, s.repository.Save(&u)
}
