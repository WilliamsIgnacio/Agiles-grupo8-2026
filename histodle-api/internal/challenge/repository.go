package challenge

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) FindAll() ([]Challenge, error) {
	challenges := make([]Challenge, 0)
	err := repository.db.Preload("Character.Difficulty").
		Preload("Character.Occupations").
		Preload("Character.Hints").
		Order("id").
		Find(&challenges).Error
	return challenges, err
}

func (repository *Repository) FindByID(id uint) (Challenge, error) {
	var challenge Challenge
	err := repository.db.Preload("Character.Difficulty").
		Preload("Character.Occupations").
		Preload("Character.Hints").
		First(&challenge, id).Error
	return challenge, err
}

func (repository *Repository) Create(challenge Challenge) (Challenge, error) {
	err := repository.db.Omit("Character").Create(&challenge).Error
	if err != nil {
		return Challenge{}, err
	}
	return repository.FindByID(challenge.ID)
}

func (repository *Repository) CharacterExists(characterID uint) (bool, error) {
	var count int64
	err := repository.db.Table("characters").Where("id = ?", characterID).Count(&count).Error
	return count > 0, err
}
