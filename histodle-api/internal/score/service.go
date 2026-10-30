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

func (service *Service) Create(score Score) (Score, error) {
	if score.LevelID == 0 {
		return Score{}, fmt.Errorf("el nivel es obligatorio")
	}

	if score.MinScore > score.MaxScore {
		return Score{}, fmt.Errorf("el puntaje mínimo no puede superar al puntaje máximo")
	}

	if math.IsNaN(score.AttemptPenaltyPercentage) ||
		math.IsInf(score.AttemptPenaltyPercentage, 0) ||
		score.AttemptPenaltyPercentage < 0 ||
		score.AttemptPenaltyPercentage > 100 {
		return Score{}, fmt.Errorf("el porcentaje de resta por intento debe estar entre 0 y 100")
	}

	if math.IsNaN(score.HintPenaltyPercentage) ||
		math.IsInf(score.HintPenaltyPercentage, 0) ||
		score.HintPenaltyPercentage < 0 ||
		score.HintPenaltyPercentage > 100 {
		return Score{}, fmt.Errorf("el porcentaje de resta por pista debe estar entre 0 y 100")
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
