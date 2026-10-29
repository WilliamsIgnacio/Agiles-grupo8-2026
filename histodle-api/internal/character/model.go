package character

import "histodle-api/internal/occupation"
import "histodle-api/internal/difficulty"

type Character struct {
	ID           uint                    `gorm:"primaryKey" json:"id"`
	Name         string                  `json:"name"`
	DifficultyID uint                    `gorm:"not null" json:"difficultyId"`
	Difficulty   difficulty.Difficulty   `gorm:"foreignKey:DifficultyID" json:"difficulty"`
	Gender       string                  `json:"gender"`
	Period       string                  `json:"period"`
	Country      string                  `json:"country"`
	Continent    string                  `json:"continent"`
	KnowFor      string                  `json:"knowFor"`
	Position     string                  `json:"position"`
	BirthYear    int32                   `json:"birthYear"`
	YearOfDeath  int32                   `json:"yearOfDeath"`
	Occupations  []occupation.Occupation `gorm:"many2many:character_occupations;" json:"occupations"`
	Hints        []Hint                  `gorm:"foreignKey:CharacterID" json:"hints"`
}

type Hint struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	CharacterID uint   `gorm:"not null" json:"characterId"`
	Text        string `gorm:"type:text;not null" json:"text"`
}
