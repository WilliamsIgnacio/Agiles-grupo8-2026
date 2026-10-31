package score

import "testing"

func TestCalculate(t *testing.T) {
	tests := []struct {
		name     string
		score    Score
		attempts int
		hints    int
		won      bool
		expected uint
		wantErr  bool
	}{
		{"first attempt", Score{MaxScore: 1000, MinScore: 50, AttemptPenaltyPercentage: 15, HintPenaltyPercentage: 20}, 1, 0, true, 1000, false},
		{"second attempt", Score{MaxScore: 1000, MinScore: 50, AttemptPenaltyPercentage: 15, HintPenaltyPercentage: 20}, 2, 0, true, 858, false},
		{"attempt and hint", Score{MaxScore: 1000, MinScore: 50, AttemptPenaltyPercentage: 15, HintPenaltyPercentage: 20}, 3, 1, true, 599, false},
		{"first attempt with hint", Score{MaxScore: 1000, MinScore: 50, AttemptPenaltyPercentage: 15, HintPenaltyPercentage: 20}, 1, 1, true, 810, false},
		{"loss", Score{MaxScore: 1000, MinScore: 50, AttemptPenaltyPercentage: 15, HintPenaltyPercentage: 20}, 10, 4, false, 0, false},
		{"zero penalties", Score{MaxScore: 100, MinScore: 20}, 10, 5, true, 100, false},
		{"full attempt penalty", Score{MaxScore: 100, MinScore: 20, AttemptPenaltyPercentage: 100}, 2, 0, true, 20, false},
		{"full hint penalty", Score{MaxScore: 100, MinScore: 20, HintPenaltyPercentage: 100}, 1, 1, true, 20, false},
		{"zero minimum", Score{MaxScore: 100, MinScore: 0, AttemptPenaltyPercentage: 50}, 2, 0, true, 50, false},
		{"zero maximum", Score{MaxScore: 0, MinScore: 0}, 1, 0, true, 0, false},
		{"invalid attempts", Score{MaxScore: 100}, 0, 0, true, 0, true},
		{"invalid hints", Score{MaxScore: 100}, 1, -1, true, 0, true},
		{"too many attempts", Score{MaxScore: 100}, 11, 0, true, 0, true},
		{"minimum greater than maximum", Score{MaxScore: 100, MinScore: 200}, 1, 0, true, 0, true},
		{"invalid attempt penalty", Score{MaxScore: 100, AttemptPenaltyPercentage: 110}, 1, 0, true, 0, true},
		{"invalid hint penalty", Score{MaxScore: 100, HintPenaltyPercentage: -10}, 1, 0, true, 0, true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := Calculate(test.score, test.attempts, test.hints, test.won)
			if (err != nil) != test.wantErr {
				t.Fatalf("error = %v, wantErr %v", err, test.wantErr)
			}
			if got != test.expected {
				t.Fatalf("score = %d, expected %d", got, test.expected)
			}
		})
	}
}
