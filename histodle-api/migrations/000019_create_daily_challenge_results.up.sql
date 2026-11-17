CREATE TABLE daily_challenge_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL REFERENCES daily_challenges(challenge_date) ON DELETE CASCADE,
    points BIGINT NOT NULL CHECK (points >= 0),
    attempts_used SMALLINT NOT NULL CHECK (attempts_used BETWEEN 0 AND 10),
    hints_used INTEGER NOT NULL CHECK (hints_used >= 0),
    won BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT daily_challenge_results_user_date_unique UNIQUE (user_id, challenge_date)
);
