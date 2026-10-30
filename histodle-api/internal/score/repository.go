package score

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) Create(score Score) (Score, error) {
	err := repository.db.Create(&score).Error
	return score, err
}
