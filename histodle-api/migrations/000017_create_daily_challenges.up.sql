CREATE TABLE daily_challenges (
    challenge_date DATE PRIMARY KEY,
    character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE RESTRICT
);
