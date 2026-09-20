package character

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) FindAll() ([]Character, error) {
	var characters []Character
	err := repository.db.Find(&characters).Error
	return characters, err
}

func (repository *Repository) FindByID(id uint) (Character, error) {
	var character Character
	err := repository.db.First(&character, id).Error
	return character, err
}

func (repository *Repository) Create(character Character) (Character, error) {
	err := repository.db.Create(&character).Error
	return character, err
}
