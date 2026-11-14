package auth

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"histodle-api/internal/user"
)

type Handler struct{ service *Service }

func NewHandler(service *Service) *Handler { return &Handler{service: service} }

func writeJSON(w http.ResponseWriter, status int, value interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination interface{}) error {
	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return err
	}
	var extra interface{}
	if err := decoder.Decode(&extra); err != io.EOF {
		return errors.New("el cuerpo debe contener un único objeto JSON")
	}
	return nil
}

type credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input credentials
	if decodeJSON(w, r, &input) != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	u, err := h.service.CreateLocalUser(input.Email, input.Password, input.Name)
	if err != nil {
		if errors.Is(err, user.ErrEmailTaken) {
			writeJSON(w, http.StatusCreated, map[string]string{
				"email": strings.ToLower(strings.TrimSpace(input.Email)),
			})
		} else {
			http.Error(w, err.Error(), http.StatusBadRequest)
		}
		return
	}
	writeJSON(w, http.StatusCreated, map[string]string{"email": u.Email})
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input credentials
	if decodeJSON(w, r, &input) != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	u, err := h.service.AuthenticateLocal(input.Email, input.Password)
	if err != nil {
		http.Error(w, "credenciales inválidas", http.StatusUnauthorized)
		return
	}
	h.startSession(w, u)
}

func (h *Handler) Google(w http.ResponseWriter, r *http.Request) {
	if r.URL.Query().Get("link") == "1" {
		u, _, err := h.service.UserFromRequest(r)
		if err != nil {
			http.Error(w, "No autenticado", http.StatusUnauthorized)
			return
		}
		http.SetCookie(w, &http.Cookie{Name: "oauth_link_user", Value: strconv.FormatUint(uint64(u.ID), 10), Path: "/auth", HttpOnly: true, Secure: h.service.config.CookieSecure, SameSite: http.SameSiteLaxMode, MaxAge: 600})
	}
	state, err := randomToken()
	if err != nil {
		http.Error(w, "No se pudo iniciar autenticación", 500)
		return
	}
	nonce, err := randomToken()
	if err != nil {
		http.Error(w, "No se pudo iniciar autenticación", 500)
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "oauth_state", Value: state, Path: "/auth", HttpOnly: true, Secure: h.service.config.CookieSecure, SameSite: http.SameSiteLaxMode, MaxAge: 600})
	http.SetCookie(w, &http.Cookie{Name: "oauth_nonce", Value: nonce, Path: "/auth", HttpOnly: true, Secure: h.service.config.CookieSecure, SameSite: http.SameSiteLaxMode, MaxAge: 600})
	http.Redirect(w, r, h.service.GoogleAuthURL(state, nonce), http.StatusFound)
}

func (h *Handler) GoogleCallback(w http.ResponseWriter, r *http.Request) {
	stateCookie, err1 := r.Cookie("oauth_state")
	nonceCookie, err2 := r.Cookie("oauth_nonce")
	linkCookie, linkErr := r.Cookie("oauth_link_user")
	if err1 != nil || err2 != nil || stateCookie.Value == "" || stateCookie.Value != r.URL.Query().Get("state") {
		http.Error(w, "Estado OAuth inválido", http.StatusBadRequest)
		return
	}
	var u user.User
	var err error
	if linkErr == nil {
		userID, parseErr := strconv.ParseUint(linkCookie.Value, 10, 64)
		if parseErr != nil {
			http.Error(w, "Vínculo OAuth inválido", http.StatusBadRequest)
			return
		}
		u, err = h.service.LinkGoogle(context.Background(), uint(userID), r.URL.Query().Get("code"), nonceCookie.Value)
	} else {
		u, err = h.service.ExchangeGoogle(context.Background(), r.URL.Query().Get("code"), nonceCookie.Value)
	}
	if err != nil {
		http.Error(w, "No se pudo autenticar con Google", http.StatusUnauthorized)
		return
	}
	if err := h.setSessionCookies(w, u); err != nil {
		http.Error(w, "No se pudo crear la sesión", http.StatusInternalServerError)
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "oauth_link_user", Value: "", Path: "/auth", MaxAge: -1, HttpOnly: true})
	http.Redirect(w, r, h.service.config.WebURL, http.StatusFound)
}

func (h *Handler) startSession(w http.ResponseWriter, u user.User) {
	if err := h.setSessionCookies(w, u); err != nil {
		http.Error(w, "No se pudo crear la sesión", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, map[string]interface{}{"user": u})
}

func (h *Handler) setSessionCookies(w http.ResponseWriter, u user.User) error {
	token, csrf, err := h.service.NewSession(u)
	if err != nil {
		return err
	}
	http.SetCookie(w, &http.Cookie{Name: "histodle_session", Value: token, Path: "/", HttpOnly: true, Secure: h.service.config.CookieSecure, SameSite: http.SameSiteLaxMode, MaxAge: 86400})
	http.SetCookie(w, &http.Cookie{Name: "histodle_csrf", Value: csrf, Path: "/", HttpOnly: false, Secure: h.service.config.CookieSecure, SameSite: http.SameSiteLaxMode, MaxAge: 86400})
	return nil
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	u, _, err := h.service.UserFromRequest(r)
	if err != nil {
		http.Error(w, "No autenticado", http.StatusUnauthorized)
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if err := h.service.DeleteSession(r); err != nil {
		http.Error(w, "No se pudo cerrar sesión", 500)
		return
	}
	http.SetCookie(w, &http.Cookie{Name: "histodle_session", Value: "", Path: "/", MaxAge: -1, HttpOnly: true})
	http.SetCookie(w, &http.Cookie{Name: "histodle_csrf", Value: "", Path: "/", MaxAge: -1})
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	u, ok := UserFromContext(r.Context())
	if !ok {
		http.Error(w, "No autenticado", http.StatusUnauthorized)
		return
	}
	var input struct {
		Password string `json:"password"`
	}
	if decodeJSON(w, r, &input) != nil || len(input.Password) < 8 {
		http.Error(w, "Contraseña inválida", http.StatusBadRequest)
		return
	}
	passwordHash, hashErr := hashPassword(input.Password)
	if hashErr != nil {
		http.Error(w, "No se pudo actualizar la contraseña", http.StatusInternalServerError)
		return
	}
	updates := map[string]interface{}{"password_hash": passwordHash}
	if u.ProviderSubject != nil {
		updates["provider"] = "both"
	}
	if err := h.service.UpdatePassword(u.ID, updates); err != nil {
		http.Error(w, "No se pudo actualizar la contraseña", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) CSRF(w http.ResponseWriter, r *http.Request) {
	_, session, err := h.service.UserFromRequest(r)
	if err != nil {
		http.Error(w, "No autenticado", 401)
		return
	}
	writeJSON(w, http.StatusOK, map[string]string{"csrfToken": strings.TrimSpace(r.Header.Get("X-CSRF-Token"))})
	_ = session
}

func (h *Handler) Routes(r chi.Router) {
	r.Post("/register", h.Register)
	r.Post("/login", h.Login)
	r.Get("/google", h.Google)
	r.Get("/google/callback", h.GoogleCallback)
	r.Get("/me", h.Me)
	r.Post("/logout", h.Logout)
	r.Get("/csrf", h.CSRF)
	r.With(h.service.RequireAuth).Put("/password", h.ChangePassword)
}

func SessionCookieDuration() time.Duration { return 24 * time.Hour }
