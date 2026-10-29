package challenge

import (
	"fmt"
	"strings"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (service *Service) List() ([]Challenge, error) {
	return service.repository.FindAll()
}

func (service *Service) Get(id uint) (Challenge, error) {
	challenge, err := service.repository.FindByID(id)
	if err != nil {
		return Challenge{}, fmt.Errorf("Error al obtener el desafío: %w", err)
	}
	return challenge, nil
}

func (service *Service) Create(challenge Challenge) (Challenge, error) {
	challenge.Name = strings.TrimSpace(challenge.Name)
	challenge.Description = strings.TrimSpace(challenge.Description)
	if challenge.Name == "" {
		return Challenge{}, fmt.Errorf("El nombre del desafío no puede estar vacío")
	}
	if challenge.Description == "" {
		return Challenge{}, fmt.Errorf("La descripción del desafío no puede estar vacía")
	}
	if challenge.CharacterID == 0 {
		return Challenge{}, fmt.Errorf("El personaje objetivo es obligatorio")
	}

	exists, err := service.repository.CharacterExists(challenge.CharacterID)
	if err != nil {
		return Challenge{}, fmt.Errorf("Error al validar el personaje objetivo: %w", err)
	}
	if !exists {
		return Challenge{}, fmt.Errorf("El personaje objetivo no existe")
	}

	return service.repository.Create(challenge)
}
