package dailychallenge

import "time"

type record struct {
	Date        time.Time `gorm:"column:challenge_date;type:date;primaryKey"`
	CharacterID uint      `gorm:"not null"`
}

func (record) TableName() string {
	return "daily_challenges"
}

type DailyChallenge struct {
	Date        string `json:"date"`
	CharacterID uint   `json:"characterId"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
