import { useEffect, useState, type SubmitEvent } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';

import { getCharacters } from '../../services/character';
import type { Character } from '../../types/character';

type CharacterTarget = Omit<Character, 'id'>;

const MOCK_EINSTEIN: CharacterTarget = {
  name: 'Albert Einstein',
  gender: 'Masculino',
  period: 'Edad Contemporanea',
  country: 'Alemania',
  continent: 'Europa',
  knowFor:
    'Teoría de la relatividad',
  position: 'Físico',
  birthYear: 1879,
  yearOfDeath: 1955,
  occupations: [
    { id: 5, name: 'Científico' },
  ],
  /* 
  Se tiene que completar manualmente segun las ocupaciones y como las genere la base de datos deberia quedar de la siguiente forma:
  occupations: [
    { id: 1, name: 'gobernador' },
    { id: 2, name: 'militar' },
    { id: 3, name: 'politico' },
  ],
  */
};

const MOCK_MARADONA: CharacterTarget = {
  name: 'Diego Maradona',
  gender: 'Masculino',
  period: 'Edad Contemporanea',
  country: 'Argentina',
  continent: 'America',
  knowFor:
    'Campeón del mundo con Argentina en 1986',
  position: 'Mediocampista ofensivo',
  birthYear: 1960,
  yearOfDeath: 2020,
  occupations: [
    { id: 16, name: 'Futbolista' }
  ],
  /* 
  Se tiene que completar manualmente segun las ocupaciones y como las genere la base de datos deberia quedar de la siguiente forma:
  occupations: [
    { id: 1, name: 'gobernador' },
    { id: 2, name: 'militar' },
    { id: 3, name: 'politico' },
  ],
  */
};

const LEVEL_TARGETS: Partial<Record<number, CharacterTarget>> = {
  1: MOCK_EINSTEIN,
  2: MOCK_MARADONA
};

const MAX_ATTEMPTS = 10;

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

// FUNCIONES DE COMPARACION
const compareValue = (matches: boolean) =>
  matches ? 'Coincide' : 'No coincide';

const compareYear = (guess: number, target: number) => {
  if (guess === target) return 'Coincide';
  return guess > target ? 'Mayor' : 'Menor';
};

const compareOccupations = (
  guess: Character,
  target: CharacterTarget,
): string => {
  if (guess.occupations.length === 0) return 'Sin ocupaciones';

  const targetNames = new Set(
    target.occupations.map((occupation) => normalizeName(occupation.name)),
  );

  return guess.occupations
    .map((occupation) => {
      const matches = targetNames.has(normalizeName(occupation.name));
      return `${occupation.name}: ${matches ? 'Coincide' : 'No coincide'}`;
    })
    .join(' | ');
}


const Level = () => {
  
  const { nroLevel } = useParams<{ nroLevel: string }>();
  const levelNumber = Number(nroLevel);

  const [characters, setCharacters] = useState<Character[]>([]);
  const [maradonaTarget, setMaradonaTarget] =
    useState<CharacterTarget>(MOCK_MARADONA);
  const [guesses, setGuesses] = useState<Character[]>([]);
  const [guessName, setGuessName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [attempts, setAttempts] = useState(0);

  const targetMock =
    levelNumber === 2 ? maradonaTarget : LEVEL_TARGETS[levelNumber];

  useEffect(() => {
    getCharacters()
      .then((loadedCharacters) => {
        setCharacters(loadedCharacters);

        const maradona = loadedCharacters.find((character) =>
          normalizeName(character.name).includes('maradona'),
        );

        if (maradona) {
          setMaradonaTarget({
            name: maradona.name,
            gender: maradona.gender,
            period: maradona.period,
            country: maradona.country,
            continent: maradona.continent,
            knowFor: maradona.knowFor,
            position: maradona.position,
            birthYear: maradona.birthYear,
            yearOfDeath: maradona.yearOfDeath,
            occupations: maradona.occupations,
          });
        }
      })
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : 'Error al cargar personajes',
        );
      })
      .finally(() => setLoading(false));
  }, []);


  const targetCharacter = targetMock
    ? characters.find(
        (character) =>
          normalizeName(character.name) === normalizeName(targetMock.name),
      )
    : undefined;
  const won = targetCharacter
    ? guesses.some((guess) => guess.id === targetCharacter.id)
    : false;


  const handleAttempt = () => {
    setAttempts((currentAttempts) => currentAttempts + 1);
  };

  const submitGuess = (event: SubmitEvent<HTMLFormElement>) => {
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
    setGuesses((currentGuesses) => [...currentGuesses, guess]);
    setGuessName('');
    setMessage('Intento agregado.');
  };


  if (!targetMock) return <Navigate to="/jugar" replace />;
  if (loading) return <p>Cargando personajes...</p>;
  if (error) return <p>{error}</p>;
  if (!targetCharacter) {
    return (
      <section>
        <h1>Nivel {levelNumber}</h1>
        <p>El personaje objetivo no está cargado en la base de datos.</p>
        <Link to="/jugar">Volver a niveles</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Nivel {levelNumber}</h1>

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
        <button type="submit" disabled={won || attempts >= MAX_ATTEMPTS || guessName.trim() === ''}>
          Probar
        </button>
      </form>

      {message && <p role="status">{message}</p>}
      {won && <h2>¡Adivinaste el personaje!</h2>}

      {!won && attempts >= MAX_ATTEMPTS && (
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
                <td>{compareValue(guess.gender === targetMock.gender)}</td>
                <td>{compareValue(guess.period === targetMock.period)}</td>
                <td>{compareValue(guess.country === targetMock.country)}</td>
                <td>{compareValue(guess.continent === targetMock.continent)}</td>
                <td>{compareValue(guess.knowFor === targetMock.knowFor)}</td>
                <td>{compareValue(guess.position === targetMock.position)}</td>
                <td>{compareYear(guess.birthYear, targetMock.birthYear)}</td>
                <td>{compareYear(guess.yearOfDeath, targetMock.yearOfDeath)}</td>
                <td>{compareOccupations(guess, targetMock)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link to="/jugar">Volver a niveles</Link>
    </section>
  );
};

export default Level;