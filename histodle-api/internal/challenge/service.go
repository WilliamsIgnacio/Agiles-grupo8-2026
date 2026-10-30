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
	if err := service.validate(challenge); err != nil {
		return Challenge{}, err
	}
	return service.repository.Create(challenge)
}

func (service *Service) Update(challenge Challenge) (Challenge, error) {
	challenge.Name = strings.TrimSpace(challenge.Name)
	challenge.Description = strings.TrimSpace(challenge.Description)
	if err := service.validate(challenge); err != nil {
		return Challenge{}, err
	}
	if _, err := service.repository.FindByID(challenge.ID); err != nil {
		return Challenge{}, fmt.Errorf("Error al obtener el desafío: %w", err)
	}
	return service.repository.Update(challenge)
}

func (service *Service) Delete(id uint) error {
	if err := service.repository.Delete(id); err != nil {
		return fmt.Errorf("Error al eliminar el desafío: %w", err)
	}
	return nil
}

func (service *Service) validate(challenge Challenge) error {
	if challenge.Name == "" {
		return fmt.Errorf("El nombre del desafío no puede estar vacío")
	}
	if challenge.Description == "" {
		return fmt.Errorf("La descripción del desafío no puede estar vacía")
	}
	if challenge.CharacterID == 0 {
		return fmt.Errorf("El personaje objetivo es obligatorio")
	}

	exists, err := service.repository.CharacterExists(challenge.CharacterID)
	if err != nil {
		return fmt.Errorf("Error al validar el personaje objetivo: %w", err)
	}
	if !exists {
		return fmt.Errorf("El personaje objetivo no existe")
	}

	return nil
}
