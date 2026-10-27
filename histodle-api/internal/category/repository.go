package category

import "gorm.io/gorm"

type Repository struct {
    db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
    return &Repository{db: db}
}

func (repository *Repository) FindAll() ([]Category, error) {
    categories := make([]Category, 0)
    err := repository.db.Order("name").Find(&categories).Error
    return categories, err
}