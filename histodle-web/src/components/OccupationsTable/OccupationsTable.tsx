import React, { useEffect, useState } from 'react';
import { sileo } from 'sileo';
import { getCategories } from '../../services/categories';
import {
    createOccupation,
    deleteOccupation,
    getOccupations,
    updateOccupation,
} from '../../services/occupations';
import type { Category } from '../../types/category';
import type { Occupation } from '../../types/occupations';
import OccupationForm from '../OccupationsForm/OccupationsForm';
import './OccupationsTable.css';

interface Props {
    occupations: Occupation[];
}

const ensureMinimumLoadingTime = async <T,>(operation: Promise<T>): Promise<T> => {
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

const OccupationsTable: React.FC<Props> = ({ occupations }) => {
    const [newOccupationName, setNewOccupationName] = useState('');
    const [newCategoryId, setNewCategoryId] = useState('');
    const [loadedOccupations, setLoadedOccupations] = useState<Occupation[]>(occupations);
    const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [deletingOccupationId, setDeletingOccupationId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getOccupations()
            .then((results) => {
                setLoadedOccupations(results);
            })
            .catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : 'Error al cargar las ocupaciones');
            })
            .finally(() => setLoading(false));

        getCategories()
            .then(setCategories)
            .catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : 'Error al cargar las categorías');
            })
            .finally(() => setCategoriesLoading(false));
    }, []);

    const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const name = newOccupationName.trim();
        if (!name || !newCategoryId || creating) return;

        setCreating(true);
        setError(null);

        try {
            const createdOccupation = await sileo.promise(
                ensureMinimumLoadingTime(createOccupation({
                    name,
                    categoryId: Number(newCategoryId),
                })),
                {
                    loading: { title: 'Creando ocupación...' },
                    success: { title: '¡Ocupación creada exitosamente!' },
                    error: { title: 'Error al crear la ocupación' },
                },
            );

            setLoadedOccupations((current) => [...current, createdOccupation]);
            setNewOccupationName('');
            setNewCategoryId('');
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al registrar la ocupación');
        } finally {
            setCreating(false);
        }
    };

    const handleEditSubmit = async (name: string, categoryId: number) => {
        if (!editingOccupation) return;

        setError(null);

        try {
            const updatedOccupation = await sileo.promise(
                ensureMinimumLoadingTime(updateOccupation(editingOccupation.id, {
                    name,
                    categoryId,
                })),
                {
                    loading: { title: 'Modificando ocupación...' },
                    success: { title: '¡Ocupación modificada exitosamente!' },
                    error: { title: 'Error al modificar la ocupación' },
                },
            );

            setLoadedOccupations((current) =>
                current.map((occupation) =>
                    occupation.id === updatedOccupation.id ? updatedOccupation : occupation,
                ),
            );
            setEditingOccupation(null);
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al modificar la ocupación');
            throw reason;
        }
    };

    const handleDelete = async (occupation: Occupation) => {
        try {
            if (window.confirm(`¿Estás seguro de que deseas eliminar la ocupación "${occupation.name}"?`)) {
                setDeletingOccupationId(occupation.id);
                setError(null);
                await sileo.promise(
                    ensureMinimumLoadingTime(deleteOccupation(occupation.id)),
                    {
                        loading: { title: `Eliminando "${occupation.name}"...` },
                        success: { title: '¡Ocupación eliminada exitosamente!' },
                        error: { title: `Error al eliminar "${occupation.name}"` },
                    },
                );
                setLoadedOccupations((previous) =>
                    previous.filter((item) => item.id !== occupation.id),
                );
            }
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al eliminar la ocupación');
        } finally {
            setDeletingOccupationId(null);
        }
    };

    const categoriesUnavailable = categoriesLoading || categories.length === 0;

    return (
        <div className="occupations-section">
            {loading && <p className="loading-text">Cargando ocupaciones...</p>}
            {categoriesLoading && <p className="loading-text">Cargando categorías...</p>}
            {error && <p className="error-text" role="alert">{error}</p>}

            <form className="create-occupation-bar" onSubmit={handleCreateSubmit}>
                <input
                    type="text"
                    className="occupation-input"
                    placeholder="Nueva ocupación, ej. Arquitecto"
                    value={newOccupationName}
                    onChange={(event) => setNewOccupationName(event.target.value)}
                    required
                />

                <select
                    className="occupation-input"
                    aria-label="Categoría de la ocupación"
                    value={newCategoryId}
                    onChange={(event) => setNewCategoryId(event.target.value)}
                    disabled={categoriesUnavailable}
                    required
                >
                    <option value="">Elegí una categoría</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="btn-create-occupation"
                    disabled={
                        !newOccupationName.trim() ||
                        !newCategoryId ||
                        creating ||
                        categoriesUnavailable
                    }
                >
                    {creating ? 'Creando...' : '+ Crear Ocupación'}
                </button>
            </form>

            {!categoriesLoading && categories.length === 0 && !error && (
                <p className="error-text" role="alert">
                    No hay categorías disponibles. No se pueden crear ni editar ocupaciones.
                </p>
            )}

            <div className="occupations-grid">
                {loadedOccupations.map((occupation) => (
                    <div key={occupation.id} className="occupation-card">
                        <div className="occupation-info">
                            {editingOccupation?.id === occupation.id ? (
                                <OccupationForm
                                    initialOccupation={editingOccupation}
                                    categories={categories}
                                    onSubmit={handleEditSubmit}
                                    onCancel={() => setEditingOccupation(null)}
                                />
                            ) : (
                                <span className="occupation-name">{occupation.name}</span>
                            )}
                        </div>

                        {editingOccupation?.id !== occupation.id && (
                            <div className="occupation-actions">
                                <button
                                    type="button"
                                    className="icon-btn edit-btn"
                                    title="Editar"
                                    onClick={() => {
                                        setError(null);
                                        setEditingOccupation(occupation);
                                    }}
                                    disabled={categoriesUnavailable}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M12 20h9"></path>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    className="icon-btn delete-btn"
                                    title="Eliminar"
                                    onClick={() => handleDelete(occupation)}
                                    disabled={deletingOccupationId === occupation.id}
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OccupationsTable;