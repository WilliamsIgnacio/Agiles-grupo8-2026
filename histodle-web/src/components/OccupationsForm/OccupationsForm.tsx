import React, { useState, useEffect } from 'react';
import type { Occupation } from '../../types/occupations';
import './OccupationsForm.css';

interface OccupationFormProps {
  initialOccupation: Occupation;
  onSubmit: (name: string) => Promise<void> | void;
  onCancel: () => void;
}

const OccupationForm: React.FC<OccupationFormProps> = ({
  initialOccupation,
  onSubmit,
  onCancel,
}) => {
  const [name, setName] = useState(initialOccupation.name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setName(initialOccupation.name);
  }, [initialOccupation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(trimmedName);
    } catch (reason: unknown) {
      setSubmitError(reason instanceof Error ? reason.message : 'Error al modificar la ocupación');
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
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="inline-action-btn confirm-btn"
        title="Guardar cambios"
        disabled={isSubmitting}
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