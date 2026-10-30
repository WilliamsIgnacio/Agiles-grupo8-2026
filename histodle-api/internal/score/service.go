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

type CalculationInput struct {
	AttemptsUsed int  `json:"attemptsUsed"`
	HintsUsed    int  `json:"hintsUsed"`
	Won          bool `json:"won"`
}

type CalculationResult struct {
	Score uint `json:"score"`
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

func (service *Service) GetByDifficultyID(difficultyID uint) (Score, error) {
	if difficultyID == 0 {
		return Score{}, fmt.Errorf("la dificultad es obligatoria")
	}

	score, err := service.repository.FindByDifficultyID(difficultyID)
	if err != nil {
		return Score{}, fmt.Errorf("error al obtener el puntaje de la dificultad: %w", err)
	}
	return score, nil
}

func (service *Service) CalculateByDifficultyID(difficultyID uint, input CalculationInput) (CalculationResult, error) {
	config, err := service.GetByDifficultyID(difficultyID)
	if err != nil {
		return CalculationResult{}, err
	}

	finalScore, err := Calculate(config, input.AttemptsUsed, input.HintsUsed, input.Won)
	if err != nil {
		return CalculationResult{}, err
	}
	return CalculationResult{Score: finalScore}, nil
}

func (service *Service) Create(score Score) (Score, error) {
	if score.DifficultyID == 0 {
		return Score{}, fmt.Errorf("la dificultad es obligatoria")
	}
	if err := validateValues(score); err != nil {
		return Score{}, err
	}

	created, err := service.repository.Create(score)
	if err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return Score{}, fmt.Errorf("ya existe una configuración de puntaje para esta dificultad")
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
			return Score{}, fmt.Errorf("ya existe una configuración de puntaje para esta dificultad")
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
