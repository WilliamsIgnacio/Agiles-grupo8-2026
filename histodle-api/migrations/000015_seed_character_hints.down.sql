DELETE FROM hints
WHERE id IN (
    SELECT hint_id
    FROM migration_000015_hints
);

DROP TABLE migration_000015_hints;
