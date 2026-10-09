package router

import (
	"encoding/json"
	"net/http"

	"histodle-api/internal/character"
	"histodle-api/internal/occupation"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"gorm.io/gorm"
)

func New(db *gorm.DB) http.Handler {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:5173"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type"},
	}))

	characterRepository := character.NewRepository(db)
	characterService := character.NewService(characterRepository)
	characterHandler := character.NewHandler(characterService)

	r.Get("/characters", characterHandler.List)
	r.Get("/characters/{id}", characterHandler.Get)
	r.Post("/characters", characterHandler.Create)
	r.Put("/characters/{id}", characterHandler.Update)
	r.Delete("/characters/{id}", characterHandler.Delete)

	//rutas de ocupaciones
	occupationRepository := occupation.NewOccupationRepository(db)
	occupationService := occupation.NewService(occupationRepository)
	occupationHandler := occupation.NewHandler(occupationService)

	r.Get("/occupations", occupationHandler.List)
	r.Get("/occupations/{id}", occupationHandler.Get)
	r.Post("/occupations", occupationHandler.Create)
	r.Put("/occupations/{id}", occupationHandler.Update)
	r.Delete("/occupations/{id}", occupationHandler.Delete)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})

	return r
}
