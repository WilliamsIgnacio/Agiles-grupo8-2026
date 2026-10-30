package challenge

import "histodle-api/internal/character"

type Challenge struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	CharacterID uint                `gorm:"not null" json:"characterId"`
	Name        string              `gorm:"not null" json:"name"`
	Description string              `gorm:"type:text;not null" json:"description"`
	Character   character.Character `gorm:"foreignKey:CharacterID" json:"character"`
}
