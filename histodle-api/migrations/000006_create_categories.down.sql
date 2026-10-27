ALTER TABLE occupations
    DROP CONSTRAINT fk_occupations_category,
    DROP COLUMN category_id;

DROP TABLE categories;