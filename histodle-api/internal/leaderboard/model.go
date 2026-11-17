package leaderboard

import "time"

type ChallengeResult struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"not null" json:"userId"`
	ChallengeID  uint      `gorm:"not null" json:"challengeId"`
	Points       uint      `gorm:"not null" json:"points"`
	AttemptsUsed int       `gorm:"not null" json:"attemptsUsed"`
	HintsUsed    int       `gorm:"not null" json:"hintsUsed"`
	Won          bool      `gorm:"not null" json:"won"`
	CreatedAt    time.Time `json:"createdAt"`
}

type Entry struct {
	Position         int    `json:"position"`
	Name             string `json:"name"`
	ChallengesPlayed int64  `json:"challengesPlayed"`
	TotalPoints      uint64 `json:"totalPoints"`
}

type RecordInput struct {
	AttemptsUsed int  `json:"attemptsUsed"`
	HintsUsed    int  `json:"hintsUsed"`
	Won          bool `json:"won"`
}

type RecordResult struct {
	Score   uint `json:"score"`
	Counted bool `json:"counted"`
}
