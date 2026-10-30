package score

import (
	"fmt"
	"math"
)

const MaxAttempts = 10

func Calculate(score Score, attemptsUsed, hintsUsed int, won bool) (uint, error) {
	if err := validateValues(score); err != nil {
		return 0, fmt.Errorf("configuración de puntaje inválida: %w", err)
	}

	if attemptsUsed < 1 || attemptsUsed > MaxAttempts {
		return 0, fmt.Errorf(
			"la cantidad de intentos debe estar entre 1 y %d",
			MaxAttempts,
		)
	}

	if hintsUsed < 0 {
		return 0, fmt.Errorf("la cantidad de pistas no puede ser negativa")
	}

	if !won {
		return 0, nil
	}

	baseScore := float64(score.MaxScore - score.MinScore)

	attemptFactor := math.Pow(
		1-score.AttemptPenaltyPercentage/100,
		float64(attemptsUsed-1),
	)

	hintFactor := math.Pow(
		1-score.HintPenaltyPercentage/100,
		float64(hintsUsed),
	)

	finalScore := float64(score.MinScore) +
		baseScore*attemptFactor*hintFactor

	// Protección adicional ante imprecisiones decimales.
	finalScore = math.Max(
		float64(score.MinScore),
		math.Min(float64(score.MaxScore), finalScore),
	)

	return uint(math.Round(finalScore)), nil
}
