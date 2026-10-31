import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sileo } from 'sileo';

import { getCharacters } from '../../services/character';
import { getChallenge } from '../../services/challenges';
import { calculateScore } from '../../services/scores';
import type { Character, CharacterHint } from '../../types/character';
import type { Challenge } from '../../types/challenge';
import './Level.css';
import 'animate.css'

const MAX_ATTEMPTS = 10;

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

const getMatchClass = (matches: boolean) =>
    matches ? 'guess-value match' : 'guess-value mismatch';

const getYearHint = (guessYear: number, targetYear: number) => {
    const difference = targetYear - guessYear;
    const arrow = difference > 0 ? '↑' : difference < 0 ? '↓' : '';

    return {
        className:
            difference === 0
                ? 'match'
                : Math.abs(difference) < 50
                    ? 'close'
                    : 'mismatch',
        arrow,
        arrowLabel:
            difference > 0
                ? 'El personaje misterioso es más reciente'
                : 'El personaje misterioso es más viejo',
    };
};

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
    const [revealedHints, setRevealedHints] = useState<CharacterHint[]>([]);
    const hintsUsed = revealedHints.length;
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [scoreLoading, setScoreLoading] = useState(false);
    const [ showSuggestions, setShowSuggestions ] = useState(false);

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
        setRevealedHints([]);
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
            setRevealedHints([]);
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
        if (!targetCharacter || won) return;

        setRevealedHints((currentHints) => {
            const availableHints = targetCharacter.hints.filter(
                (hint) =>
                    !currentHints.some((revealedHint) => revealedHint.id === hint.id),
            );
            if (availableHints.length === 0) return currentHints;

            const randomIndex = Math.floor(Math.random() * availableHints.length);
            return [...currentHints, availableHints[randomIndex]];
        });
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
            sileo.warning ({ title: 'Ya probaste ese personaje.'})
            return;
        }

        handleAttempt();
        setGuesses((currentGuesses) => [guess, ...currentGuesses]);
        setGuessName('');
        if (practiceMode && guess.id === targetCharacter?.id) {
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
                        <strong className='attempts-count'>{MAX_ATTEMPTS - attempts}</strong> intentos restantes
                    </p>

                    <div className='attempts-bar'>
                        {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => {
                            const isUsed = index < attempts;
                            return (
                                <span 
                                    key={index}
                                    className={`attempt-pill ${isUsed ? 'used' : ''}`}
                                />
                            )
                        })}
                    </div>
                </div>
            </header>
            {!practiceMode && challenge?.description && (
                <p className="challenge-description">{challenge.description}</p>
            )}

            <form onSubmit={submitGuess} className="guess-form">
                <div className="search-container">
                    <input
                        id="character-guess"
                        value={guessName}
                        onChange={(event) => {
                            setGuessName(event.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        autoComplete="off"
                        disabled={won || attempts >= MAX_ATTEMPTS}
                        placeholder="Buscar personaje..."
                    />

                    {showSuggestions && guessName.trim() !== '' && (
                        <div className="suggestions-dropdown">
                            {characters
                                .filter((character) =>
                                    normalizeName(character.name).includes(
                                        normalizeName(guessName)
                                    )
                                )
                                .slice(0, 4)
                                .map((character) => (
                                    <button
                                        key={character.id}
                                        type="button"
                                        className="suggestion-item"
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => {
                                            setGuessName(character.name);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <span className="suggestion-name">
                                            {character.name}
                                        </span>

                                        <span className="suggestion-years">
                                            {character.birthYear} – {
                                                character.yearOfDeath === 0
                                                    ? 'Actualidad'
                                                    : character.yearOfDeath
                                            }
                                        </span>
                                    </button>
                                ))}

                            {characters.filter((character) =>
                                normalizeName(character.name).includes(
                                    normalizeName(guessName)
                                )
                            ).length === 0 && (
                                <p className="no-suggestions">
                                    No se encontraron personajes.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="guess-form-actions">
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

                    <button
                        type="button"
                        className="hint-circle-button"
                        onClick={revealHint}
                        disabled={won || attempts >= MAX_ATTEMPTS || hintsUsed >= targetCharacter.hints.length}
                        title={hintsUsed >= targetCharacter.hints.length ? 'No hay más pistas' : 'Obtener pista'}
                        aria-label="Revelar pista"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zm-3 18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/>
                        </svg>
                    </button>
                </div>
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
                        <button className='button-play-again' type="button" onClick={startNextPractice}>
                            Siguiente personaje
                        </button>
                    )}
                </div>
            )}

            {practiceMode && !won && attempts >= MAX_ATTEMPTS && (
                <div className="game-result" role="status">
                    <h2>¡Perdiste! Se acabaron los intentos.</h2>
                    <button className='button-play-again' type="button" onClick={startNextPractice}>
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

            {(guesses.length > 0 || revealedHints.length > 0) && (
                <div className='game-layout'>
                    <div className='attempts-column'>
                        {revealedHints.length > 0 && (
                            <div className="revealed-hints-container animate__animated animate__fadeIn">
                                <h3 className="hints-title">Pistas reveladas:</h3>
                                {revealedHints.map((hint) => (
                                    <div key={hint.id} className="hint-card">
                                        {hint.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        {guesses.map((guess) => {
                                const birthYearHint = getYearHint(guess.birthYear, targetCharacter.birthYear);
                                const deathYearHint = getYearHint(guess.yearOfDeath, targetCharacter.yearOfDeath);

                                const initials = guess.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .substring(0, 2)
                                    .toUpperCase();

                                const genderMatch = guess.gender === targetCharacter.gender;
                                const periodMatch = guess.period === targetCharacter.period;
                                const countryMatch = guess.country === targetCharacter.country;
                                const continentMatch = guess.continent === targetCharacter.continent;
                                const positionMatch = (guess.position || 'Ninguno') === (targetCharacter.position || 'Ninguno');

                                return (
                                    <div key={guess.id} className="attempt-card">
                                        <div className="attempt-card-header">
                                            <div className="avatar-circle">{initials}</div>
                                            <div>
                                                <h2 className="character-title">{guess.name}</h2>
                                                <div className="occupations-pills">
                                                    {guess.occupations.length > 0 ? (
                                                    guess.occupations.map((occ) => {
                                                        const occMatches = targetCharacter.occupations.some(
                                                        (targetOcc) =>
                                                            normalizeName(targetOcc.name) === normalizeName(occ.name)
                                                        );
                                                        return (
                                                        <span
                                                            key={occ.id}
                                                            className={`occ-pill ${occMatches ? 'match' : 'mismatch'}`}
                                                        >
                                                            {occ.name}
                                                        </span>
                                                        );
                                                    })
                                                    ) : (
                                                    <span className="occ-pill mismatch">Sin ocupaciones</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="attempt-fields-grid">

                                            <div className={`field-box ${getMatchClass(genderMatch)} animate__animated animate__flipInX`}>
                                                <span className="field-label">GÉNERO</span>
                                                <div className="field-content">
                                                    <span>{guess.gender}</span>
                                                </div>
                                            </div>

                                            <div className={`field-box ${getMatchClass(countryMatch)} animate__animated animate__flipInX`}>
                                                <span className="field-label animate__animated animate__flipInX">PAÍS</span>
                                                <div className="field-content">
                                                    <span>{guess.country}</span>
                                                </div>
                                            </div>

                                            <div className={`field-box ${getMatchClass(continentMatch)} animate__animated animate__flipInX`}>
                                                <span className="field-label">CONTINENTE</span>
                                                <div className="field-content">
                                                    <span>{guess.continent}</span>
                                                </div>
                                            </div>

                                            <div className={`field-box ${getMatchClass(periodMatch)} animate__animated animate__flipInX`}>
                                                <span className="field-label animate__animated animate__flipInX">PERÍODO</span>
                                                <div className="field-content">
                                                    <span>{guess.period}</span>
                                                </div>
                                            </div>

                                            <div className={`field-box ${birthYearHint.className} animate__animated animate__flipInX`}>
                                                <span className="field-label">NACIMIENTO</span>
                                                <div className="field-content">
                                                    <span>{guess.birthYear}</span>
                                                    {birthYearHint.arrow && <span>{birthYearHint.arrow}</span>}
                                                </div>
                                            </div>

                                            <div className={`field-box ${deathYearHint.className} animate__animated animate__flipInX`}>
                                                <span className="field-label animate__animated animate__flipInX">MUERTE</span>
                                                <div className="field-content">
                                                    <span>
                                                        {guess.yearOfDeath === 0 ? 'No murió' : guess.yearOfDeath}
                                                    </span>
                                                    {deathYearHint.arrow && <span>{deathYearHint.arrow}</span>}
                                                </div>
                                            </div>

                                            <div className={`field-box ${getMatchClass(positionMatch)} animate__animated animate__flipInX`}>
                                                <span className="field-label animate__animated animate__flipInX">CARGO</span>
                                                <div className="field-content">
                                                    <span>{guess.position || 'Ninguno'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    <aside className="results-panel">
                        <h3 className="results-title">RESULTADOS</h3>
                        <div className="results-list">
                        {guesses.map((guess, index) => {
                            const attemptNumber = guesses.length - index;

                            const cellColors = [
                                guess.gender === targetCharacter.gender ? 'match' : 'mismatch',
                                guess.country === targetCharacter.country ? 'match' : 'mismatch',
                                guess.continent === targetCharacter.continent ? 'match' : 'mismatch',
                                guess.period === targetCharacter.period ? 'match' : 'mismatch',
                                getYearHint(guess.birthYear, targetCharacter.birthYear).className,
                                getYearHint(guess.yearOfDeath, targetCharacter.yearOfDeath).className,
                                (guess.position || 'Ninguno') === (targetCharacter.position || 'Ninguno') ? 'match' : 'mismatch',
                            ];

                            return (
                            <div key={guess.id} className="mini-attempt-item">
                                <span className="attempt-label">INTENTO #{attemptNumber}</span>
                                <div className="mini-grid">
                                {cellColors.map((colorClass, cellIdx) => (
                                    <div key={cellIdx} className={`mini-cell ${colorClass} animate__animated animate__flipInX`} />
                                ))}
                                </div>
                            </div>
                            );
                        })}
                        </div>
                    </aside>
                </div>
            )}

            <Link to="/jugar">Volver a desafíos</Link>
        </section>
    );
};

export default Level;