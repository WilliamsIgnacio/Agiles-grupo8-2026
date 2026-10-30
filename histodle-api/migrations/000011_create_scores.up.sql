CREATE TABLE IF NOT EXISTS scores (
    id BIGSERIAL PRIMARY KEY,
    difficulty_id BIGINT NOT NULL UNIQUE,
    max_score INTEGER NOT NULL CHECK (max_score >= 0),
    min_score INTEGER NOT NULL DEFAULT 0 CHECK (min_score >= 0),
    attempt_penalty_percentage DOUBLE PRECISION NOT NULL
        CHECK (attempt_penalty_percentage >= 0 AND attempt_penalty_percentage <= 100),
    hint_penalty_percentage DOUBLE PRECISION NOT NULL
        CHECK (hint_penalty_percentage >= 0 AND hint_penalty_percentage <= 100),
    CONSTRAINT fk_scores_difficulty
        FOREIGN KEY (difficulty_id) REFERENCES difficulties(id)
);
