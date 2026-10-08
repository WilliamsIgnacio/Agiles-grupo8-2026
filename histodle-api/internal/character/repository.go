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

func (repository *Repository) Update(id uint, character Character) (Character, error) {
    var existing Character
    if err := repository.db.First(&existing, id).Error; err != nil {
        return Character{}, err
    }

    character.ID = id

    if err := repository.db.Model(&existing).Updates(map[string]interface{}{
        "name":         character.Name,
        "gender":       character.Gender,
        "period":       character.Period,
        "country":      character.Country,
        "continent":    character.Continent,
        "know_for":     character.KnowFor,
        "position":     character.Position,
        "birth_year":   character.BirthYear,
        "year_of_death": character.YearOfDeath,
    }).Error; err != nil {
        return Character{}, err
    }

    return character, nil
}

func (repository *Repository) Delete(id uint) error {
    var character Character
    if err := repository.db.First(&character, id).Error; err != nil {
        return err
    }

    return repository.db.Delete(&character).Error
}