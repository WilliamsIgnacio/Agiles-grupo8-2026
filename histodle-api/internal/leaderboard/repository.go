package leaderboard

import (
	"time"

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

func (repository *Repository) DifficultyIDForDailyChallenge(date time.Time) (uint, error) {
	var difficultyID uint
	err := repository.db.Table("daily_challenges").
		Select("characters.difficulty_id").
		Joins("JOIN characters ON characters.id = daily_challenges.character_id").
		Where("daily_challenges.challenge_date = ?", date.Format(time.DateOnly)).
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

func (repository *Repository) InsertDailyIfAbsent(result DailyChallengeResult) (bool, error) {
	created := repository.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "challenge_date"}},
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
				COUNT(results.user_id) AS challenges_played,
				COALESCE(SUM(results.points), 0)::BIGINT AS total_points
			FROM users
			JOIN (
				SELECT user_id, points FROM challenge_results
				UNION ALL
				SELECT user_id, points FROM daily_challenge_results
			) AS results ON results.user_id = users.id
			GROUP BY users.id, users.name
		) AS totals
		ORDER BY totals.total_points DESC, totals.name ASC, totals.user_id ASC
	`).Scan(&entries).Error
	return entries, err
}
