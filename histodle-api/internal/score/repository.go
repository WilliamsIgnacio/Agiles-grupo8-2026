package score

import "gorm.io/gorm"

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) Create(score Score) (Score, error) {
	err := repository.db.Omit("Difficulty").Create(&score).Error
	return score, err
}

func (repository *Repository) FindAll() ([]Score, error) {
	scores := make([]Score, 0)
	err := repository.db.Preload("Difficulty").Order("difficulty_id").Find(&scores).Error
	return scores, err
}

func (repository *Repository) FindByID(id uint) (Score, error) {
	var score Score
	err := repository.db.Preload("Difficulty").First(&score, id).Error
	return score, err
}

func (repository *Repository) FindByDifficultyID(difficultyID uint) (Score, error) {
	var score Score
	err := repository.db.Preload("Difficulty").Where("difficulty_id = ?", difficultyID).First(&score).Error
	return score, err
}

func (repository *Repository) Update(id uint, score Score) (Score, error) {
	var existing Score
	if err := repository.db.First(&existing, id).Error; err != nil {
		return Score{}, err
	}

	err := repository.db.Model(&existing).Updates(map[string]any{
		"max_score":                  score.MaxScore,
		"min_score":                  score.MinScore,
		"attempt_penalty_percentage": score.AttemptPenaltyPercentage,
		"hint_penalty_percentage":    score.HintPenaltyPercentage,
	}).Error
	if err != nil {
		return Score{}, err
	}

	existing.MaxScore = score.MaxScore
	existing.MinScore = score.MinScore
	existing.AttemptPenaltyPercentage = score.AttemptPenaltyPercentage
	existing.HintPenaltyPercentage = score.HintPenaltyPercentage
	err = repository.db.Preload("Difficulty").First(&existing, existing.ID).Error
	return existing, err
}

func (repository *Repository) Delete(id uint) error {
	var score Score
	if err := repository.db.First(&score, id).Error; err != nil {
		return err
	}

	return repository.db.Delete(&score).Error
}
