import React, { useState, useEffect } from 'react';
import type { CharacterInput } from '../../types/character';
import type { Occupation } from '../../types/occupations';
import './CharacterForm.css';

interface CharacterFormProps {
    initialValues?: CharacterInput;
    occupations: Occupation[];
    onSubmit: (formData: CharacterInput) => Promise<void> | void;
    onCancel?: () => void;
    submitButtonText?: string;
    title?: string;
    }

    const defaultValues: CharacterInput = {
    name: '',
    gender: 'Masculino',
    period: 'Edad Antigua',
    country: '',
    continent: 'Europa',
    knowFor: '',
    position: '',
    birthYear: 0,
    yearOfDeath: 0,
    occupationIds: [],
    };

    const CharacterForm: React.FC<CharacterFormProps> = ({
    initialValues = defaultValues,
    occupations,
    onSubmit,
    onCancel,
    submitButtonText = 'Registrar',
    title = 'Registrar personaje',
    }) => {
    const [formData, setFormData] = useState<CharacterInput>(initialValues);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const updateField = <K extends keyof CharacterInput>(field: K, value: CharacterInput[K]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleOccupation = (id: number) => {
        const current = formData.occupationIds;
        const exists = current.includes(id);
        const updated = exists
        ? current.filter((occId) => occId !== id)
        : [...current, id];
        updateField('occupationIds', updated);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);
        try {
            await onSubmit(formData);
        } catch (reason: unknown) {
            setSubmitError(reason instanceof Error ? reason.message : 'Error al registrar el personaje');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="character-form-container">
        <div className="character-form-header">
            <h2 className="character-form-title">{title}</h2>
            {onCancel && (
            <button type="button" className="close-button" onClick={onCancel}>
                ✕
            </button>
            )}
        </div>
        <p className="character-form-subtitle">
            Estos datos se usan para comparar cada intento con el personaje misterioso.
        </p>

        <form onSubmit={handleSubmit} className="character-form">
            {submitError && <p className="error-text" role="alert">{submitError}</p>}
        
            <div className="form-group full-width">
            <label>Nombre</label>
            <input
                type="text"
                placeholder="Ej. Ada Lovelace"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
            />
            </div>

            <div className="form-row">
            <div className="form-group">
                <label>País</label>
                <input
                type="text"
                placeholder="Ej. Inglaterra"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Continente</label>
                <select
                value={formData.continent}
                onChange={(e) => updateField('continent', e.target.value)}
                >
                <option value="Europa">Europa</option>
                <option value="Asia">Asia</option>
                <option value="America">America</option>
                <option value="Oceania">Oceania</option>
                <option value="Africa">Africa</option>
                </select>
            </div>
            </div>

            <div className="form-row">
            <div className="form-group">
                <div className="label-with-hint">
                <label>Año de nacimiento</label>
                <span className="field-hint">Negativo = a.C.</span>
                </div>
                <input
                type="number"
                value={formData.birthYear}
                onChange={(e) => updateField('birthYear', Number(e.target.value))}
                />
            </div>

            <div className="form-group">
                <label>Año de muerte</label>
                <input
                type="number"
                value={formData.yearOfDeath}
                onChange={(e) => updateField('yearOfDeath', Number(e.target.value))}
                />
            </div>
            </div>

            <div className="form-row">
            <div className="form-group">
                <label>Período</label>
                <select
                value={formData.period}
                onChange={(e) => updateField('period', e.target.value)}
                >
                <option value="Edad Antigua">Edad Antigua</option>
                <option value="Edad Media">Edad Media</option>
                <option value="Edad Moderna">Edad Moderna</option>
                <option value="Edad Contemporanea">Edad Contemporánea</option>
                </select>
            </div>

            <div className="form-group">
                <label>Género</label>
                <select
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value)}
                >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                </select>
            </div>
            </div>

            <div className="form-row">
            <div className="form-group">
                <label>Posición / Cargo</label>
                <input
                type="text"
                placeholder="Ej. Ninguno"
                value={formData.position}
                onChange={(e) => updateField('position', e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Conocido por</label>
                <input
                type="text"
                placeholder="Ej. Matemáticas"
                value={formData.knowFor}
                onChange={(e) => updateField('knowFor', e.target.value)}
                />
            </div>
            </div>

            <div className="form-group full-width">
            <label>Ocupaciones</label>
            <div className="occupations-pills">
                {occupations.map((occupation) => {
                const isSelected = formData.occupationIds.includes(occupation.id);
                return (
                    <button
                    type="button"
                    key={occupation.id}
                    className={`occupation-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleOccupation(occupation.id)}
                    >
                    {occupation.name}
                    </button>
                );
                })}
            </div>
            </div>

            <div className="form-actions">
            {onCancel && (
                <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancelar
                </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {submitButtonText}
            </button>
            </div>
        </form>
        </div>
    );
};

export default CharacterForm;