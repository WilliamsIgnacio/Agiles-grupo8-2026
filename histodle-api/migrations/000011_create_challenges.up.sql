CREATE TABLE challenges (
    id BIGSERIAL PRIMARY KEY,
    character_id BIGINT NOT NULL REFERENCES characters(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

INSERT INTO challenges (character_id, name, description)
SELECT id, 'El genio de la relatividad', 'Descubrí al científico que revolucionó nuestra comprensión del espacio y el tiempo.'
FROM characters
WHERE name = 'Albert Einstein';

INSERT INTO challenges (character_id, name, description)
SELECT id, 'La leyenda del fútbol argentino', 'Adiviná al futbolista argentino campeón del mundo en 1986.'
FROM characters
WHERE name = 'Diego Maradona';
