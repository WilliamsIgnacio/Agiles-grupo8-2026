package leaderboard

import (
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (repository *Repository) DifficultyIDForChallenge(challengeID uint) (uint, error) {
	var difficultyID uint
	err := repository.db.Table("challenges").
		Select("characters.difficulty_id").
		Joins("JOIN characters ON characters.id = challenges.character_id").
		Where("challenges.id = ?", challengeID).
		Take(&difficultyID).Error
	return difficultyID, err
}

func (repository *Repository) InsertIfAbsent(result ChallengeResult) (bool, error) {
	created := repository.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "challenge_id"}},
		DoNothing: true,
	}).Create(&result)
	return created.RowsAffected == 1, created.Error
}

func (repository *Repository) Ranking() ([]Entry, error) {
	entries := make([]Entry, 0)
	err := repository.db.Raw(`
		SELECT
			ROW_NUMBER() OVER (ORDER BY totals.total_points DESC, totals.name ASC, totals.user_id ASC) AS position,
			totals.name,
			totals.challenges_played,
			totals.total_points
		FROM (
			SELECT
				users.id AS user_id,
				users.name AS name,
				COUNT(challenge_results.id) AS challenges_played,
				COALESCE(SUM(challenge_results.points), 0)::BIGINT AS total_points
			FROM users
			JOIN challenge_results ON challenge_results.user_id = users.id
			GROUP BY users.id, users.name
		) AS totals
		ORDER BY totals.total_points DESC, totals.name ASC, totals.user_id ASC
	`).Scan(&entries).Error
	return entries, err
}
