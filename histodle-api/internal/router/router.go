package router

import (
	"encoding/json"
	"net/http"

	"histodle-api/internal/character"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

func New(db *gorm.DB) http.Handler {
	r := chi.NewRouter()

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

	return r
}
