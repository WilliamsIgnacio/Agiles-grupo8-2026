package character

import (
	"fmt"
	"strings"

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
	err := repository.db.Preload("Occupations").Preload("Hints").Find(&characters).Error
	return characters, err
}

func (repository *Repository) FindByID(id uint) (Character, error) {
	var character Character
	err := repository.db.Preload("Occupations").Preload("Hints").First(&character, id).Error
	return character, err
}

func (repository *Repository) Create(character Character, occupationIDs []uint) (Character, error) {
	character.ID = 0

	err := repository.db.Transaction(func(tx *gorm.DB) error {
		selectedOccupations, err := findOccupations(tx, occupationIDs)
		if err != nil {
			return err
		}

		if err := tx.Omit("Occupations", "Hints").Create(&character).Error; err != nil {
			return err
		}

		if err := replaceHints(tx, character.ID, character.Hints); err != nil {
			return err
		}

		if err := tx.Model(&character).Association("Occupations").Replace(selectedOccupations); err != nil {
			return err
		}

		return tx.Preload("Occupations").Preload("Hints").First(&character, character.ID).Error
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

		if character.Hints != nil {
			if err := replaceHints(tx, id, character.Hints); err != nil {
				return err
			}
		}

		return tx.Preload("Occupations").Preload("Hints").First(&updated, id).Error
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

func replaceHints(tx *gorm.DB, characterID uint, hints []Hint) error {
	var existing []Hint
	if err := tx.Where("character_id = ?", characterID).Find(&existing).Error; err != nil {
		return err
	}

	existingByID := make(map[uint]Hint, len(existing))
	for _, hint := range existing {
		existingByID[hint.ID] = hint
	}

	seenIDs := make(map[uint]struct{}, len(hints))
	keepIDs := make([]uint, 0, len(hints))
	for _, hint := range hints {
		if strings.TrimSpace(hint.Text) == "" {
			return fmt.Errorf("el texto de la pista no puede estar vacío")
		}
		if hint.ID != 0 {
			if _, duplicate := seenIDs[hint.ID]; duplicate {
				return fmt.Errorf("el ID de pista %d está repetido", hint.ID)
			}
			if _, belongsToCharacter := existingByID[hint.ID]; !belongsToCharacter {
				return fmt.Errorf("la pista %d no pertenece al personaje", hint.ID)
			}
			seenIDs[hint.ID] = struct{}{}
			if err := tx.Model(&Hint{}).
				Where("id = ? AND character_id = ?", hint.ID, characterID).
				Update("text", strings.TrimSpace(hint.Text)).Error; err != nil {
				return err
			}
			keepIDs = append(keepIDs, hint.ID)
			continue
		}

		newHint := Hint{CharacterID: characterID, Text: strings.TrimSpace(hint.Text)}
		if err := tx.Create(&newHint).Error; err != nil {
			return err
		}
		keepIDs = append(keepIDs, newHint.ID)
	}

	query := tx.Where("character_id = ?", characterID)
	if len(keepIDs) > 0 {
		query = query.Where("id NOT IN ?", keepIDs)
	}
	return query.Delete(&Hint{}).Error
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
