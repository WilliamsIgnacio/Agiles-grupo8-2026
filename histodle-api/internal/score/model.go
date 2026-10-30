package score

import "histodle-api/internal/difficulty"

type Score struct {
	ID                       uint                  `gorm:"primaryKey" json:"id"`
	DifficultyID             uint                  `gorm:"not null;unique" json:"difficultyId"`
	Difficulty               difficulty.Difficulty `gorm:"foreignKey:DifficultyID;references:ID" json:"difficulty"`
	MaxScore                 uint                  `gorm:"not null" json:"maxScore"`
	MinScore                 uint                  `gorm:"not null;default:0" json:"minScore"`
	AttemptPenaltyPercentage float64               `gorm:"not null" json:"attemptPenaltyPercentage"`
	HintPenaltyPercentage    float64               `gorm:"not null" json:"hintPenaltyPercentage"`
}
