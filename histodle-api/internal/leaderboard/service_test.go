package leaderboard

import (
	"errors"
	"testing"

	"histodle-api/internal/score"
)

type fakeRepository struct {
	results map[[2]uint]ChallengeResult
}

func (repository *fakeRepository) DifficultyIDForChallenge(uint) (uint, error) {
	return 1, nil
}

func (repository *fakeRepository) InsertIfAbsent(result ChallengeResult) (bool, error) {
	if repository.results == nil {
		repository.results = make(map[[2]uint]ChallengeResult)
	}
	key := [2]uint{result.UserID, result.ChallengeID}
	if _, exists := repository.results[key]; exists {
		return false, nil
	}
	repository.results[key] = result
	return true, nil
}

func (repository *fakeRepository) Ranking() ([]Entry, error) {
	return nil, nil
}

type fakeScoreCalculator struct {
	score uint
	err   error
}

func (calculator fakeScoreCalculator) CalculateByDifficultyID(uint, score.CalculationInput) (score.CalculationResult, error) {
	return score.CalculationResult{Score: calculator.score}, calculator.err
}

func TestRecordCountsOnlyFirstCompletedChallenge(t *testing.T) {
	repository := &fakeRepository{}
	service := NewService(repository, fakeScoreCalculator{score: 125})
	input := RecordInput{AttemptsUsed: 2, HintsUsed: 1, Won: true}

	first, err := service.Record(7, 3, input)
	if err != nil {
		t.Fatalf("first record returned an error: %v", err)
	}
	if !first.Counted || first.Score != 125 {
		t.Fatalf("first record = %+v, want counted with 125 points", first)
	}

	second, err := service.Record(7, 3, input)
	if err != nil {
		t.Fatalf("repeated record returned an error: %v", err)
	}
	if second.Counted || second.Score != 125 {
		t.Fatalf("repeated record = %+v, want uncounted with current attempt score", second)
	}
	if len(repository.results) != 1 {
		t.Fatalf("stored records = %d, want 1", len(repository.results))
	}

	otherPlayer, err := service.Record(8, 3, input)
	if err != nil {
		t.Fatalf("other player's record returned an error: %v", err)
	}
	if !otherPlayer.Counted {
		t.Fatal("a different player should be able to record the same challenge")
	}
}

func TestRecordCountsFirstLossWithZeroAttempts(t *testing.T) {
	repository := &fakeRepository{}
	service := NewService(repository, fakeScoreCalculator{score: 0})

	result, err := service.Record(7, 3, RecordInput{Won: false})
	if err != nil {
		t.Fatalf("loss record returned an error: %v", err)
	}
	if !result.Counted || result.Score != 0 {
		t.Fatalf("loss result = %+v, want counted with 0 points", result)
	}
	if stored := repository.results[[2]uint{7, 3}]; stored.AttemptsUsed != 0 || stored.Won {
		t.Fatalf("stored loss = %+v, want an unfinished-attempt loss", stored)
	}
}

func TestRecordRejectsInvalidInputBeforeWriting(t *testing.T) {
	repository := &fakeRepository{}
	service := NewService(repository, fakeScoreCalculator{score: 1})

	_, err := service.Record(7, 3, RecordInput{AttemptsUsed: 11, Won: true})
	if !errors.Is(err, ErrInvalidResult) {
		t.Fatalf("error = %v, want ErrInvalidResult", err)
	}
	if len(repository.results) != 0 {
		t.Fatal("invalid result must not be stored")
	}
}
