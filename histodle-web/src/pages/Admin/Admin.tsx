import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { Occupation } from '../../types/occupations';
import type { Difficulty } from '../../types/difficulty';
import type { Character, CharacterInput } from '../../types/character';
import CharacterForm from '../../components/CharacterForm/CharacterForm';
import CharactersTable from '../../components/CharactersTable/CharactersTable';
import './Admin.css';
import { sileo } from 'sileo';

//servicios
import { createCharacter, deleteCharacter as deleteCharacterRequest, getCharacters, updateCharacter } from '../../services/character';
import { getOccupations } from '../../services/occupations';
import { getDifficulties } from '../../services/difficulties';

interface AdminOutletContext {
    characters: Character[];
    occupations: Occupation[];
    difficulties: Difficulty[];
    removeCharacter: (id: number) => Promise<void>;
}

const AdminLayout: React.FC = () => {
        const [characters, setCharacters] = useState<Character[]>([]);
        const [occupationsCount, setOccupationsCount] = useState(0);
        const [occupations, setOccupations] = useState<Occupation[]>([]);
        const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
        const [difficultiesCount, setDifficultiesCount] = useState(0);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const location = useLocation();

    useEffect(() => {
        Promise.all([getCharacters(), getOccupations(), getDifficulties()])
        .then(([loadedCharacters, loadedOccupations, loadedDifficulties]) => {
            setCharacters(loadedCharacters);
            setOccupationsCount(loadedOccupations.length);
            setOccupations(loadedOccupations);
            setDifficultiesCount(loadedDifficulties.length);
            setDifficulties(loadedDifficulties);
        })
        .catch((reason: unknown) => {
            setError(reason instanceof Error ? reason.message : 'Error al cargar los datos');
        })
        .finally(() => setLoading(false));
    }, [location.pathname]);

    if (loading) return <p className="loading-text">Cargando datos...</p>;
    if (error) return <p className="error-text" role="alert">{error}</p>;

    const removeCharacter = async (id: number) => {
        await deleteCharacterRequest(id);
        setCharacters((current) => current.filter((character) => character.id !== id));
    };

    return (
        <section className="admin-container">
            <p className="eyebrow">Panel de conrol</p>
            <h1 className='admin-title'>Administrador</h1>
            <p className="admin-subtitle">
                Gestioná los personajes y ocupaciones del juego.
            </p>

            <div className="tabs-container">
                <NavLink
                to="/admin/characters"
                className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                Personajes ({characters.length})
                </NavLink>

                <NavLink
                to="/admin/occupations"
                className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                Ocupaciones ({occupationsCount})
                </NavLink>

                <NavLink
                to="/admin/difficulties"
                className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                Dificultades ({difficultiesCount})
                </NavLink>
            </div>

            <div className="admin-content">
                <Outlet context={{ characters, occupations, difficulties, removeCharacter }} />
            </div>
        </section>
    );
};

export const CharacterFormOutlet: React.FC = () => {
    const { characters, occupations, difficulties } = useOutletContext<AdminOutletContext>();
    const { id } = useParams();
    const navigate = useNavigate();
    const character = id ? characters.find((item) => item.id === Number(id)) : undefined;

    if (id && !character) {
        return <p className="error-text" role="alert">No se encontró el personaje que quieres modificar.</p>;
    }

    const initialValues: CharacterInput | undefined = character
        ? {
            name: character.name,
            difficultyId: character.difficultyId,
            gender: character.gender,
            period: character.period,
            country: character.country,
            continent: character.continent,
            knowFor: character.knowFor,
            position: character.position,
            birthYear: character.birthYear,
            yearOfDeath: character.yearOfDeath,
            occupationIds: character.occupations.map((occupation) => occupation.id),
            hints: (character.hints ?? []).map(({ id, text }) => ({ id, text })),
        }
        : undefined;

    const handleSubmit = async (formData: CharacterInput) => {
        if (character) {
            const creation = Promise.all([
                updateCharacter(character.id, formData),
                new Promise<void>((resolve) => window.setTimeout(resolve, 500)),
            ]).then(([updatedCharacter]) => updatedCharacter);

            await sileo.promise(creation, {
                loading: { title: 'Moficando personaje...' },
                success: { title: '¡Personaje modificado exitosamente!' },
                error: { title: 'Error al modificar el personaje' },
            });
        } else {
            const creation = Promise.all([
                createCharacter(formData),
                new Promise<void>((resolve) => window.setTimeout(resolve, 500)),
            ]).then(([createdCharacter]) => createdCharacter);

            await sileo.promise(creation, {
                loading: { title: 'Creando personaje...' },
                success: { title: '¡Personaje creado exitosamente!' },
                error: { title: 'Error al crear el personaje' },
            });
        }
        navigate('/admin/characters');
    };

    return (
        <CharacterForm
            key={character?.id ?? 'new-character'}
            initialValues={initialValues}
            occupations={occupations}
            difficulties={difficulties}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/characters')}
            title={character ? 'Modificar personaje' : 'Registrar personaje'}
            submitButtonText={character ? 'Guardar cambios' : 'Registrar'}
        />
    );
};

export const CharactersTableOutlet: React.FC = () => {
    const { characters, removeCharacter } = useOutletContext<AdminOutletContext>();
    return (
        <CharactersTable
            characters={characters}
            onSelectCharacter={() => {}}
            onEdit={() => {}}
            onDelete={(character) => removeCharacter(character.id)}
        />
    );
};

export default AdminLayout;