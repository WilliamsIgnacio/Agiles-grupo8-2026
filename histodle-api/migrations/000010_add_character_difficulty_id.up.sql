ALTER TABLE characters
    ADD COLUMN difficulty_id BIGINT;

UPDATE characters AS c
SET difficulty_id = d.id
FROM (
    VALUES
        ('Cleopatra', 'facil'),
        ('Julio César', 'facil'),
        ('Confucio', 'medio'),
        ('Aristóteles', 'facil'),
        ('Alejandro Magno', 'facil'),
        ('Ashoka', 'dificil'),
        ('Hipatia', 'dificil'),
        ('Mansa Musa', 'dificil'),
        ('Gengis Kan', 'medio'),
        ('Juana de Arco', 'facil'),
        ('Leonardo da Vinci', 'facil'),
        ('William Shakespeare', 'facil'),
        ('Galileo Galilei', 'medio'),
        ('Isaac Newton', 'facil'),
        ('Sor Juana Inés de la Cruz', 'dificil'),
        ('Napoleón Bonaparte', 'facil'),
        ('Simón Bolívar', 'facil'),
        ('Jane Austen', 'medio'),
        ('Charles Darwin', 'facil'),
        ('Florence Nightingale', 'medio'),
        ('Abraham Lincoln', 'facil'),
        ('Ada Lovelace', 'medio'),
        ('Marie Curie', 'facil'),
        ('Nikola Tesla', 'medio'),
        ('Albert Einstein', 'facil'),
        ('Mahatma Gandhi', 'facil'),
        ('Frida Kahlo', 'facil'),
        ('Amelia Earhart', 'medio'),
        ('Nelson Mandela', 'facil'),
        ('Martin Luther King Jr.', 'facil'),
        ('Rosa Parks', 'medio'),
        ('Alan Turing', 'medio'),
        ('Lionel Messi', 'facil'),
        ('Diego Maradona', 'facil'),
        ('Pelé', 'facil'),
        ('Cristiano Ronaldo', 'facil'),
        ('Zinedine Zidane', 'medio'),
        ('Franco Colapinto', 'dificil')
) AS seed(character_name, difficulty_name)
JOIN difficulties AS d ON d.name = seed.difficulty_name
WHERE c.name = seed.character_name;

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
