import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../../services/leaderboard';
import './Resultados.css';

const Resultados: React.FC = () => {
    const [ranking, setRanking] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isCurrentRequest = true;

        getLeaderboard()
            .then((entries) => {
                if (isCurrentRequest) setRanking(entries);
            })
            .catch((reason: unknown) => {
                if (!isCurrentRequest) return;
                setError(reason instanceof Error ? reason.message : 'No se pudo cargar el ranking.');
            })
            .finally(() => {
                if (isCurrentRequest) setLoading(false);
            });

        return () => {
            isCurrentRequest = false;
        };
    }, []);

    return (
        <section className="resultados-page" aria-labelledby="resultados-title">
            <p className="resultados-eyebrow">La comunidad Histodle</p>
            <h1 id="resultados-title">Ranking</h1>
            <p className="resultados-description">
                Participá en los desafíos para escalar en el ranking.
            </p>

            {loading && <p role="status">Cargando ranking...</p>}
            {error && <p className="resultados-error" role="alert">{error}</p>}
            {!loading && !error && ranking.length === 0 && (
                <p className="resultados-empty">Todavía no hay resultados. ¡Completá un desafío para aparecer!</p>
            )}
            {!loading && !error && ranking.length > 0 && (
                <div className="ranking-table-container">
                    <table className="ranking-table">
                        <caption>Ranking de jugadores por puntaje total</caption>
                        <thead>
                            <tr>
                                <th scope="col">Puesto</th>
                                <th scope="col">Jugador</th>
                                <th scope="col">Desafíos jugados</th>
                                <th scope="col">Puntaje total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((entry) => (
                                <tr key={entry.position}>
                                    <td className="ranking-position">{String(entry.position).padStart(2, '0')}</td>
                                    <th scope="row" className="ranking-player">{entry.name}</th>
                                    <td>{entry.challengesPlayed}</td>
                                    <td className="ranking-points">{entry.totalPoints.toLocaleString('es-AR')} pts</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default Resultados;
