package occupations

import (
	"fmt"
)

type Service struct {
	repository *OccupationRepository
}

func NewService(repository *OccupationRepository) *Service {
	return &Service{repository: repository}
}	

func (service *Service) GetAllOccupations() ([]Occupation, error) {
	return service.repository.FindAll()
}

func (service *Service) GetOccupationByID(id uint) (Occupation, error) {
	occupation, err := service.repository.FindByID(id)
	if err != nil {
		return Occupation{}, fmt.Errorf("Error al obtener la ocupación: %w", err)
	}	
	return occupation, nil
}

func (service *Service) CreateOccupation(occupation Occupation) (Occupation, error) {
	if occupation.Name == "" {
		return Occupation{}, fmt.Errorf("El nombre de la ocupación no puede estar vacío")
	}
	return service.repository.Create(occupation)
}

