import React from 'react';
import { Link } from 'react-router-dom';
import './Jugar.css';

const Jugar: React.FC = () => {
    const levels = [
        {
        number: 1,
        title: 'Mente brillante',
        description: 'Un genio que cambió nuestra forma de entender el universo.',
        difficulty: 'Fácil',
        attempts: 10,
        },
        {
        number: 2,
        title: 'Barrilete Cosmico',
        description: 'Arranca por la derecha el genio del futbol mundial',
        difficulty: 'Fácil',
        attempts: 10,
        },
    ];

    return (
        <div className="jugar-page">
            <p className="eyebrow">Un personaje. pocas pistas.</p>
            <h1 className="jugar-title">¿Quién se esconde detrás de la historia?</h1>
            <p className="subtitle">
                Elegí un nivel y escribí cualquier personaje. Cada intento te muestra qué tan cerca estás del misterioso.
            </p>

            <div className="legend-row">
                <div className="legend-item">
                <span className="legend-dot coincide"></span>
                <span>Coincide</span>
                </div>
                <div className="legend-item">
                <span className="legend-dot cerca"></span>
                <span>Cerca</span>
                </div>
                <div className="legend-item">
                <span className="legend-dot no-coincide"></span>
                <span>No coincide</span>
                </div>
                <div className="legend-item">
                <span className="legend-dot mayor"></span>
                <span>El misterioso tiene un valor mayor</span>
                </div>
            </div>

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
                        Jugar <span aria-hidden="true">→</span>
                    </Link>
                    </div>
                </div>
                ))}
            </div>
        </div>
    );
};

export default Jugar;