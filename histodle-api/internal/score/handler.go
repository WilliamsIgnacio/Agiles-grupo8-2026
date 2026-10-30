package score

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

func (handler *Handler) List(w http.ResponseWriter, _ *http.Request) {
	scores, err := handler.service.List()
	if err != nil {
		http.Error(w, "Error al obtener los puntajes", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(scores)
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	score, err := handler.service.Get(uint(id))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Puntaje no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener el puntaje", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(score)
}

func (handler *Handler) GetByLevelID(w http.ResponseWriter, r *http.Request) {
	levelID, err := strconv.ParseUint(chi.URLParam(r, "levelId"), 10, 64)
	if err != nil {
		http.Error(w, "ID de nivel inválido", http.StatusBadRequest)
		return
	}

	score, err := handler.service.GetByLevelID(uint(levelID))
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Puntaje del nivel no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener el puntaje del nivel", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(score)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var score Score
	if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	created, err := handler.service.Create(score)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(created)
}

func (handler *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var score Score
	if err := json.NewDecoder(r.Body).Decode(&score); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	updated, err := handler.service.Update(uint(id), score)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Puntaje no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(updated)
}

func (handler *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	if err := handler.service.Delete(uint(id)); errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Puntaje no encontrado", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Error al eliminar el puntaje", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
