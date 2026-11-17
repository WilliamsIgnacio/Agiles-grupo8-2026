package leaderboard

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strconv"

	"histodle-api/internal/auth"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (handler *Handler) Ranking(w http.ResponseWriter, _ *http.Request) {
	entries, err := handler.service.Ranking()
	if err != nil {
		http.Error(w, "Error al obtener el ranking", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, entries)
}

func (handler *Handler) Record(w http.ResponseWriter, r *http.Request) {
	user, ok := auth.UserFromContext(r.Context())
	if !ok {
		http.Error(w, "No autenticado", http.StatusUnauthorized)
		return
	}
	challengeID, err := strconv.ParseUint(chi.URLParam(r, "challengeId"), 10, 64)
	if err != nil || challengeID == 0 {
		http.Error(w, "ID de desafío inválido", http.StatusBadRequest)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 16<<10)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	var input RecordInput
	if err := decoder.Decode(&input); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}
	var extra any
	if err := decoder.Decode(&extra); err != io.EOF {
		http.Error(w, "El cuerpo debe contener un único objeto JSON", http.StatusBadRequest)
		return
	}

	result, err := handler.service.Record(user.ID, uint(challengeID), input)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Desafío no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		if errors.Is(err, ErrInvalidResult) {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		http.Error(w, "Error al registrar el resultado del desafío", http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, result)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
