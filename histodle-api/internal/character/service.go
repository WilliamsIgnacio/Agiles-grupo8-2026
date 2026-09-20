package character

import "fmt"

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

	return service.repository.Create(character)
}
