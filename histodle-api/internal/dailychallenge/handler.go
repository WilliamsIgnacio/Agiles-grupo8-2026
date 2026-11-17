package dailychallenge

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

const argentinaUTCOffset = -3 * 60 * 60

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (handler *Handler) Get(w http.ResponseWriter, r *http.Request) {
	date, err := ParseDate(chi.URLParam(r, "date"))
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	dailyChallenge, err := handler.service.Get(date)
	if errors.Is(err, ErrNoCharacters) {
		http.Error(w, err.Error(), http.StatusServiceUnavailable)
		return
	}
	if err != nil {
		http.Error(w, "Error al obtener el desafío diario", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, dailyChallenge)
}

func ParseDate(value string) (time.Time, error) {
	today := time.Now().In(time.FixedZone("Argentina", argentinaUTCOffset))
	return parseDate(value, today)
}

func parseDate(value string, today time.Time) (time.Time, error) {
	date, err := time.Parse(time.DateOnly, value)
	if err != nil || date.Format(time.DateOnly) != value {
		return time.Time{}, errors.New("La fecha debe tener el formato YYYY-MM-DD")
	}

	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)
	if date.After(today) {
		return time.Time{}, errors.New("No se puede jugar un desafío de una fecha futura")
	}

	return date, nil
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("error encoding daily challenge response: %v", err)
	}
}
