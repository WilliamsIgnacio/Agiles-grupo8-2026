-- Usa la descripción de cada personaje como su primera pista.
CREATE TABLE migration_000015_hints (
    hint_id BIGINT PRIMARY KEY REFERENCES hints(id) ON DELETE CASCADE
);

WITH inserted_hints AS (
    INSERT INTO hints (character_id, text)
    SELECT id, btrim(know_for)
    FROM characters
    WHERE btrim(know_for) <> ''
    RETURNING id
)
INSERT INTO migration_000015_hints (hint_id)
SELECT id
FROM inserted_hints;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM characters character
        LEFT JOIN hints hint
            ON hint.character_id = character.id
        GROUP BY character.id
        HAVING COUNT(hint.id) = 0
    ) THEN
        RAISE EXCEPTION
            'Hay personajes sin una pista cargada.';
    END IF;
END $$;
