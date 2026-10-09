package occupations

import "gorm.io/gorm"

type OccupationRepository struct {
	db *gorm.DB
}

func NewOccupationRepository(db *gorm.DB) *OccupationRepository {
	return &OccupationRepository{db: db}
}

func (repository *OccupationRepository) FindAll() ([]Occupation, error) {
	var occupations []Occupation
	err := repository.db.Find(&occupations).Error
	return occupations, err
}

func (repository *OccupationRepository) FindByID(id uint) (Occupation, error) {
	var occupation Occupation
	err := repository.db.First(&occupation, id).Error
	return occupation, err
}

func (repository *OccupationRepository) Create(occupation Occupation) (Occupation, error) {
	err := repository.db.Create(&occupation).Error
	return occupation, err
}

func (repository *OccupationRepository) Update(id uint, occupation Occupation) (Occupation, error) {
	var existing Occupation
	if err := repository.db.First(&existing, id).Error; err != nil {
		return Occupation{}, err
	}

	if err := repository.db.Model(&existing).Updates(map[string]interface{}{
		"name": occupation.Name,
	}).Error; err != nil {
		return Occupation{}, err
	}

	existing.Name = occupation.Name
	return existing, nil
}
