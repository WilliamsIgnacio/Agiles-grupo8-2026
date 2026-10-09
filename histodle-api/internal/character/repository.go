package character

import (
	"fmt"

	occupation "histodle-api/internal/occupation"

	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) FindAll() ([]Character, error) {
	var characters []Character
	err := repository.db.Preload("Occupations").Find(&characters).Error
	return characters, err
}

func (repository *Repository) FindByID(id uint) (Character, error) {
	var character Character
	err := repository.db.Preload("Occupations").First(&character, id).Error
	return character, err
}

func (repository *Repository) Create(character Character, occupationIDs []uint) (Character, error) {
	character.ID = 0

	err := repository.db.Transaction(func(tx *gorm.DB) error {
		selectedOccupations, err := findOccupations(tx, occupationIDs)
		if err != nil {
			return err
		}

		if err := tx.Omit("Occupations").Create(&character).Error; err != nil {
			return err
		}

		if err := tx.Model(&character).Association("Occupations").Replace(selectedOccupations); err != nil {
			return err
		}

		return tx.Preload("Occupations").First(&character, character.ID).Error
	})
	if err != nil {
		return Character{}, err
	}

	return character, nil
}

func (repository *Repository) Update(id uint, character Character, occupationIDs []uint) (Character, error) {
	var updated Character
	err := repository.db.Transaction(func(tx *gorm.DB) error {
		var existing Character
		if err := tx.First(&existing, id).Error; err != nil {
			return err
		}

		selectedOccupations, err := findOccupations(tx, occupationIDs)
		if err != nil {
			return err
		}

		if err := tx.Model(&existing).Updates(map[string]interface{}{
			"name":          character.Name,
			"gender":        character.Gender,
			"period":        character.Period,
			"country":       character.Country,
			"continent":     character.Continent,
			"know_for":      character.KnowFor,
			"position":      character.Position,
			"birth_year":    character.BirthYear,
			"year_of_death": character.YearOfDeath,
		}).Error; err != nil {
			return err
		}

		if err := tx.Model(&existing).Association("Occupations").Replace(selectedOccupations); err != nil {
			return err
		}

		return tx.Preload("Occupations").First(&updated, id).Error
	})
	if err != nil {
		return Character{}, err
	}

	return updated, nil
}

func (repository *Repository) Delete(id uint) error {
	var character Character
	if err := repository.db.First(&character, id).Error; err != nil {
		return err
	}

	return repository.db.Delete(&character).Error
}

func findOccupations(tx *gorm.DB, occupationIDs []uint) ([]occupation.Occupation, error) {
	uniqueIDs := make([]uint, 0, len(occupationIDs))
	seenIDs := make(map[uint]struct{}, len(occupationIDs))
	for _, id := range occupationIDs {
		if id == 0 {
			return nil, fmt.Errorf("el ID de ocupación debe ser mayor que cero")
		}
		if _, exists := seenIDs[id]; exists {
			return nil, fmt.Errorf("el ID de ocupación %d está repetido", id)
		}
		seenIDs[id] = struct{}{}
		uniqueIDs = append(uniqueIDs, id)
	}

	selectedOccupations := make([]occupation.Occupation, 0, len(uniqueIDs))
	if len(uniqueIDs) == 0 {
		return selectedOccupations, nil
	}

	if err := tx.Where("id IN ?", uniqueIDs).Find(&selectedOccupations).Error; err != nil {
		return nil, err
	}
	if len(selectedOccupations) != len(uniqueIDs) {
		return nil, fmt.Errorf("una o más ocupaciones no existen")
	}

	return selectedOccupations, nil
}
