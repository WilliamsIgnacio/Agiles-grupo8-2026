import React, { useState } from 'react';
import { sileo } from 'sileo';
import type { Difficulty } from '../../types/difficulty';
import type { Score, ScoreInput, ScoreUpdateInput } from '../../types/score';
import {
    createScore,
    deleteScore,
    updateScore,
} from '../../services/scores';
import './ScoresTable.css';

interface ScoresTableProps {
    difficulties: Difficulty[];
    scores: Score[];
    onScoresChange: (scores: Score[]) => void;
}

type FormValues = ScoreInput;

const emptyForm: FormValues = {
    difficultyId: 0,
    maxScore: 0,
    minScore: 0,
    attemptPenaltyPercentage: 0,
    hintPenaltyPercentage: 0,
};

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

const validateForm = (form: FormValues, isEditing: boolean): string | null => {
    if (!isEditing && form.difficultyId === 0) return 'Seleccioná una dificultad.';
    if (form.minScore > form.maxScore) return 'El puntaje mínimo no puede superar al máximo.';
    if (form.attemptPenaltyPercentage < 0 || form.attemptPenaltyPercentage > 100) {
        return 'La resta por intento debe estar entre 0 y 100.';
    }
    if (form.hintPenaltyPercentage < 0 || form.hintPenaltyPercentage > 100) {
        return 'La resta por pista debe estar entre 0 y 100.';
    }
    return null;
};

const ScoresTable: React.FC<ScoresTableProps> = ({ difficulties, scores, onScoresChange }) => {
    const [form, setForm] = useState<FormValues>(emptyForm);
    const [editing, setEditing] = useState<Score | null>(null);
    const [pendingDelete, setPendingDelete] = useState<Score | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateField = (field: keyof FormValues, value: string) => {
        setForm((current) => ({ ...current, [field]: Number(value) }));
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditing(null);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (saving) return;

        const validationError = validateForm(form, Boolean(editing));
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError(null);
        try {
            if (editing) {
                const payload: ScoreUpdateInput = {
                    maxScore: form.maxScore,
                    minScore: form.minScore,
                    attemptPenaltyPercentage: form.attemptPenaltyPercentage,
                    hintPenaltyPercentage: form.hintPenaltyPercentage,
                };
                const updated = await sileo.promise(withLoadingDelay(updateScore(editing.id, payload)), {
                    loading: { title: 'Modificando puntaje...' },
                    success: { title: '¡Puntaje modificado!' },
                    error: { title: 'Error al modificar el puntaje' },
                });
                onScoresChange(scores.map((item) => item.id === updated.id ? updated : item));
            } else {
                const created = await sileo.promise(withLoadingDelay(createScore(form)), {
                    loading: { title: 'Creando puntaje...' },
                    success: { title: '¡Puntaje creado!' },
                    error: { title: 'Error al crear el puntaje' },
                });
                onScoresChange([...scores, created].sort((a, b) => a.difficultyId - b.difficultyId));
            }
            resetForm();
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al guardar el puntaje');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!pendingDelete) return;

        setSaving(true);
        setError(null);
        try {
            await sileo.promise(withLoadingDelay(deleteScore(pendingDelete.id)), {
                loading: { title: 'Eliminando puntaje...' },
                success: { title: '¡Puntaje eliminado!' },
                error: { title: 'Error al eliminar el puntaje' },
            });
            onScoresChange(scores.filter((item) => item.id !== pendingDelete.id));
            if (editing?.id === pendingDelete.id) resetForm();
            setPendingDelete(null);
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al eliminar el puntaje');
        } finally {
            setSaving(false);
        }
    };

    const difficultyName = (difficultyId: number) =>
        difficulties.find((difficulty) => difficulty.id === difficultyId)?.name ?? `Dificultad ${difficultyId}`;

    return (
        <section className="scores-section" aria-labelledby="scores-title">
            <h2 id="scores-title" className="sr-only">Configuración de puntajes</h2>
            {error && <p className="error-text" role="alert">{error}</p>}

            {pendingDelete && (
                <div className="score-confirmation" role="alertdialog" aria-modal="true">
                    <p>¿Querés eliminar la configuración de {difficultyName(pendingDelete.difficultyId)}?</p>
                    <div className="score-confirmation-actions">
                        <button type="button" className="score-action delete" onClick={handleDelete} disabled={saving}>Eliminar</button>
                        <button type="button" className="score-action" onClick={() => setPendingDelete(null)} disabled={saving}>Cancelar</button>
                    </div>
                </div>
            )}

            <form className="score-form" onSubmit={handleSubmit}>
                <label>
                    Dificultad
                    <select value={form.difficultyId} onChange={(event) => updateField('difficultyId', event.target.value)} disabled={Boolean(editing) || saving} required>
                        <option value={0}>Seleccionar dificultad</option>
                        {difficulties.map((difficulty) => <option key={difficulty.id} value={difficulty.id}>{difficulty.name}</option>)}
                    </select>
                </label>
                <label>
                    Puntaje máximo
                    <input type="number" min="0" value={form.maxScore} onChange={(event) => updateField('maxScore', event.target.value)} disabled={saving} required />
                </label>
                <label>
                    Puntaje mínimo
                    <input type="number" min="0" value={form.minScore} onChange={(event) => updateField('minScore', event.target.value)} disabled={saving} required />
                </label>
                <label>
                    Resta por intento (%)
                    <input type="number" min="0" max="100" step="0.01" value={form.attemptPenaltyPercentage} onChange={(event) => updateField('attemptPenaltyPercentage', event.target.value)} disabled={saving} required />
                </label>
                <label>
                    Resta por pista (%)
                    <input type="number" min="0" max="100" step="0.01" value={form.hintPenaltyPercentage} onChange={(event) => updateField('hintPenaltyPercentage', event.target.value)} disabled={saving} required />
                </label>
                <div className="score-form-actions">
                    <button className="score-primary-action" type="submit" disabled={saving}>{editing ? 'Guardar cambios' : 'Crear configuración'}</button>
                    {editing && <button className="score-action" type="button" onClick={resetForm} disabled={saving}>Cancelar</button>}
                </div>
            </form>

            {scores.length === 0 ? (
                <p className="scores-empty">Todavía no hay configuraciones de puntaje registradas.</p>
            ) : (
                <div className="scores-grid">
                    {scores.map((score) => (
                        <article className="score-card" key={score.id}>
                            <div className="score-card-header">
                                <div>
                                    <h3>{difficultyName(score.difficultyId)}</h3>
                                    <span>ID de dificultad: {score.difficultyId}</span>
                                </div>
                                <strong>{score.maxScore} pts</strong>
                            </div>
                            <dl className="score-details">
                                <div><dt>Puntaje mínimo</dt><dd>{score.minScore}</dd></div>
                                <div><dt>Resta por intento</dt><dd>{score.attemptPenaltyPercentage}%</dd></div>
                                <div><dt>Resta por pista</dt><dd>{score.hintPenaltyPercentage}%</dd></div>
                            </dl>
                            <div className="score-actions">
                                <button type="button" className="score-action" onClick={() => {
                                    setEditing(score);
                                    setForm({
                                        difficultyId: score.difficultyId,
                                        maxScore: score.maxScore,
                                        minScore: score.minScore,
                                        attemptPenaltyPercentage: score.attemptPenaltyPercentage,
                                        hintPenaltyPercentage: score.hintPenaltyPercentage,
                                    });
                                }}>Modificar</button>
                                <button type="button" className="score-action delete" onClick={() => setPendingDelete(score)}>Eliminar</button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ScoresTable;
