-- Carga personajes adicionales con su ocupación, categoría, dificultad y pista.
CREATE TEMP TABLE _seed_characters_000020 (
    name TEXT PRIMARY KEY,
    gender TEXT NOT NULL CHECK (gender IN ('Masculino', 'Femenino')),
    period TEXT NOT NULL CHECK (
        period IN (
            'Edad Antigua',
            'Edad Media',
            'Edad Moderna',
            'Edad Contemporanea'
        )
    ),
    country TEXT NOT NULL,
    continent TEXT NOT NULL CHECK (
        continent IN (
            'Europa',
            'Asia',
            'America',
            'Oceania',
            'Africa'
        )
    ),
    know_for TEXT NOT NULL CHECK (btrim(know_for) <> ''),
    position TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    year_of_death INTEGER NOT NULL,
    occupation_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    difficulty_name TEXT NOT NULL CHECK (
        difficulty_name IN ('facil', 'medio', 'dificil')
    )
);

INSERT INTO _seed_characters_000020 (
    name,
    gender,
    period,
    country,
    continent,
    know_for,
    position,
    birth_year,
    year_of_death,
    occupation_name,
    category_name,
    difficulty_name
) VALUES
    -- Gobierno y Poder
    ('Eva Perón', 'Femenino', 'Edad Contemporanea', 'Argentina', 'America', 'Figura central del peronismo y promotora de derechos sociales en Argentina', 'Dirigente política', 1919, 1952, 'Político', 'Gobierno y Poder', 'medio'),
    ('Barack Obama', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Primer presidente afroestadounidense de Estados Unidos', 'Presidente', 1961, 0, 'Político', 'Gobierno y Poder', 'facil'),
    ('Angela Merkel', 'Femenino', 'Edad Contemporanea', 'Alemania', 'Europa', 'Canciller de Alemania durante dieciséis años', 'Canciller', 1954, 0, 'Político', 'Gobierno y Poder', 'facil'),
    ('Margaret Thatcher', 'Femenino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Primera mujer en ocupar el cargo de primera ministra británica', 'Primera ministra', 1925, 2013, 'Político', 'Gobierno y Poder', 'facil'),

    -- Ciencias y Conocimiento
    ('Stephen Hawking', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Investigaciones sobre agujeros negros y divulgación de la cosmología', 'Físico teórico', 1942, 2018, 'Científico', 'Ciencias y Conocimiento', 'facil'),
    ('Rosalind Franklin', 'Femenino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Imágenes de difracción de rayos X que contribuyeron al estudio de la estructura del ADN', 'Química y cristalógrafa', 1920, 1958, 'Científico', 'Ciencias y Conocimiento', 'medio'),
    ('Katherine Johnson', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cálculos matemáticos para las primeras misiones espaciales tripuladas de la NASA', 'Matemática', 1918, 2020, 'Matemático', 'Ciencias y Conocimiento', 'medio'),
    ('Carl Sagan', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Divulgación de la astronomía y conducción de la serie Cosmos', 'Astrónomo y divulgador', 1934, 1996, 'Científico', 'Ciencias y Conocimiento', 'facil'),
    ('Charles Babbage', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Diseñó máquinas de cálculo precursoras de la computadora', 'Matemático e inventor', 1791, 1871, 'Matemático', 'Ciencias y Conocimiento', 'medio'),

    -- Arte y Comunicación
    ('Wolfgang Amadeus Mozart', 'Masculino', 'Edad Moderna', 'Austria', 'Europa', 'Compositor de óperas, sinfonías y conciertos clásicos', 'Compositor', 1756, 1791, 'Artista', 'Arte y Comunicación', 'facil'),
    ('Ludwig van Beethoven', 'Masculino', 'Edad Contemporanea', 'Alemania', 'Europa', 'Compositor de la Novena Sinfonía y otras obras fundamentales', 'Compositor', 1770, 1827, 'Artista', 'Arte y Comunicación', 'facil'),
    ('Gabriel García Márquez', 'Masculino', 'Edad Contemporanea', 'Colombia', 'America', 'Autor de Cien años de soledad y referente del realismo mágico', 'Escritor', 1927, 2014, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Jorge Luis Borges', 'Masculino', 'Edad Contemporanea', 'Argentina', 'America', 'Autor de relatos como El Aleph y Ficciones', 'Escritor', 1899, 1986, 'Escritor', 'Arte y Comunicación', 'medio'),
    ('Pablo Neruda', 'Masculino', 'Edad Contemporanea', 'Chile', 'America', 'Poeta chileno y ganador del Premio Nobel de Literatura', 'Poeta', 1904, 1973, 'Escritor', 'Arte y Comunicación', 'facil'),

    -- Religión y Pensamiento Social
    ('Malala Yousafzai', 'Femenino', 'Edad Contemporanea', 'Pakistán', 'Asia', 'Defensa del derecho de las niñas a la educación y Premio Nobel de la Paz', 'Activista', 1997, 0, 'Activista', 'Religión y Pensamiento Social', 'facil'),
    ('Greta Thunberg', 'Femenino', 'Edad Contemporanea', 'Suecia', 'Europa', 'Activismo juvenil contra el cambio climático', 'Activista climática', 2003, 0, 'Activista', 'Religión y Pensamiento Social', 'facil'),
    ('Desmond Tutu', 'Masculino', 'Edad Contemporanea', 'Sudáfrica', 'Africa', 'Liderazgo religioso y lucha contra el apartheid', 'Arzobispo y activista', 1931, 2021, 'Religioso', 'Religión y Pensamiento Social', 'medio'),
    ('Rigoberta Menchú', 'Femenino', 'Edad Contemporanea', 'Guatemala', 'America', 'Defensa de los derechos de los pueblos indígenas y Premio Nobel de la Paz', 'Activista', 1959, 0, 'Activista', 'Religión y Pensamiento Social', 'medio'),

    -- Exploración e Innovación
    ('Steve Jobs', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cofundó Apple y popularizó productos de computación personal', 'Emprendedor tecnológico', 1955, 2011, 'Inventor', 'Exploración e Innovación', 'facil'),
    ('Valentina Tereshkova', 'Femenino', 'Edad Contemporanea', 'Unión Soviética', 'Europa', 'Primera mujer en viajar al espacio', 'Cosmonauta', 1937, 0, 'Astronauta', 'Exploración e Innovación', 'medio'),
    ('Roald Amundsen', 'Masculino', 'Edad Contemporanea', 'Noruega', 'Europa', 'Lideró la primera expedición que llegó al Polo Sur', 'Explorador polar', 1872, 1928, 'Explorador', 'Exploración e Innovación', 'medio'),
    ('Hedy Lamarr', 'Femenino', 'Edad Contemporanea', 'Austria', 'Europa', 'Actriz e inventora cuyo trabajo contribuyó a técnicas de comunicación inalámbrica', 'Actriz e inventora', 1914, 2000, 'Inventor', 'Exploración e Innovación', 'medio'),
    ('Bill Gates', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cofundó Microsoft y contribuyó a popularizar las computadoras personales', 'Empresario tecnológico', 1955, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),
    ('Tim Berners-Lee', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Inventó la World Wide Web', 'Informático', 1955, 0, 'Informático', 'Exploración e Innovación', 'facil'),
    ('Steve Wozniak', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cofundó Apple y diseñó sus primeras computadoras personales', 'Ingeniero e inventor', 1950, 0, 'Inventor', 'Exploración e Innovación', 'medio'),
    ('Linus Torvalds', 'Masculino', 'Edad Contemporanea', 'Finlandia', 'Europa', 'Creó el núcleo Linux y el sistema de control de versiones Git', 'Informático', 1969, 0, 'Informático', 'Exploración e Innovación', 'medio'),
    ('Grace Hopper', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Pionera de la programación y del desarrollo de compiladores', 'Informática y militar', 1906, 1992, 'Informático', 'Exploración e Innovación', 'medio'),
    ('Mark Zuckerberg', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cofundó Facebook, una de las redes sociales más usadas del mundo', 'Empresario tecnológico', 1984, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),
    ('Larry Page', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Cofundó Google y desarrolló el buscador junto con Sergey Brin', 'Empresario tecnológico', 1973, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),
    ('Sergey Brin', 'Masculino', 'Edad Contemporanea', 'Rusia', 'Europa', 'Cofundó Google y desarrolló el buscador junto con Larry Page', 'Empresario tecnológico', 1973, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),
    ('Jeff Bezos', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Fundó Amazon, inicialmente como una librería en línea', 'Empresario tecnológico', 1964, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),
    ('Elon Musk', 'Masculino', 'Edad Contemporanea', 'Sudáfrica', 'Africa', 'Impulsó empresas de vehículos eléctricos y exploración espacial comercial', 'Empresario tecnológico', 1971, 0, 'Empresario tecnológico', 'Exploración e Innovación', 'facil'),

    -- Salud
    ('René Favaloro', 'Masculino', 'Edad Contemporanea', 'Argentina', 'America', 'Desarrolló y difundió la cirugía de bypass coronario', 'Médico cirujano', 1923, 2000, 'Médico', 'Salud', 'facil'),
    ('Jonas Salk', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Desarrolló una de las primeras vacunas contra la poliomielitis', 'Médico e investigador', 1914, 1995, 'Médico', 'Salud', 'medio'),
    ('Elizabeth Blackwell', 'Femenino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Primera mujer en obtener un título de medicina en Estados Unidos', 'Médica', 1821, 1910, 'Médico', 'Salud', 'medio'),
    ('Clara Barton', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Fundó la Cruz Roja Estadounidense', 'Enfermera', 1821, 1912, 'Enfermería', 'Salud', 'medio'),

    -- Derecho y Justicia
    ('Ruth Bader Ginsburg', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Jueza de la Corte Suprema y referente de la igualdad ante la ley', 'Abogada y jueza', 1933, 2020, 'Abogado', 'Derecho y Justicia', 'medio'),
    ('Thurgood Marshall', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Abogado de derechos civiles y primer juez afroestadounidense de la Corte Suprema', 'Abogado y juez', 1908, 1993, 'Abogado', 'Derecho y Justicia', 'medio'),
    ('Sonia Sotomayor', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Primera jueza latina de la Corte Suprema de Estados Unidos', 'Abogada y jueza', 1954, 0, 'Abogado', 'Derecho y Justicia', 'facil'),

    -- Deportes
    ('Marta Vieira da Silva', 'Femenino', 'Edad Contemporanea', 'Brasil', 'America', 'Futbolista brasileña reconocida como una de las mejores de la historia', 'Delantera', 1986, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Kylian Mbappé', 'Masculino', 'Edad Contemporanea', 'Francia', 'Europa', 'Campeón del mundo con Francia en 2018 y figura del fútbol internacional', 'Delantero', 1998, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Neymar', 'Masculino', 'Edad Contemporanea', 'Brasil', 'America', 'Futbolista brasileño y medallista de oro olímpico', 'Delantero', 1992, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Novak Djokovic', 'Masculino', 'Edad Contemporanea', 'Serbia', 'Europa', 'Tenista con múltiples títulos de Grand Slam', 'Tenista', 1987, 0, 'Tenista', 'Deportes', 'facil'),
    ('Naomi Osaka', 'Femenino', 'Edad Contemporanea', 'Japón', 'Asia', 'Tenista japonesa ganadora de títulos de Grand Slam', 'Tenista', 1997, 0, 'Tenista', 'Deportes', 'facil'),
    ('Michael Phelps', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Nadador con el mayor número de medallas olímpicas de la historia', 'Nadador', 1985, 0, 'Nadador', 'Deportes', 'facil'),
    ('Simone Biles', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Gimnasta con múltiples títulos mundiales y medallas olímpicas', 'Gimnasta', 1997, 0, 'Gimnasta', 'Deportes', 'facil'),
    ('LeBron James', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Estrella del baloncesto y campeón de la NBA', 'Basquetbolista', 1984, 0, 'Basquetbolista', 'Deportes', 'facil'),
    ('Kobe Bryant', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Estrella de Los Angeles Lakers y cinco veces campeón de la NBA', 'Basquetbolista', 1978, 2020, 'Basquetbolista', 'Deportes', 'facil'),
    ('Lewis Hamilton', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Piloto de Fórmula 1 con múltiples campeonatos mundiales', 'Piloto de automovilismo', 1985, 0, 'Piloto de automovilismo', 'Deportes', 'facil'),
    ('Michael Schumacher', 'Masculino', 'Edad Contemporanea', 'Alemania', 'Europa', 'Piloto alemán de Fórmula 1 y siete veces campeón mundial', 'Piloto de automovilismo', 1969, 0, 'Piloto de automovilismo', 'Deportes', 'facil'),
    ('Manu Ginóbili', 'Masculino', 'Edad Contemporanea', 'Argentina', 'America', 'Basquetbolista argentino campeón olímpico y de la NBA', 'Basquetbolista', 1977, 0, 'Basquetbolista', 'Deportes', 'facil'),
    ('Ronaldinho', 'Masculino', 'Edad Contemporanea', 'Brasil', 'America', 'Futbolista brasileño campeón del mundo en 2002 y ganador del Balón de Oro', 'Mediapunta', 1980, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Ronaldo Nazário', 'Masculino', 'Edad Contemporanea', 'Brasil', 'America', 'Delantero brasileño campeón del mundo en 1994 y 2002', 'Delantero', 1976, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Andrés Iniesta', 'Masculino', 'Edad Contemporanea', 'España', 'Europa', 'Marcó el gol que dio a España su primer título mundial de fútbol', 'Mediocampista', 1984, 0, 'Futbolista', 'Deportes', 'facil'),
    ('David Beckham', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Futbolista inglés reconocido por su trayectoria en clubes y selección', 'Mediocampista', 1975, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Alex Morgan', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Futbolista estadounidense campeona del mundo y medallista olímpica', 'Delantera', 1989, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Megan Rapinoe', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Futbolista estadounidense campeona del mundo y activista por la igualdad', 'Delantera', 1985, 0, 'Futbolista', 'Deportes', 'facil'),
    ('Gabriela Sabatini', 'Femenino', 'Edad Contemporanea', 'Argentina', 'America', 'Tenista argentina ganadora del Abierto de Estados Unidos', 'Tenista', 1970, 0, 'Tenista', 'Deportes', 'facil'),
    ('Juan Martín del Potro', 'Masculino', 'Edad Contemporanea', 'Argentina', 'America', 'Tenista argentino ganador del Abierto de Estados Unidos y medallista olímpico', 'Tenista', 1988, 0, 'Tenista', 'Deportes', 'facil'),
    ('Mike Tyson', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Boxeador que fue campeón mundial de peso pesado', 'Boxeador', 1966, 0, 'Boxeador', 'Deportes', 'facil'),
    ('Tiger Woods', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Golfista con múltiples victorias en torneos mayores', 'Golfista', 1975, 0, 'Golfista', 'Deportes', 'facil'),
    ('Nadia Comaneci', 'Femenino', 'Edad Contemporanea', 'Rumania', 'Europa', 'Gimnasta que obtuvo la primera calificación perfecta de 10 en los Juegos Olímpicos', 'Gimnasta', 1961, 0, 'Gimnasta', 'Deportes', 'medio'),
    ('Jesse Owens', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Atleta que ganó cuatro medallas de oro en los Juegos Olímpicos de Berlín 1936', 'Atleta', 1913, 1980, 'Atleta', 'Deportes', 'medio'),
    ('Jackie Robinson', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Rompió la barrera racial del béisbol profesional en las Grandes Ligas', 'Beisbolista', 1919, 1972, 'Beisbolista', 'Deportes', 'medio'),
    ('Babe Ruth', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Figura histórica del béisbol y de los New York Yankees', 'Beisbolista', 1895, 1948, 'Beisbolista', 'Deportes', 'facil'),
    ('Tony Hawk', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Skater reconocido por sus logros y por popularizar el skateboarding', 'Skater', 1968, 0, 'Skater', 'Deportes', 'facil');

DO $$
BEGIN
    IF (
        SELECT COUNT(*)
        FROM categories
        WHERE name IN (
            'Gobierno y Poder',
            'Ciencias y Conocimiento',
            'Arte y Comunicación',
            'Religión y Pensamiento Social',
            'Exploración e Innovación',
            'Salud',
            'Derecho y Justicia',
            'Deportes'
        )
    ) <> 8 THEN
        RAISE EXCEPTION
            'Falta una o más categorías requeridas para cargar los personajes.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000020
        GROUP BY lower(btrim(name))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'La lista contiene personajes duplicados por nombre normalizado.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000020 seed
        JOIN characters character
            ON lower(btrim(character.name)) = lower(btrim(seed.name))
    ) THEN
        RAISE EXCEPTION
            'Uno o más personajes de la migración ya existen. Revisá los nombres antes de continuar.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000020 seed
        LEFT JOIN difficulties difficulty
            ON difficulty.name = seed.difficulty_name
        WHERE difficulty.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Falta una dificultad requerida. Verificá que existan facil, medio y dificil.';
    END IF;
END $$;

CREATE TABLE migration_000020_characters (
    character_id BIGINT PRIMARY KEY
        REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE migration_000020_occupations (
    occupation_id BIGINT PRIMARY KEY
        REFERENCES occupations(id) ON DELETE CASCADE
);

WITH desired_occupations AS (
    SELECT DISTINCT occupation_name AS name, category_name
    FROM _seed_characters_000020
),
inserted_occupations AS (
    INSERT INTO occupations (name, category_id)
    SELECT desired.name, category.id
    FROM desired_occupations desired
    JOIN categories category
        ON category.name = desired.category_name
    ON CONFLICT (lower(btrim(name))) DO NOTHING
    RETURNING id
)
INSERT INTO migration_000020_occupations (occupation_id)
SELECT id
FROM inserted_occupations;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000020 seed
        LEFT JOIN occupations occupation
            ON lower(btrim(occupation.name)) =
               lower(btrim(seed.occupation_name))
        LEFT JOIN categories category
            ON category.id = occupation.category_id
        WHERE occupation.id IS NULL
           OR category.id IS NULL
           OR category.name <> seed.category_name
    ) THEN
        RAISE EXCEPTION
            'Hay una ocupación faltante o asociada a una categoría incorrecta.';
    END IF;
END $$;

WITH inserted_characters AS (
    INSERT INTO characters (
        name,
        gender,
        period,
        country,
        continent,
        know_for,
        position,
        birth_year,
        year_of_death,
        difficulty_id
    )
    SELECT
        seed.name,
        seed.gender,
        seed.period,
        seed.country,
        seed.continent,
        seed.know_for,
        seed.position,
        seed.birth_year,
        seed.year_of_death,
        difficulty.id
    FROM _seed_characters_000020 seed
    JOIN difficulties difficulty
        ON difficulty.name = seed.difficulty_name
    RETURNING id
)
INSERT INTO migration_000020_characters (character_id)
SELECT id
FROM inserted_characters;

INSERT INTO character_occupations (character_id, occupation_id)
SELECT character.id, occupation.id
FROM _seed_characters_000020 seed
JOIN characters character
    ON lower(btrim(character.name)) = lower(btrim(seed.name))
JOIN occupations occupation
    ON lower(btrim(occupation.name)) =
       lower(btrim(seed.occupation_name))
JOIN categories category
    ON category.id = occupation.category_id
   AND category.name = seed.category_name
JOIN migration_000020_characters tracked
    ON tracked.character_id = character.id;

INSERT INTO hints (character_id, text)
SELECT character.id, btrim(character.know_for)
FROM migration_000020_characters tracked
JOIN characters character
    ON character.id = tracked.character_id;

DO $$
DECLARE
    expected_count INTEGER;
    inserted_count INTEGER;
    relation_count INTEGER;
    hint_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO expected_count
    FROM _seed_characters_000020;

    SELECT COUNT(*)
    INTO inserted_count
    FROM migration_000020_characters;

    SELECT COUNT(*)
    INTO relation_count
    FROM character_occupations relation
    JOIN migration_000020_characters tracked
        ON tracked.character_id = relation.character_id;

    SELECT COUNT(*)
    INTO hint_count
    FROM hints hint
    JOIN migration_000020_characters tracked
        ON tracked.character_id = hint.character_id;

    IF expected_count <> 66
       OR inserted_count <> expected_count
       OR relation_count <> expected_count
       OR hint_count <> expected_count THEN
        RAISE EXCEPTION
            'Carga incompleta: fichas %, personajes %, relaciones %, pistas %; se esperaban 66.',
            expected_count,
            inserted_count,
            relation_count,
            hint_count;
    END IF;

    IF EXISTS (
        WITH expected_categories(name, expected_count) AS (
            VALUES
                ('Gobierno y Poder', 4),
                ('Ciencias y Conocimiento', 5),
                ('Arte y Comunicación', 5),
                ('Religión y Pensamiento Social', 4),
                ('Exploración e Innovación', 14),
                ('Salud', 4),
                ('Derecho y Justicia', 3),
                ('Deportes', 27)
        ),
        actual_categories AS (
            SELECT category.name, COUNT(DISTINCT character.id) AS actual_count
            FROM migration_000020_characters tracked
            JOIN characters character
                ON character.id = tracked.character_id
            JOIN character_occupations relation
                ON relation.character_id = character.id
            JOIN occupations occupation
                ON occupation.id = relation.occupation_id
            JOIN categories category
                ON category.id = occupation.category_id
            GROUP BY category.name
        )
        SELECT 1
        FROM expected_categories expected
        LEFT JOIN actual_categories actual
            ON actual.name = expected.name
        WHERE COALESCE(actual.actual_count, 0) <> expected.expected_count
    ) THEN
        RAISE EXCEPTION
            'La cantidad de personajes asociados a una o más categorías no coincide con los datos esperados.';
    END IF;
END $$;

DROP TABLE _seed_characters_000020;
