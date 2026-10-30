import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sileo } from 'sileo';

import { getCharacters } from '../../services/character';
import { getChallenge } from '../../services/challenges';
import { calculateScore } from '../../services/scores';
import type { Character } from '../../types/character';
import type { Challenge } from '../../types/challenge';
import './Level.css';

const MAX_ATTEMPTS = 10;

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

const getMatchClass = (matches: boolean) =>
    matches ? 'guess-value match' : 'guess-value mismatch';

    interface LevelProps {
        practiceMode?: boolean;
    }

    const Level: React.FC<LevelProps> = ({ practiceMode = false }) => {
    const { challengeId: challengeParam } = useParams<{ challengeId: string }>();
    const [searchParams] = useSearchParams();

    const challengeId = Number(challengeParam);
    const categoryParam = searchParams.get('categoryId') ?? 'all';
    const difficultyParam = searchParams.get('difficultyId') ?? 'default';
    const requestKey = `${practiceMode}:${challengeParam ?? ''}:${categoryParam}:${difficultyParam}`;
    const categoryId = Number(categoryParam);
    const difficultyId = Number(difficultyParam);
    const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);
    const invalidCategory =
        practiceMode &&
        categoryParam !== 'all' &&
        (!Number.isSafeInteger(categoryId) || categoryId <= 0);
    const invalidDifficulty =
        practiceMode &&
        difficultyParam !== 'default' &&
        (!Number.isSafeInteger(difficultyId) || difficultyId <= 0);
    const invalidChallenge =
        !practiceMode &&
        (!Number.isSafeInteger(challengeId) || challengeId <= 0);
    const loading = loadedRequestKey !== requestKey;

    const [characters, setCharacters] = useState<Character[]>([]);
    const [targetCandidates, setTargetCandidates] = useState<Character[]>([]);
    const [targetCharacter, setTargetCharacter] = useState<Character | null>(null);
    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [guesses, setGuesses] = useState<Character[]>([]);
    const [guessName, setGuessName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [attempts, setAttempts] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [scoreLoading, setScoreLoading] = useState(false);

    const startNextPractice = () => {
        const nextCharacters = targetCandidates.filter(
            (character) => character.id !== targetCharacter?.id,
        );
        const candidates = nextCharacters.length > 0 ? nextCharacters : targetCandidates;
        if (candidates.length === 0) return;

        sileo.clear();
        const nextTarget = candidates[Math.floor(Math.random() * candidates.length)];
        setTargetCharacter(nextTarget);
        setGuesses([]);
        setGuessName('');
        setMessage('');
        setAttempts(0);
        setHintsUsed(0);
        setFinalScore(null);
        setScoreLoading(false);
    };

    useEffect(() => {
        let isCurrentRequest = true;

        const isAllCategories = !practiceMode || categoryParam === 'all';

        if (invalidCategory || invalidDifficulty || invalidChallenge) {
            return () => {
                isCurrentRequest = false;
            };
        }

        const characterRequest = getCharacters();
        const challengeRequest = practiceMode
            ? Promise.resolve(null)
            : getChallenge(challengeId);

        Promise.all([characterRequest, challengeRequest])
        .then(([loadedCharacters, loadedChallenge]) => {
            if (!isCurrentRequest) return;

            const charactersWithOccupations = loadedCharacters.map((character) => ({
                ...character,
                occupations: character.occupations ?? [],
            }));

            const eligibleCharacters = isAllCategories
            ? charactersWithOccupations
            : charactersWithOccupations.filter((character) =>
                character.occupations.some(
                    (occupation) => occupation.categoryId === categoryId,
                ),
            );

            setError(null);
            setGuesses([]);
            setGuessName('');
            setMessage('');
            setAttempts(0);
            setHintsUsed(0);
            setFinalScore(null);
            setScoreLoading(false);
            setCharacters(eligibleCharacters);
            setChallenge(loadedChallenge);

            if (eligibleCharacters.length === 0) {
                setError('No hay personajes disponibles para esta categoría.');
                return;
            }

            if (practiceMode) {
                const eligibleTargets = difficultyParam === 'default'
                    ? eligibleCharacters
                    : eligibleCharacters.filter(
                        (character) => character.difficultyId === difficultyId,
                    );
                setTargetCandidates(eligibleTargets);
                if (eligibleTargets.length === 0) {
                    setError('No hay personajes disponibles para la combinación de categoría y dificultad seleccionada.');
                    return;
                }
                const randomIndex = Math.floor(
                    Math.random() * eligibleTargets.length,
                );
                setTargetCharacter(eligibleTargets[randomIndex]);
                return;
            }

            setTargetCandidates([]);
            const fixedTarget = eligibleCharacters.find(
                (character) => character.id === loadedChallenge?.characterId,
            );
            if (!loadedChallenge || !fixedTarget) {
                setError('No se encontró el personaje objetivo de este desafío.');
                return;
            }
            setTargetCharacter(fixedTarget);
        })
        .catch((reason: unknown) => {
            if (!isCurrentRequest) return;

            setError(
                reason instanceof Error ? reason.message : 'Error al cargar personajes',
            );
        })
        .finally(() => {
            if (isCurrentRequest) {
                setLoadedRequestKey(requestKey);
            }
        });

        return () => {
            isCurrentRequest = false;
        };
    }, [categoryId, categoryParam, challengeId, difficultyId, difficultyParam, invalidCategory, invalidChallenge, invalidDifficulty, practiceMode, requestKey]);

    const won =
        targetCharacter !== null &&
        guesses.some((guess) => guess.id === targetCharacter.id);

    const handleAttempt = () => {
        setAttempts((currentAttempts) => currentAttempts + 1);
    };

    const revealHint = () => {
        if (!targetCharacter || hintsUsed >= targetCharacter.hints.length || won) return;
        setHintsUsed((currentHints) => currentHints + 1);
    };

    const submitGuess = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (attempts >= MAX_ATTEMPTS) return;

        const guess = characters.find(
        (character) =>
            normalizeName(character.name) === normalizeName(guessName),
        );

        if (!guess) {
        setMessage('Ingresá un personaje de la lista.');
        return;
        }

        if (guesses.some((previousGuess) => previousGuess.id === guess.id)) {
            setMessage('Ya probaste ese personaje.');
            return;
        }

        handleAttempt();
        setGuesses((currentGuesses) => [guess, ...currentGuesses]);
        setGuessName('');
        setMessage('Intento agregado.');
        if (guess.id === targetCharacter?.id) {
            setScoreLoading(true);
            sileo.success({
                title: '¡Adivinaste el personaje!',
                description: `La respuesta era ${targetCharacter.name}.`,
                duration: 5000,
            });
            try {
                const result = await calculateScore(targetCharacter.difficultyId, {
                    attemptsUsed: attempts + 1,
                    hintsUsed,
                    won: true,
                });
                setFinalScore(result.score);
            } catch (reason: unknown) {
                setMessage(
                    reason instanceof Error
                        ? reason.message
                        : 'No se pudo calcular el puntaje.',
                );
            } finally {
                setScoreLoading(false);
            }
        } else if (practiceMode && attempts + 1 >= MAX_ATTEMPTS) {
            sileo.error({
                title: '¡Perdiste!',
                description: `Se acabaron los ${MAX_ATTEMPTS} intentos. El personaje era ${targetCharacter?.name}.`,
                duration: 5000,
            });
        }
    };

    if (invalidCategory || invalidDifficulty || invalidChallenge) {
        return (
            <section>
                <h1>{practiceMode ? 'Modo práctica' : 'Desafío'}</h1>
                <p role="alert">
                    {invalidCategory
                        ? 'La categoría seleccionada no es válida.'
                        : invalidDifficulty
                            ? 'La dificultad seleccionada no es válida.'
                            : 'El desafío seleccionado no es válido.'}
                </p>
                <Link to="/jugar">Volver a jugar</Link>
            </section>
        );
    }

    if (loading) return <p>Cargando personajes...</p>;

    if (error) {
        return (
        <section>
            <h1>{practiceMode ? 'Modo práctica' : 'Desafío'}</h1>
            <p role="alert">{error}</p>
            <Link to="/jugar">{practiceMode ? 'Volver a jugar' : 'Volver a desafíos'}</Link>
        </section>
        );
    }

    if (!targetCharacter) {
        return (
        <section>
            <h1>{practiceMode ? 'Modo práctica' : 'Desafío'}</h1>
            <p>No se pudo elegir un personaje para esta partida.</p>
            <Link to="/jugar">Volver a desafíos</Link>
        </section>
        );
    }

    const gridColors = [
        ['green', 'dark', 'yellow'],
        ['dark', 'green', 'yellow'],
        ['yellow', 'dark', 'green']
    ]

    return (
        <section className="level-page">
            <header className='level-header'>
                <h1>{practiceMode ? 'Modo práctica' : challenge?.name}</h1>
                <div className='attempts-container'>
                    <p className='attempts-text'>
                        {practiceMode ? (
                            <>
                                <strong className='attempts-count'>{attempts}</strong> intentos
                            </>
                        ) : (
                            <>
                                <strong className='attempts-count'>{MAX_ATTEMPTS - attempts}</strong> intentos restantes
                            </>
                        )}
                    </p>

                    {!practiceMode && <div className='attempts-bar'>
                        {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => {
                            const isUsed = index < attempts;
                            return (
                                <span 
                                    key={index}
                                    className={`attempt-pill ${isUsed ? 'used' : ''}`}
                                />
                            )
                        })}

                    </div>}
                </div>
            </header>
            {!practiceMode && challenge?.description && (
                <p className="challenge-description">{challenge.description}</p>
            )}

            <div className="hints-panel">
                <div>
                    <strong>Pistas utilizadas: {hintsUsed}</strong>
                    {targetCharacter.hints.slice(0, hintsUsed).map((hint) => (
                        <p key={hint.id}>{hint.text}</p>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={revealHint}
                    disabled={won || attempts >= MAX_ATTEMPTS || hintsUsed >= targetCharacter.hints.length}
                >
                    {hintsUsed < targetCharacter.hints.length
                        ? 'Revelar pista'
                        : 'No hay más pistas'}
                </button>
            </div>

            <form onSubmit={submitGuess}>
                <label htmlFor="character-guess">Ingresá un personaje</label>
                <input
                    id="character-guess"
                    list="characters-list"
                    value={guessName}
                    onChange={(event) => setGuessName(event.target.value)}
                    autoComplete="off"
                    disabled={won || attempts >= MAX_ATTEMPTS}
                />
                <datalist id="characters-list">
                {characters.map((character) => (
                    <option key={character.id} value={character.name} />
                ))}
                </datalist>
                <button
                    type="submit"
                    disabled={
                        won ||
                        attempts >= MAX_ATTEMPTS ||
                        guessName.trim() === ''
                    }
                >
                    Probar
                </button>
            </form>

            <div className="legend-row">
                <div className="legend-item">
                    <span className="legend-dot coincide"></span>
                    <span className='instruction'>Coincide</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot cerca"></span>
                    <span className='instruction'>Cerca</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot no-coincide"></span>
                    <span className='instruction'>No coincide</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot mayor">
                        <svg aria-hidden="true" viewBox="0 0 12 12">
                            <path d="M6 10V2M2.5 5.5 6 2l3.5 3.5" />
                        </svg>
                    </span>
                    <span className='instruction'>El misterioso tiene un valor mayor</span>
                </div>
            </div>

            {guesses.length === 0 && (
                <div className='info-card'>
                    <div className='info-grid'>
                        {gridColors.map((row, rowIndex) =>
                            row.map((color, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`grid-cell ${color}`}
                                />
                            ))
                        )}
                    </div>
                    <p className='info-text'>Escribí cualquier personaje histórico. Los colores te dirán qué tiene en común con el misterioso.</p>
                </div>
            )}


            {message && <p role="status">{message}</p>}
            {won && (
                <div className="game-result" role="status">
                    <h2>¡Adivinaste el personaje!</h2>
                    <p>
                        {scoreLoading
                            ? 'Calculando puntaje...'
                            : finalScore !== null
                                ? `Puntaje obtenido: ${finalScore}`
                                : 'No se pudo calcular el puntaje.'}
                    </p>
                    {practiceMode && (
                        <button type="button" onClick={startNextPractice}>
                            Siguiente personaje
                        </button>
                    )}
                </div>
            )}

            {practiceMode && !won && attempts >= MAX_ATTEMPTS && (
                <div className="game-result" role="status">
                    <h2>¡Perdiste! Se acabaron los intentos.</h2>
                    <button type="button" onClick={startNextPractice}>
                        Siguiente personaje
                    </button>
                </div>
            )}

            {!practiceMode && !won && attempts >= MAX_ATTEMPTS && (
                <div>
                <h2>Perdiste!</h2>
                <p role="status">No tienes mas intentos.</p>
                </div>
            )}

            {guesses.length > 0 && (
                <table>
                    <thead>
                        <tr>
                        <th>Personaje</th>
                        <th>Género</th>
                        <th>Período</th>
                        <th>País</th>
                        <th>Continente</th>
                        <th>Conocido por</th>
                        <th>Posición</th>
                        <th>Nacimiento</th>
                        <th>Fallecimiento</th>
                        <th>Ocupaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {guesses.map((guess) => (
                            <tr key={guess.id}>
                                <td>{guess.name}</td>
                                <td className={getMatchClass(guess.gender === targetCharacter.gender)}>
                                    {guess.gender}
                                </td>
                                <td className={getMatchClass(guess.period === targetCharacter.period)}>
                                    {guess.period}
                                </td>
                                <td className={getMatchClass(guess.country === targetCharacter.country)}>
                                    {guess.country}
                                </td>
                                <td className={getMatchClass(guess.continent === targetCharacter.continent)}>
                                    {guess.continent}
                                </td>
                                <td className={getMatchClass(guess.knowFor === targetCharacter.knowFor)}>
                                    {guess.knowFor}
                                </td>
                                <td className={getMatchClass(guess.position === targetCharacter.position)}>
                                    {guess.position}
                                </td>
                                <td className={getMatchClass(guess.birthYear === targetCharacter.birthYear)}>
                                    {guess.birthYear}
                                </td>
                                <td className={getMatchClass(guess.yearOfDeath === targetCharacter.yearOfDeath)}>
                                    {guess.yearOfDeath}
                                </td>
                                <td className="occupation-cell">
                                {guess.occupations.length > 0 ? (
                                    guess.occupations.map((occupation) => {
                                    const matches = targetCharacter.occupations.some(
                                        (targetOccupation) =>
                                        normalizeName(targetOccupation.name) ===
                                        normalizeName(occupation.name),
                                    );

                                    return (
                                        <span
                                        className={getMatchClass(matches)}
                                        key={occupation.id}
                                        >
                                        {occupation.name}
                                        </span>
                                    );
                                    })
                                ) : (
                                    <span className="guess-value mismatch">Sin ocupaciones</span>
                                )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <Link to="/jugar">Volver a desafíos</Link>
        </section>
    );
};

export default Level;