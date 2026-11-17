CREATE TABLE challenge_results (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id BIGINT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    points BIGINT NOT NULL CHECK (points >= 0),
    attempts_used SMALLINT NOT NULL CHECK (attempts_used BETWEEN 0 AND 10),
    hints_used INTEGER NOT NULL CHECK (hints_used >= 0),
    won BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT challenge_results_user_challenge_unique UNIQUE (user_id, challenge_id)
);
