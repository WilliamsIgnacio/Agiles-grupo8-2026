import React, { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import {
    createDifficulty,
    deleteDifficulty,
    getDifficulties,
    updateDifficulty,
} from '../../services/difficulties';
import type { Difficulty } from '../../types/difficulty';
import './DifficultiesTable.css';

const withLoadingDelay = async <T,>(operation: Promise<T>): Promise<T> => {
    const delay = new Promise<void>((resolve) => window.setTimeout(resolve, 500));
    try {
        const result = await operation;
        await delay;
        return result;
    } catch (reason: unknown) {
        await delay;
        throw reason;
    }
};

const DifficultiesTable: React.FC = () => {
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [newName, setNewName] = useState('');
    const [editing, setEditing] = useState<Difficulty | null>(null);
    const [editingName, setEditingName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getDifficulties()
            .then(setDifficulties)
            .catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : 'Error al cargar las dificultades');
            })
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const name = newName.trim();
        if (!name || saving) return;

        setSaving(true);
        setError(null);
        try {
            const created = await sileo.promise(
                withLoadingDelay(createDifficulty(name)),
                {
                    loading: { title: 'Creando dificultad...' },
                    success: { title: '¡Dificultad creada!' },
                    error: { title: 'Error al crear la dificultad' },
                },
            );
            setDifficulties((current) => [...current, created].sort((a, b) => a.id - b.id));
            setNewName('');
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al crear la dificultad');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editing || !editingName.trim() || saving) return;

        setSaving(true);
        setError(null);
        try {
            const updated = await sileo.promise(
                withLoadingDelay(updateDifficulty(editing.id, editingName.trim())),
                {
                    loading: { title: 'Modificando dificultad...' },
                    success: { title: '¡Dificultad modificada!' },
                    error: { title: 'Error al modificar la dificultad' },
                },
            );
            setDifficulties((current) =>
                current.map((item) => item.id === updated.id ? updated : item),
            );
            setEditing(null);
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al modificar la dificultad');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (difficulty: Difficulty) => {
        if (!window.confirm(`¿Querés eliminar la dificultad "${difficulty.name}"?`)) return;

        setError(null);
        try {
            await sileo.promise(
                withLoadingDelay(deleteDifficulty(difficulty.id)),
                {
                    loading: { title: `Eliminando "${difficulty.name}"...` },
                    success: { title: '¡Dificultad eliminada!' },
                    error: { title: `Error al eliminar "${difficulty.name}"` },
                },
            );
            setDifficulties((current) => current.filter((item) => item.id !== difficulty.id));
            if (editing?.id === difficulty.id) setEditing(null);
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al eliminar la dificultad');
        }
    };

    return (
        <section className="difficulties-section" aria-labelledby="difficulties-title">
            <h2 id="difficulties-title" className="sr-only">Dificultades</h2>
            {error && <p className="error-text" role="alert">{error}</p>}

            <form className="create-difficulty-bar" onSubmit={handleCreate}>
                <input
                    className="difficulty-input"
                    type="text"
                    placeholder="Nueva dificultad"
                    aria-label="Nombre de la nueva dificultad"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    required
                    disabled={saving}
                />
                <button className="btn-create-difficulty" type="submit" disabled={!newName.trim() || saving}>
                    {saving ? 'Guardando...' : '+ Crear dificultad'}
                </button>
            </form>

            {loading ? (
                <p className="loading-text">Cargando dificultades...</p>
            ) : difficulties.length === 0 ? (
                <p className="difficulties-empty">Todavía no hay dificultades registradas.</p>
            ) : (
                <div className="difficulties-grid">
                    {difficulties.map((difficulty) => (
                        <article className="difficulty-card" key={difficulty.id}>
                            {editing?.id === difficulty.id ? (
                                <form className="difficulty-edit-form" onSubmit={handleUpdate}>
                                    <input
                                        className="difficulty-input"
                                        aria-label={`Modificar ${difficulty.name}`}
                                        value={editingName}
                                        onChange={(event) => setEditingName(event.target.value)}
                                        required
                                        autoFocus
                                        disabled={saving}
                                    />
                                    <button className="difficulty-action confirm" type="submit" title="Guardar cambios" disabled={saving}>
                                        Guardar
                                    </button>
                                    <button className="difficulty-action" type="button" onClick={() => setEditing(null)} disabled={saving}>
                                        Cancelar
                                    </button>
                                </form>
                            ) : (
                                <>
                                    <div className="difficulty-info">
                                        <span className="difficulty-name">{difficulty.name}</span>
                                        <span className="difficulty-id">ID: {difficulty.id}</span>
                                    </div>
                                    <div className="difficulty-actions">
                                        <button
                                            className="difficulty-action"
                                            type="button"
                                            onClick={() => {
                                                setEditing(difficulty);
                                                setEditingName(difficulty.name);
                                            }}
                                            aria-label={`Modificar ${difficulty.name}`}
                                        >
                                            Modificar
                                        </button>
                                        <button
                                            className="difficulty-action delete"
                                            type="button"
                                            onClick={() => handleDelete(difficulty)}
                                            aria-label={`Eliminar ${difficulty.name}`}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default DifficultiesTable;
