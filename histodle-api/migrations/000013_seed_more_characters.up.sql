-- Evita nombres repetidos en los personajes ya existentes.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM characters
        GROUP BY lower(btrim(name))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Hay personajes duplicados por nombre normalizado. Resolvelos antes de aplicar esta migración.';
    END IF;
END $$;

-- Protege los nombres de personajes ante diferencias de mayúsculas y espacios.
CREATE UNIQUE INDEX uq_characters_name_normalized
    ON characters (lower(btrim(name)));

-- El catálogo actual no garantiza nombres de ocupación únicos.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM occupations
        GROUP BY lower(btrim(name))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'Hay ocupaciones duplicadas por nombre normalizado. Resolvelas antes de aplicar esta migración.';
    END IF;
END $$;

CREATE UNIQUE INDEX uq_occupations_name_normalized
    ON occupations (lower(btrim(name)));

-- Tabla temporal con los datos que se van a cargar.
CREATE TEMP TABLE _seed_characters_000013 (
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
    know_for TEXT NOT NULL,
    position TEXT NOT NULL,
    birth_year INTEGER NOT NULL,
    year_of_death INTEGER NOT NULL,
    occupation_name TEXT NOT NULL,
    category_name TEXT NOT NULL,
    difficulty_name TEXT NOT NULL CHECK (
        difficulty_name IN ('facil', 'medio', 'dificil')
    )
);

