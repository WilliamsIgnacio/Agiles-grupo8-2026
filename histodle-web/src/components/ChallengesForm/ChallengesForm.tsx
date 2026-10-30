import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sileo } from 'sileo';
import { createChallenge, getChallenge, updateChallenge } from '../../services/challenges';
import type { Character } from '../../types/character';
import './ChallengesForm.css';

interface ChallengesFormProps {
    characters: Character[];
}

const ChallengesForm: React.FC<ChallengesFormProps> = ({ characters }) => {
    const navigate = useNavigate();
    const { id: challengeIdParam } = useParams<{ id: string }>();
    const challengeId = challengeIdParam ? Number(challengeIdParam) : undefined;
    const isEditing = challengeId !== undefined;
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(isEditing);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [characterId, setCharacterId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [challengeLoadError, setChallengeLoadError] = useState<string | null>(null);

    useEffect(() => {
        if (challengeId === undefined) return;
        if (!Number.isSafeInteger(challengeId) || challengeId <= 0) {
            setChallengeLoadError('El ID del desafío no es válido.');
            setIsLoadingChallenge(false);
            return;
        }
        let isCurrent = true;

        getChallenge(challengeId)
            .then((challenge) => {
                if (!isCurrent) return;
                setName(challenge.name);
                setDescription(challenge.description);
                setCharacterId(String(challenge.characterId));
            })
            .catch((reason: unknown) => {
                if (isCurrent) {
                    setChallengeLoadError(
                        reason instanceof Error ? reason.message : 'Error al cargar el desafío',
                    );
                }
            })
            .finally(() => {
                if (isCurrent) setIsLoadingChallenge(false);
            });

        return () => {
            isCurrent = false;
        };
    }, [challengeId]);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);
        try {
            const challengeData = {
                name: name.trim(),
                description: description.trim(),
                characterId: Number(characterId),
            };
            await sileo.promise(
                challengeId !== undefined
                    ? updateChallenge(challengeId, challengeData)
                    : createChallenge(challengeData),
                {
                    loading: { title: isEditing ? 'Modificando desafío...' : 'Creando desafío...' },
                    success: { title: isEditing ? '¡Desafío modificado!' : '¡Desafío creado!' },
                    error: { title: isEditing ? 'Error al modificar el desafío' : 'Error al crear el desafío' },
                },
            );
            navigate('/admin/challenges');
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al crear el desafío');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingChallenge) {
        return <p className="loading-text" role="status">Cargando desafío...</p>;
    }

    if (challengeLoadError) {
        return (
            <section className="challenge-admin-section">
                <p className="error-text" role="alert">{challengeLoadError}</p>
                <button
                    type="button"
                    className="btn-cancel-challenge"
                    onClick={() => navigate('/admin/challenges')}
                >
                    Volver a desafíos
                </button>
            </section>
        );
    }

    return (
        <section className="challenge-admin-section" aria-labelledby="challenge-form-title">
            <h2 id="challenge-form-title">{isEditing ? 'Modificar desafío' : 'Registrar desafío'}</h2>
            <p className="challenge-admin-description">
                Elegí el personaje que se debe adivinar y agregá un nombre y una descripción.
            </p>
            {error && <p className="error-text" role="alert">{error}</p>}

            <form className="challenge-create-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="challenge-name">Nombre</label>
                        <input
                            id="challenge-name"
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            maxLength={200}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="challenge-description">Descripción</label>
                        <textarea
                            id="challenge-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="challenge-character">Personaje a descubrir</label>
                        <select
                            id="challenge-character"
                            value={characterId}
                            onChange={(event) => setCharacterId(event.target.value)}
                            required
                        >
                            <option value="">Seleccioná un personaje</option>
                            {characters.map((character) => (
                                <option key={character.id} value={character.id}>
                                    {character.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        className="btn-create-challenge"
                        type="submit"
                        disabled={isSubmitting || !characters.length}
                    >
                        {isSubmitting
                            ? (isEditing ? 'Guardando...' : 'Creando...')
                            : (isEditing ? 'Guardar cambios' : 'Crear desafío')}
                    </button>
                    {!characters.length && (
                        <p className="error-text" role="alert">
                            No hay personajes disponibles para crear un desafío.
                        </p>
                    )}
            </form>
            <button
                type="button"
                className="btn-cancel-challenge"
                onClick={() => navigate('/admin/challenges')}
            >
                Volver a desafíos
            </button>
        </section>
    );
};

export default ChallengesForm;
