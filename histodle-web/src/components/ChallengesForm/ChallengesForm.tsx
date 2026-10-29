import { useState, type FormEvent } from 'react';
import { sileo } from 'sileo';
import { createChallenge } from '../../services/challenges';
import type { Character } from '../../types/character';
import './ChallengesForm.css';

interface ChallengesFormProps {
    characters: Character[];
}

const ChallengesForm: React.FC<ChallengesFormProps> = ({ characters }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [characterId, setCharacterId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);
        try {
            await sileo.promise(
                createChallenge({
                    name: name.trim(),
                    description: description.trim(),
                    characterId: Number(characterId),
                }),
                {
                    loading: { title: 'Creando desafío...' },
                    success: { title: '¡Desafío creado!' },
                    error: { title: 'Error al crear el desafío' },
                },
            );
            setName('');
            setDescription('');
            setCharacterId('');
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al crear el desafío');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="challenge-admin-section" aria-labelledby="create-challenge-title">
            <h2 id="create-challenge-title">Crear desafío</h2>
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
                    {isSubmitting ? 'Creando...' : 'Crear desafío'}
                </button>
                {!characters.length && (
                    <p className="error-text" role="alert">
                        No hay personajes disponibles para crear un desafío.
                    </p>
                )}
            </form>
        </section>
    );
};

export default ChallengesForm;
