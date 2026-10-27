import React, { useEffect, useState } from 'react';
import type { Category } from '../../types/category';
import type { Occupation } from '../../types/occupations';
import './OccupationsForm.css';

interface OccupationFormProps {
    initialOccupation: Occupation;
    categories: Category[];
    onSubmit: (name: string, categoryId: number) => Promise<void> | void;
    onCancel: () => void;
}

const OccupationForm: React.FC<OccupationFormProps> = ({
    initialOccupation,
    categories,
    onSubmit,
    onCancel,
}) => {
    const [name, setName] = useState(initialOccupation.name);
    const [categoryId, setCategoryId] = useState(String(initialOccupation.categoryId));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        setName(initialOccupation.name);
        setCategoryId(String(initialOccupation.categoryId));
    }, [initialOccupation]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedName = name.trim();
        const parsedCategoryId = Number(categoryId);

        if (!trimmedName || !categoryId || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await onSubmit(trimmedName, parsedCategoryId);
        } catch (reason: unknown) {
            setSubmitError(
                reason instanceof Error ? reason.message : 'Error al modificar la ocupación',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="occupation-inline-edit-form">
                <div className="occupation-input-wrapper">
                    <input
                        type="text"
                        className="occupation-inline-input"
                        required
                        autoFocus
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <select
                    className="occupation-inline-input"
                    aria-label="Categoría de la ocupación"
                    required
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
                    disabled={isSubmitting || categories.length === 0}
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
                    className="inline-action-btn confirm-btn"
                    title="Guardar cambios"
                    disabled={isSubmitting || categories.length === 0}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </button>

                <button
                    type="button"
                    className="inline-action-btn cancel-btn"
                    title="Cancelar"
                    onClick={onCancel}
                    disabled={isSubmitting}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </form>

            {submitError && <p className="error-text" role="alert">{submitError}</p>}
        </>
    );
};

export default OccupationForm;