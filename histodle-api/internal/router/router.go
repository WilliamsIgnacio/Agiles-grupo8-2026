package router

import (
	"encoding/json"
	"net/http"

	"histodle-api/internal/character"
	"histodle-api/internal/occupations"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func New(db *gorm.DB) http.Handler {
	r := chi.NewRouter()

	// rutas de personajes
	characterRepository := character.NewRepository(db)
	characterService := character.NewService(characterRepository)
	characterHandler := character.NewHandler(characterService)

	r.Get("/characters", characterHandler.List)
	r.Get("/characters/{id}", characterHandler.Get)
	r.Post("/characters", characterHandler.Create)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})

	//rutas de ocupaciones
	occupationRepository := occupations.NewOccupationRepository(db)
	occupationService := occupations.NewService(occupationRepository)
	occupationHandler := occupations.NewHandler(occupationService)

	r.Get("/occupations", occupationHandler.List)
	r.Get("/occupations/{id}", occupationHandler.Get)
	r.Post("/occupations", occupationHandler.Create)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		json.NewEncoder(w).Encode(map[string]string{
			"status": "ok",
		})
	})

	return r
}
