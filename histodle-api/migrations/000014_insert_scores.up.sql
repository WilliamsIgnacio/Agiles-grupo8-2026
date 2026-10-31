INSERT INTO scores (
    difficulty_id,
    max_score,
    min_score,
    attempt_penalty_percentage,
    hint_penalty_percentage
)
SELECT id, 1000, 100, 10, 5
FROM difficulties
WHERE name = 'facil'
ON CONFLICT (difficulty_id) DO NOTHING;

INSERT INTO scores (
    difficulty_id,
    max_score,
    min_score,
    attempt_penalty_percentage,
    hint_penalty_percentage
)
SELECT id, 1500, 150, 15, 10
FROM difficulties
WHERE name = 'medio'
ON CONFLICT (difficulty_id) DO NOTHING;

INSERT INTO scores (
    difficulty_id,
    max_score,
    min_score,
    attempt_penalty_percentage,
    hint_penalty_percentage
)
SELECT id, 2000, 200, 20, 15
FROM difficulties
WHERE name = 'dificil'
ON CONFLICT (difficulty_id) DO NOTHING;
