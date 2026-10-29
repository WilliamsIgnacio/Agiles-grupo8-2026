ALTER TABLE characters
    ADD COLUMN difficulty_id BIGINT;

UPDATE characters
SET difficulty_id = difficulties.id
FROM difficulties
WHERE difficulties.name = characters.difficulty;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM characters WHERE difficulty_id IS NULL) THEN
        RAISE EXCEPTION 'No se pudo asignar una dificultad a todos los personajes';
    END IF;
END
$$;

ALTER TABLE characters
    ALTER COLUMN difficulty_id SET NOT NULL,
    ADD CONSTRAINT fk_characters_difficulty
        FOREIGN KEY (difficulty_id) REFERENCES difficulties(id);

ALTER TABLE characters
    DROP COLUMN difficulty;
