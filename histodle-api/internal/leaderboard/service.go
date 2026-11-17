package leaderboard

import (
	"errors"
	"fmt"
	"time"

	"histodle-api/internal/score"
)

var ErrInvalidResult = errors.New("resultado de desafío inválido")

type repository interface {
	DifficultyIDForChallenge(challengeID uint) (uint, error)
	DifficultyIDForDailyChallenge(date time.Time) (uint, error)
	InsertIfAbsent(result ChallengeResult) (bool, error)
	InsertDailyIfAbsent(result DailyChallengeResult) (bool, error)
	Ranking() ([]Entry, error)
}

type scoreCalculator interface {
	CalculateByDifficultyID(difficultyID uint, input score.CalculationInput) (score.CalculationResult, error)
}

type Service struct {
	repository repository
	scores     scoreCalculator
}

func NewService(repository repository, scores scoreCalculator) *Service {
	return &Service{repository: repository, scores: scores}
}

func (service *Service) Record(userID, challengeID uint, input RecordInput) (RecordResult, error) {
	if userID == 0 {
		return RecordResult{}, fmt.Errorf("el usuario es obligatorio")
	}
	if challengeID == 0 {
		return RecordResult{}, fmt.Errorf("el desafío es obligatorio")
	}
	return service.record(userID, input, func() (uint, error) {
		return service.repository.DifficultyIDForChallenge(challengeID)
	}, func(points uint) (bool, error) {
		return service.repository.InsertIfAbsent(ChallengeResult{
			UserID:       userID,
			ChallengeID:  challengeID,
			Points:       points,
			AttemptsUsed: input.AttemptsUsed,
			HintsUsed:    input.HintsUsed,
			Won:          input.Won,
		})
	})
}

func (service *Service) RecordDaily(userID uint, date time.Time, input RecordInput) (RecordResult, error) {
	if userID == 0 {
		return RecordResult{}, fmt.Errorf("el usuario es obligatorio")
	}
	if date.IsZero() {
		return RecordResult{}, fmt.Errorf("%w: la fecha del desafío es obligatoria", ErrInvalidResult)
	}
	return service.record(userID, input, func() (uint, error) {
		return service.repository.DifficultyIDForDailyChallenge(date)
	}, func(points uint) (bool, error) {
		return service.repository.InsertDailyIfAbsent(DailyChallengeResult{
			UserID:        userID,
			ChallengeDate: date,
			Points:        points,
			AttemptsUsed:  input.AttemptsUsed,
			HintsUsed:     input.HintsUsed,
			Won:           input.Won,
		})
	})
}

func (service *Service) record(
	userID uint,
	input RecordInput,
	getDifficultyID func() (uint, error),
	insert func(points uint) (bool, error),
) (RecordResult, error) {
	if err := validateRecordInput(input); err != nil {
		return RecordResult{}, err
	}

	difficultyID, err := getDifficultyID()
	if err != nil {
		return RecordResult{}, fmt.Errorf("error al obtener la dificultad del desafío: %w", err)
	}

	calculation, err := service.scores.CalculateByDifficultyID(difficultyID, score.CalculationInput{
		AttemptsUsed: input.AttemptsUsed,
		HintsUsed:    input.HintsUsed,
		Won:          input.Won,
	})
	if err != nil {
		return RecordResult{}, err
	}

	counted, err := insert(calculation.Score)
	if err != nil {
		return RecordResult{}, fmt.Errorf("error al registrar el resultado del desafío: %w", err)
	}

	return RecordResult{Score: calculation.Score, Counted: counted}, nil
}

func validateRecordInput(input RecordInput) error {
	minAttempts := 0
	if input.Won {
		minAttempts = 1
	}
	if input.AttemptsUsed < minAttempts || input.AttemptsUsed > score.MaxAttempts {
		return fmt.Errorf(
			"%w: la cantidad de intentos debe estar entre %d y %d",
			ErrInvalidResult,
			minAttempts,
			score.MaxAttempts,
		)
	}
	if input.HintsUsed < 0 {
		return fmt.Errorf("%w: la cantidad de pistas no puede ser negativa", ErrInvalidResult)
	}
	return nil
}

func (service *Service) Ranking() ([]Entry, error) {
	entries, err := service.repository.Ranking()
	if err != nil {
		return nil, fmt.Errorf("error al obtener el ranking: %w", err)
	}
	return entries, nil
}
