CREATE TABLE IF NOT EXISTS character_occupations (
    character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    occupation_id BIGINT NOT NULL REFERENCES occupations(id) ON DELETE CASCADE,
    PRIMARY KEY (character_id, occupation_id)
);