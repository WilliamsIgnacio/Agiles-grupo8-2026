CREATE TABLE IF NOT EXISTS characters (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    period TEXT,
    country TEXT,
    continent TEXT,
    know_for TEXT,
    position TEXT,
    birth_year INTEGER,
    year_of_death INTEGER
);

ALTER TABLE characters ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS period TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS continent TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS know_for TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS birth_year INTEGER;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS year_of_death INTEGER;
