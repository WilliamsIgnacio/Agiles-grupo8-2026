package category

import (
    "encoding/json"
    "net/http"
)

type Handler struct {
    service *Service
}

func NewHandler(service *Service) *Handler {
    return &Handler{service: service}
}

func (handler *Handler) List(w http.ResponseWriter, _ *http.Request) {
    categories, err := handler.service.List()
    if err != nil {
        http.Error(w, "Error al obtener las categorías", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    if err := json.NewEncoder(w).Encode(categories); err != nil {
        http.Error(w, "Error al responder las categorías", http.StatusInternalServerError)
    }
}