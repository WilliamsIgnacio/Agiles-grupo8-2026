package character

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
)

type characterRequest struct {
	Name          string `json:"name"`
	Gender        string `json:"gender"`
	Period        string `json:"period"`
	Country       string `json:"country"`
	Continent     string `json:"continent"`
	KnowFor       string `json:"knowFor"`
	Position      string `json:"position"`
	BirthYear     int32  `json:"birthYear"`
	YearOfDeath   int32  `json:"yearOfDeath"`
	OccupationIDs []uint `json:"occupationIds"`
}

func (request characterRequest) toCharacter() Character {
	return Character{
		Name:        request.Name,
		Gender:      request.Gender,
		Period:      request.Period,
		Country:     request.Country,
		Continent:   request.Continent,
		KnowFor:     request.KnowFor,
		Position:    request.Position,
		BirthYear:   request.BirthYear,
		YearOfDeath: request.YearOfDeath,
	}
}

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
	var request characterRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	created, err := handler.service.Create(
		request.toCharacter(),
		request.OccupationIDs,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusCreated, created)
}

func (handler *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseUint(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		http.Error(w, "Id inválido para el personaje", http.StatusBadRequest)
		return
	}

	var request characterRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	updatedCharacter, err := handler.service.Update(
		uint(id),
		request.toCharacter(),
		request.OccupationIDs,
	)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		http.Error(w, "Personaje no encontrado", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	writeJSON(w, http.StatusOK, updatedCharacter)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
