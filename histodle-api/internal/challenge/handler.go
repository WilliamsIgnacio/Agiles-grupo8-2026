package challenge

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
	challenges, err := handler.service.List()
	if err != nil {
		http.Error(w, "Error al obtener los desafíos", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, challenges)
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}
	challenge, err := handler.service.Get(id)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Desafío no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener el desafío", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, challenge)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var challenge Challenge
	if err := json.NewDecoder(r.Body).Decode(&challenge); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	created, err := handler.service.Create(challenge)
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
	var challenge Challenge
	if err := json.NewDecoder(r.Body).Decode(&challenge); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	challenge.ID = id
	updated, err := handler.service.Update(challenge)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Desafío no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	writeJSON(w, http.StatusOK, updated)
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
