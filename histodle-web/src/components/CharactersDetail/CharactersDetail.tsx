import React from 'react';
import type { Character } from '../../types/character';
import './CharactersDetail.css';

interface CharacterDetailProps {
    character: Character;
    onBack: () => void;
    onEdit: (character: Character) => void;
    onDelete: (character: Character) => void;
}

const CharacterDetail: React.FC<CharacterDetailProps> = ({
    character,
    onBack,
    onEdit,
    onDelete,
}) => {

    return (
        <div className="character-detail-container">
        <button type="button" className="btn-back" onClick={onBack}>
            ← Personajes
        </button>

        <div className="detail-card">

            <div className="detail-header">
            <div>
                <h2 className="detail-name">{character.name}</h2>
                <p className="detail-years">
                {character.birthYear} – {character.yearOfDeath}
                </p>
            </div>

            <div className="detail-actions">
                <button
                type="button"
                className="btn-modificar"
                onClick={() => onEdit(character)}
                >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Modificar
                </button>

                <button
                type="button"
                className="btn-icon-delete"
                title="Eliminar"
                onClick={() => onDelete(character)}
                >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                </button>
            </div>
            </div>

            <div className="detail-grid">
            <div className="detail-field">
                <span className="field-label">PAÍS</span>
                <span className="field-value">{character.country || 'Sin datos'}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">CONTINENTE</span>
                <span className="field-value">{character.continent}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">PERÍODO</span>
                <span className="field-value">{character.period}</span>
            </div>

            <div className="detail-field">
                <span className="field-label">NACIMIENTO</span>
                <span className="field-value">{character.birthYear}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">MUERTE</span>
                <span className="field-value">{character.yearOfDeath}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">GÉNERO</span>
                <span className="field-value">{character.gender}</span>
            </div>

            <div className="detail-field">
                <span className="field-label">CARGO / POSICIÓN</span>
                <span className="field-value">{character.position || 'Ninguno'}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">CONOCIDO POR</span>
                <span className="field-value">{character.knowFor || 'Sin especificación'}</span>
            </div>
            <div className="detail-field">
                <span className="field-label">OCUPACIONES</span>
                <span className="field-value">
                {character.occupations?.map((occ) => occ.name).join(', ') || 'Sin ocupaciones'}
                </span>
            </div>
            </div>
        </div>
        </div>
    );
};

export default CharacterDetail;