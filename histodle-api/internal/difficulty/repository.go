package difficulty

import (
	"errors"

	"gorm.io/gorm"
)

var ErrDifficultyInUse = errors.New("la dificultad está asignada a uno o más personajes")

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) FindAll() ([]Difficulty, error) {
	difficulties := make([]Difficulty, 0)
	err := repository.db.Order("id").Find(&difficulties).Error
	return difficulties, err
}

func (repository *Repository) FindByID(id uint) (Difficulty, error) {
	var difficulty Difficulty
	err := repository.db.First(&difficulty, id).Error
	return difficulty, err
}

func (repository *Repository) Create(difficulty Difficulty) (Difficulty, error) {
	err := repository.db.Create(&difficulty).Error
	return difficulty, err
}

func (repository *Repository) Update(id uint, difficulty Difficulty) (Difficulty, error) {
	var existing Difficulty
	if err := repository.db.First(&existing, id).Error; err != nil {
		return Difficulty{}, err
	}

	if err := repository.db.Model(&existing).Update("name", difficulty.Name).Error; err != nil {
		return Difficulty{}, err
	}
	existing.Name = difficulty.Name
	return existing, nil
}

func (repository *Repository) Delete(id uint) error {
	var difficulty Difficulty
	if err := repository.db.First(&difficulty, id).Error; err != nil {
		return err
	}

	var assignedCharacters int64
	if err := repository.db.Table("characters").
		Where("difficulty_id = ?", difficulty.ID).
		Count(&assignedCharacters).Error; err != nil {
		return err
	}
	if assignedCharacters > 0 {
		return ErrDifficultyInUse
	}

	return repository.db.Delete(&difficulty).Error
}
