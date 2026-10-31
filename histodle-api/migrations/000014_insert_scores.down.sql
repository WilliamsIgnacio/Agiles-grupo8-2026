DELETE FROM scores
WHERE difficulty_id IN (
    SELECT id
    FROM difficulties
    WHERE name IN ('facil', 'medio', 'dificil')
);
