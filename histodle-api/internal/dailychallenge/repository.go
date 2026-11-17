package dailychallenge

import (
	"errors"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var ErrNoCharacters = errors.New("no hay personajes disponibles para el desafío diario")

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) findOrCreate(date time.Time) (record, error) {
	dailyChallenge, err := repository.find(date)
	if err == nil {
		return dailyChallenge, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return record{}, err
	}

	var candidate struct {
		ID uint
	}
	if err := repository.db.Table("characters").
		Select("id").
		Order("RANDOM()").
		Limit(1).
		Scan(&candidate).Error; err != nil {
		return record{}, err
	}
	if candidate.ID == 0 {
		return record{}, ErrNoCharacters
	}

	dailyChallenge = record{Date: date, CharacterID: candidate.ID}
	if err := repository.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "challenge_date"}},
		DoNothing: true,
	}).Create(&dailyChallenge).Error; err != nil {
		return record{}, err
	}

	return repository.find(date)
}

func (repository *Repository) find(date time.Time) (record, error) {
	var dailyChallenge record
	err := repository.db.First(&dailyChallenge, "challenge_date = ?", date.Format(time.DateOnly)).Error
	return dailyChallenge, err
}
