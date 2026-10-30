package router

import (
	"encoding/json"
	"net/http"

	"histodle-api/internal/category"
	"histodle-api/internal/challenge"
	"histodle-api/internal/character"
	"histodle-api/internal/difficulty"
	"histodle-api/internal/metrics"
	"histodle-api/internal/occupation"
	"histodle-api/internal/score"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"gorm.io/gorm"
)

func New(db *gorm.DB) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173", "http://localhost:3000"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))
	r.Use(metrics.Middleware)

	characterRepository := character.NewRepository(db)
	characterService := character.NewService(characterRepository)
	characterHandler := character.NewHandler(characterService)

	r.Get("/characters", characterHandler.List)
	r.Get("/characters/{id}", characterHandler.Get)
	r.Post("/characters", characterHandler.Create)
	r.Put("/characters/{id}", characterHandler.Update)
	r.Delete("/characters/{id}", characterHandler.Delete)

	challengeRepository := challenge.NewRepository(db)
	challengeService := challenge.NewService(challengeRepository)
	challengeHandler := challenge.NewHandler(challengeService)

	r.Get("/challenges", challengeHandler.List)
	r.Get("/challenges/{id}", challengeHandler.Get)
	r.Post("/challenges", challengeHandler.Create)
	r.Put("/challenges/{id}", challengeHandler.Update)
	r.Delete("/challenges/{id}", challengeHandler.Delete)

	//rutas de ocupaciones
	occupationRepository := occupation.NewOccupationRepository(db)
	occupationService := occupation.NewService(occupationRepository)
	occupationHandler := occupation.NewHandler(occupationService)

	r.Get("/occupations", occupationHandler.List)
	r.Get("/occupations/{id}", occupationHandler.Get)
	r.Post("/occupations", occupationHandler.Create)
	r.Put("/occupations/{id}", occupationHandler.Update)
	r.Delete("/occupations/{id}", occupationHandler.Delete)

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
	r.Post("/difficulties", difficultyHandler.Create)
	r.Put("/difficulties/{id}", difficultyHandler.Update)
	r.Delete("/difficulties/{id}", difficultyHandler.Delete)

	scoreRepository := score.NewRepository(db)
	scoreService := score.NewService(scoreRepository)
	scoreHandler := score.NewHandler(scoreService)

	r.Get("/scores", scoreHandler.List)
	r.Get("/scores/{id}", scoreHandler.Get)
	r.Get("/scores/difficulty/{difficultyId}", scoreHandler.GetByDifficultyID)
	r.Post("/scores", scoreHandler.Create)
	r.Put("/scores/{id}", scoreHandler.Update)
	r.Delete("/scores/{id}", scoreHandler.Delete)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})
	r.Handle("/metrics", promhttp.Handler())

	return r
}