-- Carga los personajes y su dificultad estimada por popularidad
INSERT INTO _seed_characters_000013 (
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
    ('Ramsés II', 'Masculino', 'Edad Antigua', 'Egipto', 'Africa', 'Gobernó durante una de las etapas de mayor expansión del antiguo Egipto', 'Faraón', -1303, -1213, 'Gobernante', 'Gobierno y Poder', 'medio'),
    ('Ciro el Grande', 'Masculino', 'Edad Antigua', 'Persia', 'Asia', 'Fundó el Imperio aqueménida', 'Rey', -600, -530, 'Gobernante', 'Gobierno y Poder', 'medio'),
    ('Augusto', 'Masculino', 'Edad Antigua', 'Roma', 'Europa', 'Primer emperador romano', 'Emperador', -63, 14, 'Gobernante', 'Gobierno y Poder', 'facil'),
    ('Carlomagno', 'Masculino', 'Edad Media', 'Reino de los francos', 'Europa', 'Unificó gran parte de Europa occidental y fue emperador', 'Emperador', 742, 814, 'Gobernante', 'Gobierno y Poder', 'medio'),
    ('Isabel I de Inglaterra', 'Femenino', 'Edad Moderna', 'Inglaterra', 'Europa', 'Reina durante la expansión marítima y cultural inglesa', 'Reina', 1533, 1603, 'Gobernante', 'Gobierno y Poder', 'facil'),
    ('Pedro el Grande', 'Masculino', 'Edad Moderna', 'Rusia', 'Europa', 'Modernizó Rusia y fundó San Petersburgo', 'Zar', 1672, 1725, 'Gobernante', 'Gobierno y Poder', 'medio'),
    ('Luis XIV', 'Masculino', 'Edad Moderna', 'Francia', 'Europa', 'Monarca francés conocido como el Rey Sol', 'Rey', 1638, 1715, 'Gobernante', 'Gobierno y Poder', 'facil'),
    ('George Washington', 'Masculino', 'Edad Moderna', 'Estados Unidos', 'America', 'Primer presidente de Estados Unidos y comandante durante su independencia', 'Presidente y militar', 1732, 1799, 'Político', 'Gobierno y Poder', 'facil'),
    ('Franklin D. Roosevelt', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Presidió Estados Unidos durante la Gran Depresión y la Segunda Guerra Mundial', 'Presidente', 1882, 1945, 'Político', 'Gobierno y Poder', 'facil'),
    ('Winston Churchill', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Primer ministro británico durante gran parte de la Segunda Guerra Mundial', 'Primer ministro', 1874, 1965, 'Político', 'Gobierno y Poder', 'facil'),

    -- Ciencias y Conocimiento
    ('Arquímedes', 'Masculino', 'Edad Antigua', 'Siracusa', 'Europa', 'Aportes fundamentales a la matemática y la física', 'Matemático e inventor', -287, -212, 'Matemático', 'Ciencias y Conocimiento', 'facil'),
    ('Euclides', 'Masculino', 'Edad Antigua', 'Grecia', 'Europa', 'Sistematizó la geometría en la obra Elementos', 'Matemático', -325, -265, 'Matemático', 'Ciencias y Conocimiento', 'medio'),
    ('Claudio Ptolomeo', 'Masculino', 'Edad Antigua', 'Egipto', 'Africa', 'Desarrolló un influyente modelo astronómico geocéntrico', 'Astrónomo y matemático', 100, 170, 'Científico', 'Ciencias y Conocimiento', 'medio'),
    ('Nicolás Copérnico', 'Masculino', 'Edad Moderna', 'Polonia', 'Europa', 'Propuso un modelo heliocéntrico del sistema planetario', 'Astrónomo', 1473, 1543, 'Científico', 'Ciencias y Conocimiento', 'facil'),
    ('Johannes Kepler', 'Masculino', 'Edad Moderna', 'Alemania', 'Europa', 'Formuló leyes sobre el movimiento de los planetas', 'Astrónomo y matemático', 1571, 1630, 'Científico', 'Ciencias y Conocimiento', 'medio'),
    ('Michael Faraday', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Aportes al electromagnetismo y la electroquímica', 'Físico y químico', 1791, 1867, 'Científico', 'Ciencias y Conocimiento', 'medio'),
    ('James Clerk Maxwell', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Formuló ecuaciones fundamentales del electromagnetismo', 'Físico y matemático', 1831, 1879, 'Científico', 'Ciencias y Conocimiento', 'dificil'),
    ('Dmitri Mendeléyev', 'Masculino', 'Edad Contemporanea', 'Rusia', 'Europa', 'Organizó la tabla periódica de los elementos', 'Químico', 1834, 1907, 'Científico', 'Ciencias y Conocimiento', 'facil'),

    -- Arte y Comunicación
    ('Homero', 'Masculino', 'Edad Antigua', 'Grecia', 'Europa', 'Tradicionalmente asociado con la Ilíada y la Odisea', 'Poeta', -800, -701, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Virgilio', 'Masculino', 'Edad Antigua', 'Roma', 'Europa', 'Autor de la Eneida', 'Poeta', -70, -19, 'Escritor', 'Arte y Comunicación', 'medio'),
    ('Miguel de Cervantes', 'Masculino', 'Edad Moderna', 'España', 'Europa', 'Autor de Don Quijote de la Mancha', 'Escritor', 1547, 1616, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Charles Dickens', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Autor de Oliver Twist y Grandes esperanzas', 'Novelista', 1812, 1870, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Victor Hugo', 'Masculino', 'Edad Contemporanea', 'Francia', 'Europa', 'Autor de Los miserables y Nuestra Señora de París', 'Escritor y poeta', 1802, 1885, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Mary Shelley', 'Femenino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Autora de Frankenstein', 'Novelista', 1797, 1851, 'Escritor', 'Arte y Comunicación', 'facil'),
    ('Vincent van Gogh', 'Masculino', 'Edad Contemporanea', 'Países Bajos', 'Europa', 'Pintor de obras como La noche estrellada', 'Pintor', 1853, 1890, 'Artista', 'Arte y Comunicación', 'facil'),
    ('Claude Monet', 'Masculino', 'Edad Contemporanea', 'Francia', 'Europa', 'Pintor asociado con el impresionismo', 'Pintor', 1840, 1926, 'Artista', 'Arte y Comunicación', 'facil'),
    ('Pablo Picasso', 'Masculino', 'Edad Contemporanea', 'España', 'Europa', 'Pintor y escultor, figura clave del cubismo', 'Artista', 1881, 1973, 'Artista', 'Arte y Comunicación', 'facil'),

    -- Religión y Pensamiento Social
    ('Siddhartha Gautama', 'Masculino', 'Edad Antigua', 'India', 'Asia', 'Figura espiritual asociada con el origen del budismo', 'Maestro espiritual', -563, -483, 'Religioso', 'Religión y Pensamiento Social', 'facil'),
    ('Jesús de Nazaret', 'Masculino', 'Edad Antigua', 'Judea', 'Asia', 'Figura central del cristianismo', 'Predicador', -4, 30, 'Religioso', 'Religión y Pensamiento Social', 'facil'),
    ('Mahoma', 'Masculino', 'Edad Media', 'Arabia', 'Asia', 'Figura central del islam', 'Líder religioso', 570, 632, 'Religioso', 'Religión y Pensamiento Social', 'facil'),
    ('Francisco de Asís', 'Masculino', 'Edad Media', 'Italia', 'Europa', 'Fundador de la orden franciscana', 'Religioso', 1181, 1226, 'Religioso', 'Religión y Pensamiento Social', 'medio'),
    ('Martín Lutero', 'Masculino', 'Edad Moderna', 'Alemania', 'Europa', 'Figura central de la Reforma protestante', 'Teólogo y reformador', 1483, 1546, 'Religioso', 'Religión y Pensamiento Social', 'facil'),

    -- Exploración e Innovación
    ('Marco Polo', 'Masculino', 'Edad Media', 'Venecia', 'Europa', 'Viajero cuyos relatos describieron sus viajes por Asia', 'Explorador y comerciante', 1254, 1324, 'Explorador', 'Exploración e Innovación', 'facil'),
    ('Fernando de Magallanes', 'Masculino', 'Edad Moderna', 'Portugal', 'Europa', 'Expedición que inició la primera circunnavegación del mundo', 'Navegante y explorador', 1480, 1521, 'Explorador', 'Exploración e Innovación', 'facil'),
    ('James Cook', 'Masculino', 'Edad Moderna', 'Reino Unido', 'Europa', 'Realizó expediciones cartográficas por el océano Pacífico', 'Navegante y explorador', 1728, 1779, 'Explorador', 'Exploración e Innovación', 'medio'),
    ('Neil Armstrong', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Fue el primer ser humano en caminar sobre la Luna', 'Astronauta', 1930, 2012, 'Astronauta', 'Exploración e Innovación', 'facil'),
    ('Yuri Gagarin', 'Masculino', 'Edad Contemporanea', 'Unión Soviética', 'Europa', 'Fue el primer ser humano en viajar al espacio', 'Cosmonauta', 1934, 1968, 'Astronauta', 'Exploración e Innovación', 'medio'),
    ('Orville Wright', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Realizó junto con su hermano vuelos pioneros en una aeronave motorizada', 'Aviador e inventor', 1871, 1948, 'Aviador', 'Exploración e Innovación', 'medio'),
    ('Wilbur Wright', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Realizó junto con su hermano vuelos pioneros en una aeronave motorizada', 'Aviador e inventor', 1867, 1912, 'Aviador', 'Exploración e Innovación', 'medio'),
    ('James Watt', 'Masculino', 'Edad Moderna', 'Escocia', 'Europa', 'Perfeccionó la máquina de vapor y contribuyó a la Revolución Industrial', 'Ingeniero e inventor', 1736, 1819, 'Inventor', 'Exploración e Innovación', 'medio'),

    -- Salud
    ('Hipócrates', 'Masculino', 'Edad Antigua', 'Grecia', 'Europa', 'Figura histórica asociada con el desarrollo de la medicina', 'Médico', -460, -370, 'Médico', 'Salud', 'facil'),
    ('Alexander Fleming', 'Masculino', 'Edad Contemporanea', 'Reino Unido', 'Europa', 'Descubrió la penicilina', 'Médico y bacteriólogo', 1881, 1955, 'Médico', 'Salud', 'facil'),
    ('Louis Pasteur', 'Masculino', 'Edad Contemporanea', 'Francia', 'Europa', 'Desarrolló vacunas y la pasteurización', 'Microbiólogo y químico', 1822, 1895, 'Médico', 'Salud', 'facil'),

    -- Derecho y Justicia
    ('Cicerón', 'Masculino', 'Edad Antigua', 'Roma', 'Europa', 'Orador, político y autor de textos sobre leyes y gobierno', 'Abogado y político', -106, -43, 'Abogado', 'Derecho y Justicia', 'medio'),

    -- Deportes
    ('Muhammad Ali', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Boxeador campeón olímpico y mundial de peso pesado', 'Boxeador', 1942, 2016, 'Boxeador', 'Deportes', 'facil'),
    ('Michael Jordan', 'Masculino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Estrella del baloncesto y seis veces campeón de la NBA', 'Basquetbolista', 1963, 0, 'Basquetbolista', 'Deportes', 'facil'),
    ('Ayrton Senna', 'Masculino', 'Edad Contemporanea', 'Brasil', 'America', 'Piloto brasileño y tricampeón mundial de Fórmula 1', 'Piloto de automovilismo', 1960, 1994, 'Piloto de automovilismo', 'Deportes', 'facil'),
    ('Juan Manuel Fangio', 'Masculino', 'Edad Contemporanea', 'Argentina', 'America', 'Piloto argentino y cinco veces campeón mundial de Fórmula 1', 'Piloto de automovilismo', 1911, 1995, 'Piloto de automovilismo', 'Deportes', 'facil'),
    ('Usain Bolt', 'Masculino', 'Edad Contemporanea', 'Jamaica', 'America', 'Velocista y múltiple campeón olímpico', 'Atleta velocista', 1986, 0, 'Atleta', 'Deportes', 'facil'),
    ('Serena Williams', 'Femenino', 'Edad Contemporanea', 'Estados Unidos', 'America', 'Tenista con múltiples títulos de Grand Slam', 'Tenista', 1981, 0, 'Tenista', 'Deportes', 'facil'),
    ('Roger Federer', 'Masculino', 'Edad Contemporanea', 'Suiza', 'Europa', 'Tenista con múltiples títulos de Grand Slam', 'Tenista', 1981, 0, 'Tenista', 'Deportes', 'facil'),
    ('Rafael Nadal', 'Masculino', 'Edad Contemporanea', 'España', 'Europa', 'Tenista con múltiples títulos de Grand Slam y de Roland Garros', 'Tenista', 1986, 0, 'Tenista', 'Deportes', 'facil');

-- Comprueba que existan las ocho categorías requeridas, además de los valores
-- de ocupación, dificultad y nombre definidos en la carga.

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
        FROM _seed_characters_000013
        GROUP BY lower(btrim(name))
        HAVING COUNT(*) > 1
    ) THEN
        RAISE EXCEPTION
            'La lista contiene personajes duplicados por nombre normalizado.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000013 seed
        JOIN characters character
            ON lower(btrim(character.name)) = lower(btrim(seed.name))
    ) THEN
        RAISE EXCEPTION
            'Uno o más personajes de la migración ya existen. Revisá los nombres antes de continuar.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000013 seed
        LEFT JOIN difficulties difficulty
            ON difficulty.name = seed.difficulty_name
        WHERE difficulty.id IS NULL
    ) THEN
        RAISE EXCEPTION
            'Falta una dificultad requerida. Verificá que existan facil, medio y dificil.';
    END IF;
END $$;

-- Tablas persistentes para que el down elimine solo lo creado por esta migración.
CREATE TABLE migration_000013_characters (
    character_id BIGINT PRIMARY KEY
        REFERENCES characters(id) ON DELETE CASCADE
);

CREATE TABLE migration_000013_occupations (
    occupation_id BIGINT PRIMARY KEY
        REFERENCES occupations(id) ON DELETE CASCADE
);

-- Crea ocupaciones nuevas asociadas a categorías existentes.
-- Si una ocupación ya existe, el índice único normalizado evita duplicarla.
WITH desired_occupations(name, category_name) AS (
    VALUES
        ('Astronauta', 'Exploración e Innovación'),
        ('Médico', 'Salud'),
        ('Boxeador', 'Deportes'),
        ('Basquetbolista', 'Deportes'),
        ('Piloto de automovilismo', 'Deportes'),
        ('Atleta', 'Deportes'),
        ('Tenista', 'Deportes')
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
INSERT INTO migration_000013_occupations (occupation_id)
SELECT id
FROM inserted_occupations;

-- Verifica que cada ocupación exista y pertenezca a la categoría prevista.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM _seed_characters_000013 seed
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

-- Inserta los personajes, incluyendo la dificultad asociada a su popularidad,
-- y registra sus IDs para que el down pueda eliminarlos.
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
    FROM _seed_characters_000013 seed
    JOIN difficulties difficulty
        ON difficulty.name = seed.difficulty_name
    RETURNING id
)
INSERT INTO migration_000013_characters (character_id)
SELECT id
FROM inserted_characters;

-- Asocia cada personaje con su ocupación y categoría correspondiente.
INSERT INTO character_occupations (character_id, occupation_id)
SELECT character.id, occupation.id
FROM _seed_characters_000013 seed
JOIN characters character
    ON lower(btrim(character.name)) = lower(btrim(seed.name))
JOIN occupations occupation
    ON lower(btrim(occupation.name)) =
       lower(btrim(seed.occupation_name))
JOIN categories category
    ON category.id = occupation.category_id
   AND category.name = seed.category_name
JOIN migration_000013_characters tracked
    ON tracked.character_id = character.id;

-- Verifica cantidad de personajes, relaciones y distribución por categoría.
DO $$
DECLARE
    expected_count INTEGER;
    inserted_count INTEGER;
    relation_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO expected_count
    FROM _seed_characters_000013;

    SELECT COUNT(*)
    INTO inserted_count
    FROM migration_000013_characters;

    SELECT COUNT(*)
    INTO relation_count
    FROM character_occupations relation
    JOIN migration_000013_characters tracked
        ON tracked.character_id = relation.character_id;

    IF expected_count <> 52
       OR inserted_count <> expected_count
       OR relation_count <> expected_count THEN
        RAISE EXCEPTION
            'Carga incompleta: fichas %, personajes insertados %, relaciones %; se esperaban 52.',
            expected_count,
            inserted_count,
            relation_count;
    END IF;

    IF EXISTS (
        WITH expected_categories(name, expected_count) AS (
            VALUES
                ('Gobierno y Poder', 10),
                ('Ciencias y Conocimiento', 8),
                ('Arte y Comunicación', 9),
                ('Religión y Pensamiento Social', 5),
                ('Exploración e Innovación', 8),
                ('Salud', 3),
                ('Derecho y Justicia', 1),
                ('Deportes', 8)
        ),
        actual_categories AS (
            SELECT category.name, COUNT(DISTINCT character.id) AS actual_count
            FROM migration_000013_characters tracked
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

DROP TABLE _seed_characters_000013;