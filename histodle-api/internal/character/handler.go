package character

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (handler *Handler) List(w http.ResponseWriter, r *http.Request) {
	characters, err := handler.service.List()
	if err != nil {
		http.Error(w, "Error al listar los personajes", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, characters)
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "Id inválido para el personaje", http.StatusBadRequest)
		return
	}

	character, err := handler.service.Get(uint(id))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Personaje no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener el personaje", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, character)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var character Character
	if err := json.NewDecoder(r.Body).Decode(&character); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	character, err := handler.service.Create(character)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, character)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
