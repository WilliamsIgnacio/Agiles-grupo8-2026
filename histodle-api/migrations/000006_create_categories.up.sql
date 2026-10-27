CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
    ('Gobierno y Poder'),
    ('Ciencias y Conocimiento'),
    ('Arte y Comunicación'),
    ('Religión y Pensamiento Social'),
    ('Exploración e Innovación'),
    ('Salud'),
    ('Derecho y Justicia'),
    ('Deportes');

ALTER TABLE occupations
    ADD COLUMN category_id BIGINT;

UPDATE occupations
SET category_id = categories.id
FROM categories
WHERE categories.name = CASE occupations.name
    WHEN 'Gobernante' THEN 'Gobierno y Poder'
    WHEN 'Político' THEN 'Gobierno y Poder'
    WHEN 'Militar' THEN 'Gobierno y Poder'
    WHEN 'Científico' THEN 'Ciencias y Conocimiento'
    WHEN 'Matemático' THEN 'Ciencias y Conocimiento'
    WHEN 'Filósofo' THEN 'Ciencias y Conocimiento'
    WHEN 'Escritor' THEN 'Arte y Comunicación'
    WHEN 'Artista' THEN 'Arte y Comunicación'
    WHEN 'Religioso' THEN 'Religión y Pensamiento Social'
    WHEN 'Activista' THEN 'Religión y Pensamiento Social'
    WHEN 'Explorador' THEN 'Exploración e Innovación'
    WHEN 'Aviador' THEN 'Exploración e Innovación'
    WHEN 'Inventor' THEN 'Exploración e Innovación'
    WHEN 'Enfermería' THEN 'Salud'
    WHEN 'Abogado' THEN 'Derecho y Justicia'
    WHEN 'Futbolista' THEN 'Deportes'
    WHEN 'Tenista' THEN 'Deportes'
    ELSE NULL
END;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM occupations
        WHERE category_id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Hay ocupaciones sin categoría. Revisá sus nombres y el mapeo de la migración.';
    END IF;
END $$;

ALTER TABLE occupations
    ALTER COLUMN category_id SET NOT NULL,
    ADD CONSTRAINT fk_occupations_category
        FOREIGN KEY (category_id) REFERENCES categories(id);