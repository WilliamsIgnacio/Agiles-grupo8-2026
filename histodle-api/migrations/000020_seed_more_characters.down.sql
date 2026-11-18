DELETE FROM characters
WHERE id IN (
    SELECT character_id
    FROM migration_000020_characters
);

DELETE FROM occupations occupation
WHERE occupation.id IN (
    SELECT occupation_id
    FROM migration_000020_occupations
)
AND NOT EXISTS (
    SELECT 1
    FROM character_occupations relation
    WHERE relation.occupation_id = occupation.id
);

DROP TABLE migration_000020_characters;
DROP TABLE migration_000020_occupations;
