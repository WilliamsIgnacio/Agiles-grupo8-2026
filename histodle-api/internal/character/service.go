package character

import (
	"fmt"
	"slices"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (service *Service) List() ([]Character, error) {
	return service.repository.FindAll()
}

func (service *Service) Get(id uint) (Character, error) {
	character, err := service.repository.FindByID(id)
	if err != nil {
		return Character{}, fmt.Errorf("Error al obtener el personaje: %w", err)
	}

	return character, nil
}

func (service *Service) Create(character Character, occupationIDs []uint) (Character, error) {
	if character.Name == "" {
		return Character{}, fmt.Errorf("El nombre del personaje no puede estar vacío")
	}
	if character.Gender != "Masculino" && character.Gender != "Femenino" {
		return Character{}, fmt.Errorf("El genero del personaje solo puede ser Masculino o Femenino")
	}
	periods := []string{"Edad Antigua", "Edad Media", "Edad Moderna", "Edad Contemporanea"}
	if !slices.Contains(periods, character.Period) {
		return Character{}, fmt.Errorf("El periodo del personaje solo puede ser: %v", periods)
	}
	continents := []string{"Europa", "Asia", "America", "Oceania", "Africa"}
	if !slices.Contains(continents, character.Continent) {
		return Character{}, fmt.Errorf("El continente del personaje solo puede ser: %v", continents)
	}

	return service.repository.Create(character, occupationIDs)
}

func (service *Service) Update(id uint, character Character, occupationIDs []uint) (Character, error) {
	if character.Name == "" {
		return Character{}, fmt.Errorf("El nombre del personaje no puede estar vacío")
	}
	if character.Gender != "Masculino" && character.Gender != "Femenino" {
		return Character{}, fmt.Errorf("El genero del personaje solo puede ser Masculino o Femenino")
	}

	periods := []string{"Edad Antigua", "Edad Media", "Edad Moderna", "Edad Contemporanea"}
	if !slices.Contains(periods, character.Period) {
		return Character{}, fmt.Errorf("El periodo del personaje solo puede ser uno de: %v", periods)
	}

	continents := []string{"Europa", "Asia", "America", "Oceania", "Africa"}
	if !slices.Contains(continents, character.Continent) {
		return Character{}, fmt.Errorf("El continente del personaje solo puede ser uno de: %v", continents)
	}

	updatedCharacter, err := service.repository.Update(id, character, occupationIDs)
	if err != nil {
		return Character{}, fmt.Errorf("Error al actualizar el personaje: %w", err)
	}

	return updatedCharacter, nil
}

func (service *Service) Delete(id uint) error {
    if err := service.repository.Delete(id); err != nil {
        return fmt.Errorf("Error al eliminar el personaje: %w", err)
    }

    return nil
}