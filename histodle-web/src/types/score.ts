export interface Score {
    id: number;
    difficultyId: number;
    maxScore: number;
    minScore: number;
    attemptPenaltyPercentage: number;
    hintPenaltyPercentage: number;
}

export interface ScoreInput {
    difficultyId: number;
    maxScore: number;
    minScore: number;
    attemptPenaltyPercentage: number;
    hintPenaltyPercentage: number;
}

export type ScoreUpdateInput = Omit<ScoreInput, 'difficultyId'>;

export interface ScoreCalculationInput {
    attemptsUsed: number;
    hintsUsed: number;
    won: boolean;
}

export interface ScoreCalculationResult {
    score: number;
}
