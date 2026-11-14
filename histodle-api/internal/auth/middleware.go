package auth

import (
	"context"
	"net/http"

	"histodle-api/internal/user"
)

type contextKey string

const userContextKey contextKey = "authenticated-user"
const sessionContextKey contextKey = "authenticated-session"

func UserFromContext(ctx context.Context) (user.User, bool) {
	u, ok := ctx.Value(userContextKey).(user.User)
	return u, ok
}

func (s *Service) RequireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u, session, err := s.UserFromRequest(r)
		if err != nil {
			http.Error(w, "No autenticado", http.StatusUnauthorized)
			return
		}
		if err := s.ValidateCSRF(r, session); err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		ctx := context.WithValue(r.Context(), userContextKey, u)
		ctx = context.WithValue(ctx, sessionContextKey, session)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Service) RequireAdmin(next http.Handler) http.Handler {
	return s.RequireAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u, ok := UserFromContext(r.Context())
		if !ok || !u.IsAdmin() {
			http.Error(w, "Se requiere rol de administrador", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	}))
}
