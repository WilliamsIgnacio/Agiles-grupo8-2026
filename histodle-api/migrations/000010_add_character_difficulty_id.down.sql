ALTER TABLE characters
    ADD COLUMN difficulty TEXT;

UPDATE characters
SET difficulty = difficulties.name
FROM difficulties
WHERE difficulties.id = characters.difficulty_id;

ALTER TABLE characters
    ALTER COLUMN difficulty SET NOT NULL,
    DROP CONSTRAINT fk_characters_difficulty,
    DROP COLUMN difficulty_id;
