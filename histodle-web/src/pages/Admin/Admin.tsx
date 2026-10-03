import React from 'react';
import { useState, useEffect } from 'react';
import type { Character } from '../../types/character';
import { CharacterForm } from '../../components/CharacterForm/CharacterForm';
import { getCharacters, createCharacter } from '../../services/character';
import './Admin.css';


export const Admin: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'personajes' | 'niveles' | 'ocupaciones'>('personajes');
  const [isCreating, setIsCreating] = useState(false);

  const fetchCharacterList = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCharacters();
      setCharacters(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al conectar con la API';
      console.error(error);
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacterList();
  }, []);

  const handleAddCharacter = async (newCharacterData: Omit<Character, 'id'>) => {
    try {
      const createdCharacter = await createCharacter(newCharacterData);
      setCharacters((prev) => [createdCharacter, ...prev]);
      setIsCreating(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al guardar el personaje';
      console.error(error);
      alert(message)
    }
  };

  return (
    <div className='admin-container'>
      <div className='admin-content'>
        <div className='admin-tabs'>
          <button
            className={`tab-item ${activeTab === 'personajes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('personajes');
              setIsCreating(false);
            }}
          >
            Personajes
          </button>
          <button
            className={`tab-item ${activeTab === 'personajes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('personajes');
              setIsCreating(false);
            }}
          >
            Niveles
          </button>
          <button
            className={`tab-item ${activeTab === 'personajes' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('personajes');
              setIsCreating(false);
            }}
          >
            Ocupaciones
          </button>
        </div>

        {isCreating ? (
          <CharacterForm
            onBack={() => setIsCreating(false)}
            onSubmit={handleAddCharacter}
          />
        ) : (
          <>
            <div className='admin-header'>
              <div>
                <h1 className='admin-title'>Personajes</h1>
                <p className='admin-subtitle'>{}</p>
              </div>
            </div>
            <button
              className='btn-new-character'
              onClick={() => setIsCreating(true)}
            >
              <span>+</span> Nuevo personaje
            </button>

            {error && (
              <div style={{ color: '#e06c75', marginBottom: '1.5rem', fontSize: '0.95rem'}}>
                {error}
              </div>
            )}

            <div className='table-wrapper'>
              <table className='admin-table'>
                <thead>
                  <tr>
                    <th>NOMBRE</th>
                    <th>PAIS</th>
                    <th>VIDA</th>
                    <th>OCUPACIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#7d7265' }}>
                        Cargando personajes...
                      </td>
                    </tr>
                  ) : characters.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#7d7265' }}>
                        No hay personajes registrados.
                      </td>
                    </tr>
                  ) : (
                    characters.map((char) => (
                      <tr key={char.id}>
                        <td>
                          <div className="cell-name">{char.name}</div>
                          <div className="cell-category">{char.position}</div>
                        </td>
                        <td>
                          <span className="cell-location">
                            {char.country}, {char.continent}
                          </span>
                        </td>
                        <td>
                          <span className="cell-life">
                            0
                          </span>
                        </td>
                        <td>
                          <span className="cell-knowfor">{char.knowFor}</span>
                        </td>
                        <td className="cell-actions">
                          <button className="btn-edit">Ver / editar</button>
                          <button
                            className="btn-delete"
                          >
                            <svg
                              width="15"
                              height="15"
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
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}