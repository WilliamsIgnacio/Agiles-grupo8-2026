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

func (repository *Repository) FindAll() ([]Score, error) {
	scores := make([]Score, 0)
	err := repository.db.Order("level_id").Find(&scores).Error
	return scores, err
}

func (repository *Repository) FindByID(id uint) (Score, error) {
	var score Score
	err := repository.db.First(&score, id).Error
	return score, err
}

func (repository *Repository) FindByLevelID(levelID uint) (Score, error) {
	var score Score
	err := repository.db.Where("level_id = ?", levelID).First(&score).Error
	return score, err
}
