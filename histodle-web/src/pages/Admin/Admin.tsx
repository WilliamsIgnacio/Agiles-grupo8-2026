import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import type { Occupation } from '../../types/occupations';
import type { Difficulty } from '../../types/difficulty';
import type { Character, CharacterInput } from '../../types/character';
import type { Score } from '../../types/score';
import CharacterForm from '../../components/CharacterForm/CharacterForm';
import CharactersTable from '../../components/CharactersTable/CharactersTable';
import ChallengesForm from '../../components/ChallengesForm/ChallengesForm';
import ChallengesTable from '../../components/ChallengesTable/ChallengesTable';
import ScoresTable from '../../components/ScoresTable/ScoresTable';
import './Admin.css';
import { sileo } from 'sileo';

//servicios
import { createCharacter, deleteCharacter as deleteCharacterRequest, getCharacters, updateCharacter } from '../../services/character';
import { getOccupations } from '../../services/occupations';
import { getDifficulties } from '../../services/difficulties';
import { getChallenges } from '../../services/challenges';
import { getScores } from '../../services/scores';

interface AdminOutletContext {
    characters: Character[];
    occupations: Occupation[];
    difficulties: Difficulty[];
    scores: Score[];
    setScores: React.Dispatch<React.SetStateAction<Score[]>>;
    removeCharacter: (id: number) => Promise<void>;
}

const AdminLayout: React.FC = () => {
        const [characters, setCharacters] = useState<Character[]>([]);
        const [occupationsCount, setOccupationsCount] = useState(0);
        const [occupations, setOccupations] = useState<Occupation[]>([]);
        const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
        const [scores, setScores] = useState<Score[]>([]);
        const [difficultiesCount, setDifficultiesCount] = useState(0);
        const [challengesCount, setChallengesCount] = useState(0);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const location = useLocation();

    useEffect(() => {
        Promise.all([getCharacters(), getOccupations(), getDifficulties(), getChallenges(), getScores()])
        .then(([loadedCharacters, loadedOccupations, loadedDifficulties, loadedChallenges, loadedScores]) => {
            setCharacters(loadedCharacters);
            setOccupationsCount(loadedOccupations.length);
            setOccupations(loadedOccupations);
            setDifficultiesCount(loadedDifficulties.length);
            setDifficulties(loadedDifficulties);
            setChallengesCount(loadedChallenges.length);
            setScores(loadedScores);
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

                <NavLink
                to="/admin/challenges"
                className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                Desafíos ({challengesCount})
                </NavLink>

                <NavLink
                to="/admin/scores"
                className={({ isActive }) => `tab-button ${isActive ? 'active' : ''}`}
                >
                Configuración de puntajes ({scores.length})
                </NavLink>
            </div>

            <div className="admin-content">
                <Outlet context={{ characters, occupations, difficulties, scores, setScores, removeCharacter }} />
            </div>
        </section>
    );
};

export const ChallengesFormOutlet: React.FC = () => {
    const { characters } = useOutletContext<AdminOutletContext>();
    return <ChallengesForm characters={characters} />;
};

export const ChallengesTableOutlet: React.FC = () => <ChallengesTable />;

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

export const ScoresTableOutlet: React.FC = () => {
    const { difficulties, scores, setScores } = useOutletContext<AdminOutletContext>();

    return (
        <ScoresTable
            difficulties={difficulties}
            scores={scores}
            onScoresChange={setScores}
        />
    );
};

export default AdminLayout;