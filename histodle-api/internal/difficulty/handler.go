package difficulty

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
	difficulties, err := handler.service.List()
	if err != nil {
		http.Error(w, "Error al obtener las dificultades", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, difficulties)
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}
	difficulty, err := handler.service.Get(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Dificultad no encontrada", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener la dificultad", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, difficulty)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var difficulty Difficulty
	if err := json.NewDecoder(r.Body).Decode(&difficulty); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	created, err := handler.service.Create(difficulty)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, http.StatusCreated, created)
}

func (handler *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}
	var difficulty Difficulty
	if err := json.NewDecoder(r.Body).Decode(&difficulty); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	updated, err := handler.service.Update(id, difficulty)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Dificultad no encontrada", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, http.StatusOK, updated)
}

func (handler *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}
	err = handler.service.Delete(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Dificultad no encontrada", http.StatusNotFound)
		return
	}
	if errors.Is(err, ErrDifficultyInUse) {
		http.Error(w, "No se puede eliminar la dificultad porque está asignada a personajes", http.StatusConflict)
		return
	}
	if err != nil {
		http.Error(w, "Error al eliminar la dificultad", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func parseID(r *http.Request) (uint, error) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	return uint(id), err
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
