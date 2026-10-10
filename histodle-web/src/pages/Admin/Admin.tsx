import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { Occupation } from '../../types/occupations';
import type { Character, CharacterInput } from '../../types/character';
import CharacterForm from '../../components/CharacterForm/CharacterForm';
import CharactersTable from '../../components/CharactersTable/CharactersTable';
import './Admin.css';

//servicios
import { createCharacter, deleteCharacter as deleteCharacterRequest, getCharacters, updateCharacter } from '../../services/character';
import { getOccupations } from '../../services/occupations';

interface AdminOutletContext {
    characters: Character[];
    occupations: Occupation[];
    removeCharacter: (id: number) => Promise<void>;
}

const AdminLayout: React.FC = () => {
        const [characters, setCharacters] = useState<Character[]>([]);
        const [occupationsCount, setOccupationsCount] = useState(0);
        const [occupations, setOccupations] = useState<Occupation[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const location = useLocation();

    useEffect(() => {
        Promise.all([getCharacters(), getOccupations()])
        .then(([loadedCharacters, loadedOccupations]) => {
            setCharacters(loadedCharacters);
            setOccupationsCount(loadedOccupations.length);
            setOccupations(loadedOccupations);
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
        <h1>Administrador</h1>
        <p className="admin-subtitle">
            Gestioná los personajes, ocupaciones y niveles del juego.
        </p>

        <div className="tabs-container">
            <NavLink
            to="/admin/characters"
            className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
            >
            Personajes <span className="tab-count">{characters.length}</span>
            </NavLink>

            <NavLink
            to="/admin/occupations"
            className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
            >
            Ocupaciones <span className="tab-count">{occupationsCount}</span>
            </NavLink>
        </div>

        <div className="admin-content">
            <Outlet context={{ characters, occupations, removeCharacter }} />
        </div>
        </section>
    );
};

export const CharacterFormOutlet: React.FC = () => {
    const { characters, occupations } = useOutletContext<AdminOutletContext>();
    const { id } = useParams();
    const navigate = useNavigate();
    const character = id ? characters.find((item) => item.id === Number(id)) : undefined;

    if (id && !character) {
        return <p className="error-text" role="alert">No se encontró el personaje que quieres modificar.</p>;
    }

    const initialValues: CharacterInput | undefined = character
        ? {
            name: character.name,
            gender: character.gender,
            period: character.period,
            country: character.country,
            continent: character.continent,
            knowFor: character.knowFor,
            position: character.position,
            birthYear: character.birthYear,
            yearOfDeath: character.yearOfDeath,
            occupationIds: character.occupations.map((occupation) => occupation.id),
        }
        : undefined;

    const handleSubmit = async (formData: CharacterInput) => {
        if (character) {
            await updateCharacter(character.id, formData);
        } else {
            await createCharacter(formData);
        }
        navigate('/admin/characters');
    };

    return (
        <CharacterForm
            initialValues={initialValues}
            occupations={occupations}
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