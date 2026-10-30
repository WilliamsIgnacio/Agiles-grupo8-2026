-- Elimina solo los personajes registrados por esta migración.
-- Las relaciones de character_occupations se borran por ON DELETE CASCADE.
DELETE FROM characters
WHERE id IN (
    SELECT character_id
    FROM migration_000013_characters
);

-- Elimina las ocupaciones creadas por esta migración solo si ya no están usadas.
DELETE FROM occupations occupation
WHERE occupation.id IN (
    SELECT occupation_id
    FROM migration_000013_occupations
)
AND NOT EXISTS (
    SELECT 1
    FROM character_occupations relation
    WHERE relation.occupation_id = occupation.id
);

DROP TABLE migration_000013_characters;
DROP TABLE migration_000013_occupations;

DROP INDEX uq_characters_name_normalized;
DROP INDEX uq_occupations_name_normalized;