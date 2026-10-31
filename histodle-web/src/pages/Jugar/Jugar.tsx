import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categories';
import { getDifficulties } from '../../services/difficulties';
import { getChallenges } from '../../services/challenges';
import type { Category } from '../../types/category';
import type { Difficulty } from '../../types/difficulty';
import type { Challenge } from '../../types/challenge';
import { CategoryWheelPicker } from '../../components/CategoryWheelPicker/CategoryWheelPicker';
import './Jugar.css';

const Jugar: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [selectedDifficultyId, setSelectedDifficultyId] = useState('default');
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const practiceQuery = `?categoryId=${selectedCategoryId}&difficultyId=${selectedDifficultyId}`;

    useEffect(() => {
        Promise.all([getCategories(), getDifficulties(), getChallenges()])
            .then(([loadedCategories, loadedDifficulties, loadedChallenges]) => {
                setCategories(loadedCategories);
                setDifficulties(loadedDifficulties);
                setChallenges(loadedChallenges);
            })
            .catch((reason: unknown) => {
                setError(
                    reason instanceof Error
                        ? reason.message
                        : 'Error al cargar los datos de juego',
                );
            })
            .finally(() => setCategoriesLoading(false));
    }, []);

    return (
        <div className="jugar-page">
            <p className="eyebrow">Un personaje. pocas pistas.</p>
            <h1 className="jugar-title">¿Quién se esconde detrás de la historia?</h1>
            <p className="subtitle">
                Elegí una categoría y dificultad para el modo práctica, o jugá uno de los desafíos.
            </p>

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

                <div className="category-selectors">
                    <div className="category-selector">
                        <label htmlFor="game-category">Categoría de personajes (modo práctica)</label>
                        <CategoryWheelPicker
                            categories={categories}
                            selectedCategoryId={selectedCategoryId}
                            onCategoryChange={setSelectedCategoryId}
                            disabled={categoriesLoading}
                        />
                    </div>

                    <div className="category-selector">
                        <label htmlFor="game-difficulty">Dificultad del personaje misterioso</label>
                        <CategoryWheelPicker
                            categories={difficulties}
                            selectedCategoryId={selectedDifficultyId}
                            onCategoryChange={setSelectedDifficultyId}
                            disabled={categoriesLoading}
                            allOptionId="default"
                            allOptionLabel="Por defecto"
                        />
                    </div>
                </div>

                {categoriesLoading && <p role="status">Cargando opciones de práctica...</p>}
                {error && <p className="category-error" role="alert">{error}</p>}

            <h2 className="levels-title">Modo práctica</h2>
            <section className="level-card practice-card">
                <div className="level-header">
                    <span className="level-badge">Hasta 10 intentos</span>
                    <span className="level-difficulty facil">Práctica</span>
                </div>
                <h3>Modo práctica</h3>
                <p className="level-description">
                    Adiviná personajes al azar con hasta 10 intentos. Al acertar,
                    podés empezar otra partida con un personaje distinto.
                </p>
                <div className="level-footer">
                    <span className="attempts">Un personaje nuevo en cada ronda</span>
                    <Link className="play-link" to={`/jugar/practica${practiceQuery}`}>
                        Practicar ➜
                    </Link>
                </div>
            </section>

            <h2 className="levels-title">Desafíos</h2>
            <div className="level-grid">
                {challenges.map((challenge) => (
                    <div className="level-card" key={challenge.id}>
                        <div className="level-header">
                            <span className="level-badge">Desafío {challenge.id}</span>
                            <span className={`level-difficulty ${challenge.character.difficulty.name}`}>
                                {challenge.character.difficulty.name}
                            </span>
                        </div>

                        <h3>{challenge.name}</h3>
                        <p className="level-description">{challenge.description}</p>

                        <div className="level-footer">
                            <span className="attempts">10 intentos</span>
                            <Link className="play-link" to={`/jugar/desafio/${challenge.id}`}>
                                Jugar ➜
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
            {!categoriesLoading && challenges.length === 0 && !error && (
                <p>No hay desafíos disponibles.</p>
            )}
        </div>
    );
};

export default Jugar;