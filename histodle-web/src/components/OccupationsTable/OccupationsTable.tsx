import React, { useState, useEffect } from 'react';
import type { Occupation } from '../../types/occupations';
import {
    createOccupation,
    deleteOccupation,
    getOccupations,
    updateOccupation,
} from '../../services/occupations';
import OccupationForm from '../OccupationsForm/OccupationsForm';
import './OccupationsTable.css';

interface Props {
    occupations: Occupation[];
}

const OccupationsTable: React.FC<Props> = ({ occupations }) => {
        const [newOccupationName, setNewOccupationName] = useState('');
        const [loadedOccupations, setLoadedOccupations] = useState<Occupation[]>(occupations);
        const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);
        const [loading, setLoading] = useState(true);
        const [creating, setCreating] = useState(false);
        const [deletingOccupationId, setDeletingOccupationId] = useState<number | null>(null);
        const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getOccupations()
        .then((results) => {
            setLoadedOccupations(results);
        })
        .catch((reason: unknown) => {
            setError(reason instanceof Error ? reason.message : 'Error al cargar los datos');
        })
        .finally(() => setLoading(false));
    }, []);

    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = newOccupationName.trim();
        if (!name || creating) return;

        setCreating(true);
        setError(null);
        try {
            const createdOccupation = await createOccupation({ name });
            setLoadedOccupations((current) => [...current, createdOccupation]);
            setNewOccupationName('');
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al registrar la ocupación');
        } finally {
            setCreating(false);
        }
    };

    const handleEditSubmit = async (name: string) => {
        if (!editingOccupation) return;

        setError(null);
        try {
            const updatedOccupation = await updateOccupation(editingOccupation.id, { name });
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
                await deleteOccupation(occupation.id);
                setLoadedOccupations((prev) => prev.filter((o) => o.id !== occupation.id));
            }
        } catch (reason: unknown) {
            setError(reason instanceof Error ? reason.message : 'Error al eliminar la ocupación');
        } finally {
            setDeletingOccupationId(null);
        }
    };

    return (
        <div className="occupations-section">
        {loading && <p className="loading-text">Cargando ocupaciones...</p>}
        {error && <p className="error-text" role="alert">{error}</p>}

        <form className="create-occupation-bar" onSubmit={handleCreateSubmit}>
            <input
            type="text"
            className="occupation-input"
            placeholder="Nueva ocupación, ej. Arquitecto"
            value={newOccupationName}
            onChange={(e) => setNewOccupationName(e.target.value)}
            />
            <button
            type="submit"
            className="btn-create-occupation"
            disabled={!newOccupationName.trim() || creating}
            >
            {creating ? 'Creando...' : '+ Crear Ocupación'}
            </button>
        </form>

        <div className="occupations-grid">
            {loadedOccupations.map((occupation) => {

            return (
                <div key={occupation.id} className="occupation-card">
                <div className="occupation-info">
                    {editingOccupation?.id === occupation.id ? (
                        <OccupationForm
                            initialOccupation={editingOccupation}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingOccupation(null)}
                        />
                    ) : (
                        <span className="occupation-name">{occupation.name}</span>
                    )}
                </div>

                {editingOccupation?.id !== occupation.id && <div className="occupation-actions">
                    <button
                    type="button"
                    className="icon-btn edit-btn"
                    title="Editar"
                    onClick={() => {
                        setError(null);
                        setEditingOccupation(occupation);
                    }}
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
                </div>}
                </div>
            );
            })}
        </div>
        </div>
    );
};

export default OccupationsTable;