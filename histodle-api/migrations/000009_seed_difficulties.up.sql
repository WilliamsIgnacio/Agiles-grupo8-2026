INSERT INTO difficulties (name) VALUES
    ('facil'),
    ('medio'),
    ('dificil')
ON CONFLICT (name) DO NOTHING;
