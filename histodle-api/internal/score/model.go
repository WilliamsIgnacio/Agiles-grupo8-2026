package score

type Score struct {
	ID                       uint    `gorm:"primaryKey" json:"id"`
	LevelID                  uint    `gorm:"not null;unique" json:"levelId"`
	MaxScore                 uint    `gorm:"not null" json:"maxScore"`
	MinScore                 uint    `gorm:"not null;default:0" json:"minScore"`
	AttemptPenaltyPercentage float64 `gorm:"not null" json:"attemptPenaltyPercentage"`
	HintPenaltyPercentage    float64 `gorm:"not null" json:"hintPenaltyPercentage"`
}
