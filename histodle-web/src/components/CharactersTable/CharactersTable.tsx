import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character } from '../../types/character';
import { sileo } from 'sileo';
import CharactersDetail from '../CharactersDetail/CharactersDetail';
import './CharactersTable.css';


interface CharactersTableProps {
    characters: Character[];
    onSelectCharacter?: (character: Character) => void;
    onEdit: (character: Character) => void;
    onDelete: (character: Character) => Promise<void> | void;
}

const CharactersTable: React.FC<CharactersTableProps> = ({
    characters,
    onSelectCharacter,
    onEdit,
    onDelete,
}) => {
    const navigate = useNavigate();
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionError, setActionError] = useState<string | null>(null);

    const normalizeSearchText = (value: string) =>
        value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
    const normalizedSearchTerm = normalizeSearchText(searchTerm.trim());
    const filteredCharacters = characters.filter((character) => {
        const searchableText = [
            character.name,
            character.country,
            character.birthYear.toString(),
            character.yearOfDeath.toString(),
            ...(character.occupations ?? []).map((occupation) => occupation.name),
        ].join(' ');

        return normalizeSearchText(searchableText).includes(normalizedSearchTerm);
    });

    const handleSelect = (character: Character) => {
        setSelectedCharacter(character);
        if (onSelectCharacter) {
        onSelectCharacter(character);
        }
    };

    const handleEdit = (character: Character) => {
        onEdit(character);
        navigate(`/admin/characters/edit/${character.id}`);
    };

    const handleDelete = async (character: Character) => {
        try {
            if (window.confirm(`¿Estás seguro de que deseas eliminar al personaje "${character.name}"?`)) {
                setActionError(null);
                const deletion = Promise.all([
                    onDelete(character),
                    new Promise<void>((resolve) => window.setTimeout(resolve, 500)),
                ]);

                await sileo.promise(deletion, {
                    loading: { title: `Eliminando a ${character.name}...` },
                    success: { title: `¡Personaje "${character.name}" eliminado!` },
                    error: { title: `Error al eliminar a ${character.name}` },
                });
                setSelectedCharacter((current) => current?.id === character.id ? null : current);
            }
        } catch (reason: unknown) {
            setActionError(reason instanceof Error ? reason.message : `Error al eliminar el personaje "${character.name}".`);
        }
    };

    if (selectedCharacter) {
        return (
        <CharactersDetail
            character={selectedCharacter}
            onBack={() => setSelectedCharacter(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
        );
    }

    return (
        <div className="characters-container">
        {actionError && <p className="error-text" role="alert">{actionError}</p>}
        <div className="characters-header-bar">
            <div className="search-input-wrapper">
            <svg
                className="search-icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
                type="text"
                className="search-input"
                placeholder="Buscar personaje..."
                aria-label="Buscar personaje por nombre, país, años u ocupación"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <button
                type="button"
                className="btn-register-character"
                onClick={() => navigate("/admin/characters/register")}
            >
                + Registrar personaje
            </button>
        
        </div>

        <div className="characters-grid">
            {filteredCharacters.length > 0 ? filteredCharacters.map((character) => (
            <div key={character.id} className="character-card">
                <div className="card-header">
                <h3 className="character-name">{character.name}</h3>
                <div className="card-actions">
                    <button
                    type="button"
                    className="icon-btn"
                    title="Editar"
                    onClick={() => handleEdit(character)}
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    </button>
                    <button
                    type="button"
                    className="icon-btn delete-btn"
                    title="Eliminar"
                    onClick={() => handleDelete(character)}
                    >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    </button>
                </div>
                </div>

                <p className="character-meta">
                {character.country} · {character.birthYear} – {character.yearOfDeath}
                </p>

                <div className="character-tags">
                {character.occupations?.map((occ) => (
                    <span key={occ.id} className="tag-pill">
                    {occ.name}
                    </span>
                ))}
                </div>

                <button
                type="button"
                className="btn-ver-ficha"
                onClick={() => handleSelect(character)}
                >
                Ver ficha
                </button>
            </div>
            )) : (
                <p className="empty-search-results" role="status">
                    No se encontraron personajes para “{searchTerm}”.
                </p>
            )}
        </div>
        </div>
    );
};

export default CharactersTable;