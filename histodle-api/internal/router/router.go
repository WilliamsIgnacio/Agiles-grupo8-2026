package router

import (
	"context"
	"encoding/json"
	"net/http"

	"histodle-api/config"
	"histodle-api/internal/auth"
	"histodle-api/internal/category"
	"histodle-api/internal/challenge"
	"histodle-api/internal/character"
	"histodle-api/internal/difficulty"
	"histodle-api/internal/leaderboard"
	"histodle-api/internal/metrics"
	"histodle-api/internal/occupation"
	"histodle-api/internal/score"
	"histodle-api/internal/user"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"gorm.io/gorm"
)

func New(db *gorm.DB, cfg config.Config) (http.Handler, error) {
	r := chi.NewRouter()

	r.Use(securityHeaders)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: true,
	}))
	r.Use(metrics.Middleware)

	userRepository := user.NewRepository(db)
	userService := user.NewService(userRepository)
	authService, err := auth.NewService(context.Background(), db, cfg, userService, userRepository)
	if err != nil {
		return nil, err
	}
	authHandler := auth.NewHandler(authService)
	r.Route("/auth", authHandler.Routes)

	characterRepository := character.NewRepository(db)
	characterService := character.NewService(characterRepository)
	characterHandler := character.NewHandler(characterService)

	r.Get("/characters", characterHandler.List)
	r.Get("/characters/{id}", characterHandler.Get)
	r.With(authService.RequireAdmin).Post("/characters", characterHandler.Create)
	r.With(authService.RequireAdmin).Put("/characters/{id}", characterHandler.Update)
	r.With(authService.RequireAdmin).Delete("/characters/{id}", characterHandler.Delete)

	challengeRepository := challenge.NewRepository(db)
	challengeService := challenge.NewService(challengeRepository)
	challengeHandler := challenge.NewHandler(challengeService)

	r.Get("/challenges", challengeHandler.List)
	r.Get("/challenges/{id}", challengeHandler.Get)
	r.With(authService.RequireAdmin).Post("/challenges", challengeHandler.Create)
	r.With(authService.RequireAdmin).Put("/challenges/{id}", challengeHandler.Update)
	r.With(authService.RequireAdmin).Delete("/challenges/{id}", challengeHandler.Delete)

	//rutas de ocupaciones
	occupationRepository := occupation.NewOccupationRepository(db)
	occupationService := occupation.NewService(occupationRepository)
	occupationHandler := occupation.NewHandler(occupationService)

	r.Get("/occupations", occupationHandler.List)
	r.Get("/occupations/{id}", occupationHandler.Get)
	r.With(authService.RequireAdmin).Post("/occupations", occupationHandler.Create)
	r.With(authService.RequireAdmin).Put("/occupations/{id}", occupationHandler.Update)
	r.With(authService.RequireAdmin).Delete("/occupations/{id}", occupationHandler.Delete)

	//rutas de categorias
	categoryRepository := category.NewRepository(db)
	categoryService := category.NewService(categoryRepository)
	categoryHandler := category.NewHandler(categoryService)

	r.Get("/categories", categoryHandler.List)

	difficultyRepository := difficulty.NewRepository(db)
	difficultyService := difficulty.NewService(difficultyRepository)
	difficultyHandler := difficulty.NewHandler(difficultyService)

	r.Get("/difficulties", difficultyHandler.List)
	r.Get("/difficulties/{id}", difficultyHandler.Get)
	r.With(authService.RequireAdmin).Post("/difficulties", difficultyHandler.Create)
	r.With(authService.RequireAdmin).Put("/difficulties/{id}", difficultyHandler.Update)
	r.With(authService.RequireAdmin).Delete("/difficulties/{id}", difficultyHandler.Delete)

	scoreRepository := score.NewRepository(db)
	scoreService := score.NewService(scoreRepository)
	scoreHandler := score.NewHandler(scoreService)
	leaderboardRepository := leaderboard.NewRepository(db)
	leaderboardService := leaderboard.NewService(leaderboardRepository, scoreService)
	leaderboardHandler := leaderboard.NewHandler(leaderboardService)

	r.Get("/scores", scoreHandler.List)
	r.Get("/scores/{id}", scoreHandler.Get)
	r.Get("/scores/difficulty/{difficultyId}", scoreHandler.GetByDifficultyID)
	r.Post("/scores/difficulty/{difficultyId}/calculate", scoreHandler.CalculateByDifficultyID)
	r.With(authService.RequireAdmin).Post("/scores", scoreHandler.Create)
	r.With(authService.RequireAdmin).Put("/scores/{id}", scoreHandler.Update)
	r.With(authService.RequireAdmin).Delete("/scores/{id}", scoreHandler.Delete)
	r.Get("/leaderboard", leaderboardHandler.Ranking)
	r.With(authService.RequireAuth).Post("/challenges/{challengeId}/results", leaderboardHandler.Record)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})
	r.Handle("/metrics", promhttp.Handler())

	return r, nil
}

func securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		next.ServeHTTP(w, r)
	})
}
