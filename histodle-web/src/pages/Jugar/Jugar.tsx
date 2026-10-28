import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../../services/categories';
import type { Category } from '../../types/category';
import { CategoryWheelPicker } from '../../components/CategoryWheelPicker/CategoryWheelPicker';
import './Jugar.css';

const Jugar: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const levels = [
        {
            number: 1,
            title: 'Desafío histórico',
            description: 'Descubrí qué personaje se esconde detrás de las pistas.',
            difficulty: 'Fácil',
            attempts: 10,
        },
        {
            number: 2,
            title: 'Otro personaje misterioso',
            description: 'Elegí personajes y usá las pistas para acercarte al objetivo.',
            difficulty: 'Fácil',
            attempts: 10,
        },
    ];

    useEffect(() => {
        getCategories()
            .then(setCategories)
            .catch((reason: unknown) => {
                setError(
                    reason instanceof Error
                        ? reason.message
                        : 'Error al cargar las categorías',
                );
            })
            .finally(() => setCategoriesLoading(false));
    }, []);

    return (
        <div className="jugar-page">
            <p className="eyebrow">Un personaje. pocas pistas.</p>
            <h1 className="jugar-title">¿Quién se esconde detrás de la historia?</h1>
            <p className="subtitle">
                Elegí una categoría y un nivel. El personaje objetivo se elige al azar
                entre los disponibles para esa selección.
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

            <div className="category-selector">
        <label htmlFor="game-category">Categoría de personajes</label>
        
        {/* Selector de Rueda Remplazando al <select> */}
        <CategoryWheelPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={setSelectedCategoryId}
            disabled={categoriesLoading}
        />
        </div>

        {categoriesLoading && <p role="status">Cargando categorías...</p>}
        {error && (
            <p className="category-error" role="alert">
            {error}
            </p>
        )}

            {categoriesLoading && <p role="status">Cargando categorías...</p>}
            {error && (
                <p className="category-error" role="alert">
                    {error}
                </p>
            )}

            <h2 className="levels-title">Elegí un nivel</h2>
            <div className="level-grid">
                {levels.map((level) => (
                    <div className="level-card" key={level.number}>
                        <div className="level-header">
                            <span className="level-badge">Nivel {level.number}</span>
                            <span className={`level-difficulty ${level.difficulty.toLowerCase()}`}>
                                {level.difficulty}
                            </span>
                        </div>

                        <h3>{level.title}</h3>
                        <p className="level-description">{level.description}</p>

                    <div className="level-footer">
                        <span className="attempts">{level.attempts} intentos</span>
                        <Link className="play-link" to={`/jugar/nivel/${level.number}`}>
                            Jugar ➜
                        </Link>
                    </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Jugar;