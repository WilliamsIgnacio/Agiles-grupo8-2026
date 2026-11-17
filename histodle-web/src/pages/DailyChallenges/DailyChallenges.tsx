import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getDailyChallengeResults,
    type DailyChallengeResult,
} from '../../services/dailyChallenges';
import './DailyChallenges.css';

interface SelectableDay {
    date: string;
    dayOfYear: number;
    label: string;
    isToday: boolean;
}

const getArgentinaDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: Intl.DateTimeFormatPartTypes) =>
        parts.find((value) => value.type === type)?.value ?? '';

    return `${part('year')}-${part('month')}-${part('day')}`;
};

const getSelectableDays = (): SelectableDay[] => {
    const today = getArgentinaDate();
    const date = new Date(`${today}T00:00:00.000Z`);
    const formatDate = new Intl.DateTimeFormat('es-AR', {
        timeZone: 'UTC',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });

    return Array.from({ length: 30 }, (_, offset) => {
        const selectableDate = new Date(date);
        selectableDate.setUTCDate(selectableDate.getUTCDate() - offset);
        const value = selectableDate.toISOString().slice(0, 10);
        const dayOfYear = Math.floor(
            (selectableDate.getTime() -
                Date.UTC(selectableDate.getUTCFullYear(), 0, 1)) /
                86_400_000,
        ) + 1;

        return {
            date: value,
            dayOfYear,
            label: offset === 0 ? 'Hoy' : formatDate.format(selectableDate),
            isToday: offset === 0,
        };
    });
};

const DailyChallenges: React.FC = () => {
    const navigate = useNavigate();
    const days = getSelectableDays();
    const [results, setResults] = useState<Record<string, DailyChallengeResult>>({});
    const [progressError, setProgressError] = useState<string | null>(null);

    useEffect(() => {
        try {
            setResults(getDailyChallengeResults());
        } catch (reason: unknown) {
            console.error('No se pudo cargar el progreso de desafíos diarios.', reason);
            setProgressError('No se pudo cargar el progreso de los desafíos diarios.');
        }
    }, []);

    return (
        <section className="daily-challenges-page" aria-labelledby="daily-challenges-title">
            <Link className="daily-back-link" to="/jugar">← Volver a jugar</Link>
            <p className="daily-eyebrow">Un personaje por día</p>
            <h1 id="daily-challenges-title">Desafíos diarios</h1>
            <p className="daily-intro">
                Elegí un día para jugar. Cada fecha tiene un personaje aleatorio compartido por todos.
            </p>

            {progressError && <p role="alert">{progressError}</p>}

            <div className="daily-days-grid" aria-label="Elegí una fecha">
                {days.map((day) => {
                    const result = results[day.date];
                    const statusClass = result === 'won'
                        ? ' is-won'
                        : result === 'lost'
                            ? ' is-lost'
                            : '';
                    const statusLabel = result === 'won'
                        ? ', ganado'
                        : result === 'lost'
                            ? ', perdido o rendido'
                            : '';

                    return (
                        <button
                            key={day.date}
                            type="button"
                            className={`daily-day-card${day.isToday ? ' is-today' : ''}${statusClass}`}
                            aria-label={`Jugar el desafío del día ${day.dayOfYear} del año (${day.date})${statusLabel}`}
                            onClick={() => navigate(`/jugar/desafio-diario/${day.date}`)}
                        >
                            <strong className="daily-day-number">#{day.dayOfYear}</strong>
                            <span className="daily-day-label">{day.label}</span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
};

export default DailyChallenges;
