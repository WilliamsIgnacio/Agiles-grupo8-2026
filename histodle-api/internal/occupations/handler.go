package occupations

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
	occupations, err := handler.service.GetAllOccupations()
	if err != nil {
		http.Error(w, "Error al obtener las ocupaciones", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, occupations)
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	occupation, err := handler.service.GetOccupationByID(uint(id))
		if errors.Is(err, gorm.ErrRecordNotFound) {
			http.Error(w, "Ocupación no encontrada", http.StatusNotFound)
			return
		}

	if err != nil {
		http.Error(w, "Error al obtener la ocupación", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, occupation)
}

func (handler *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var occupation Occupation
	if err := json.NewDecoder(r.Body).Decode(&occupation); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	occupation, err := handler.service.CreateOccupation(occupation)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, occupation)
}

func writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}
