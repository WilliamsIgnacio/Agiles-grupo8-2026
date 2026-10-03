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

func (service *Service) Create(character Character) (Character, error) {
	if character.Name == "" {
		return Character{}, fmt.Errorf("El nombre del personaje no puede estar vacío")
	}
	if character.Gender != "Masculino" && character.Gender != "Femenino" {
		return Character{}, fmt.Errorf("El genero del personaje solo puede ser Masculino o Femenino")
	}
	periods := []string{"Antiguedad", "Edad Media", "Edad Moderna", "Edad Contemporanea"}
	if !slices.Contains(periods, character.Period) {
		return Character{}, fmt.Errorf("El periodo del personaje solo puede ser", periods)
	}
	continents := []string{"Europa", "Asia", "America", "Oceania", "Africa"}
	if !slices.Contains(continents, character.Continent) {
		return Character{}, fmt.Errorf("El continente del personaje solo puede ser", continents)
	}

	return service.repository.Create(character)
}
