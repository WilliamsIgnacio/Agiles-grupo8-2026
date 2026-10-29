import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChallenges } from '../../services/challenges';
import type { Challenge } from '../../types/challenge';
import './ChallengesTable.css';

const ChallengesTable: React.FC = () => {
    const navigate = useNavigate();
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCurrent = true;

        getChallenges()
            .then((loadedChallenges) => {
                if (isCurrent) setChallenges(loadedChallenges);
            })
            .catch((reason: unknown) => {
                if (isCurrent) {
                    setError(
                        reason instanceof Error ? reason.message : 'Error al cargar los desafíos',
                    );
                }
            })
            .finally(() => {
                if (isCurrent) setLoading(false);
            });

        return () => {
            isCurrent = false;
        };
    }, []);

    const filteredChallenges = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase();
        if (!query) return challenges;

        return challenges.filter((challenge) =>
            [
                challenge.name,
                challenge.description,
                challenge.character.name,
                challenge.character.difficulty.name,
            ].some((value) => value.toLocaleLowerCase().includes(query)),
        );
    }, [challenges, searchTerm]);

    return (
        <div className="challenges-container">
            <div className="challenges-header-bar">
                <div className="challenges-search-wrapper">
                    <svg
                        className="challenges-search-icon"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        type="search"
                        className="challenges-search-input"
                        placeholder="Buscar desafío..."
                        aria-label="Buscar desafío"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
                <button
                    type="button"
                    className="btn-register-challenge"
                    onClick={() => navigate('/admin/challenges/register')}
                >
                    + Registrar desafío
                </button>
            </div>

            {loading ? (
                <p className="challenges-status" role="status">Cargando desafíos...</p>
            ) : error ? (
                <p className="challenges-error" role="alert">{error}</p>
            ) : challenges.length === 0 ? (
                <p className="challenges-status">Todavía no hay desafíos registrados.</p>
            ) : filteredChallenges.length === 0 ? (
                <p className="challenges-status">No se encontraron desafíos para esa búsqueda.</p>
            ) : (
                <div className="challenges-grid">
                    {filteredChallenges.map((challenge) => (
                        <article className="challenge-admin-card" key={challenge.id}>
                            <div className="challenge-admin-card-header">
                                <h2 className="challenge-admin-name">{challenge.name}</h2>
                                <button
                                    type="button"
                                    className="challenge-edit-button"
                                    onClick={() => navigate(`/admin/challenges/edit/${challenge.id}`)}
                                    aria-label={`Modificar ${challenge.name}`}
                                >
                                    Modificar
                                </button>
                            </div>
                            <p className="challenge-card-description">{challenge.description}</p>
                            <div className="challenge-admin-details">
                                <span>Personaje a adivinar: {challenge.character.name}</span>
                                <span>Dificultad: {challenge.character.difficulty.name}</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChallengesTable;
