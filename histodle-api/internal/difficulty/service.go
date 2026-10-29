package difficulty

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

func (service *Service) List() ([]Difficulty, error) {
	return service.repository.FindAll()
}

func (service *Service) Get(id uint) (Difficulty, error) {
	difficulty, err := service.repository.FindByID(id)
	if err != nil {
		return Difficulty{}, fmt.Errorf("Error al obtener la dificultad: %w", err)
	}
	return difficulty, nil
}

func (service *Service) Create(difficulty Difficulty) (Difficulty, error) {
	difficulty.Name = strings.TrimSpace(difficulty.Name)
	if difficulty.Name == "" {
		return Difficulty{}, fmt.Errorf("El nombre de la dificultad no puede estar vacío")
	}
	return service.repository.Create(difficulty)
}

func (service *Service) Update(id uint, difficulty Difficulty) (Difficulty, error) {
	difficulty.Name = strings.TrimSpace(difficulty.Name)
	if difficulty.Name == "" {
		return Difficulty{}, fmt.Errorf("El nombre de la dificultad no puede estar vacío")
	}
	updated, err := service.repository.Update(id, difficulty)
	if err != nil {
		return Difficulty{}, fmt.Errorf("Error al modificar la dificultad: %w", err)
	}
	return updated, nil
}

func (service *Service) Delete(id uint) error {
	return service.repository.Delete(id)
}
