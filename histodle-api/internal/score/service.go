package score

import (
	"errors"
	"fmt"
	"math"

	"gorm.io/gorm"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (service *Service) List() ([]Score, error) {
	return service.repository.FindAll()
}

func (service *Service) Get(id uint) (Score, error) {
	score, err := service.repository.FindByID(id)
	if err != nil {
		return Score{}, fmt.Errorf("error al obtener el puntaje: %w", err)
	}
	return score, nil
}

func (service *Service) GetByLevelID(levelID uint) (Score, error) {
	if levelID == 0 {
		return Score{}, fmt.Errorf("el nivel es obligatorio")
	}

	score, err := service.repository.FindByLevelID(levelID)
	if err != nil {
		return Score{}, fmt.Errorf("error al obtener el puntaje del nivel: %w", err)
	}
	return score, nil
}

func (service *Service) Create(score Score) (Score, error) {
	if score.LevelID == 0 {
		return Score{}, fmt.Errorf("el nivel es obligatorio")
	}
	if err := validateValues(score); err != nil {
		return Score{}, err
	}

	created, err := service.repository.Create(score)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return Score{}, fmt.Errorf("ya existe una configuración de puntaje para este nivel")
		}
		return Score{}, err
	}

	return created, nil
}

func (service *Service) Update(id uint, score Score) (Score, error) {
	if id == 0 {
		return Score{}, fmt.Errorf("el ID del puntaje es obligatorio")
	}

	if err := validateValues(score); err != nil {
		return Score{}, err
	}

	updated, err := service.repository.Update(id, score)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return Score{}, fmt.Errorf("ya existe una configuración de puntaje para este nivel")
		}
		return Score{}, fmt.Errorf("error al actualizar el puntaje: %w", err)
	}
	return updated, nil
}

func (service *Service) Delete(id uint) error {
	if id == 0 {
		return fmt.Errorf("el ID del puntaje es obligatorio")
	}
	return service.repository.Delete(id)
}

func validateValues(score Score) error {
	if score.MinScore > score.MaxScore {
		return fmt.Errorf("el puntaje mínimo no puede superar al puntaje máximo")
	}

	if math.IsNaN(score.AttemptPenaltyPercentage) ||
		math.IsInf(score.AttemptPenaltyPercentage, 0) ||
		score.AttemptPenaltyPercentage < 0 ||
		score.AttemptPenaltyPercentage > 100 {
		return fmt.Errorf("el porcentaje de resta por intento debe estar entre 0 y 100")
	}

	if math.IsNaN(score.HintPenaltyPercentage) ||
		math.IsInf(score.HintPenaltyPercentage, 0) ||
		score.HintPenaltyPercentage < 0 ||
		score.HintPenaltyPercentage > 100 {
		return fmt.Errorf("el porcentaje de resta por pista debe estar entre 0 y 100")
	}
	return nil
}
