import React from 'react';
import { useState, useEffect } from 'react';
import type { SubmitEvent } from 'react';

//importacion de componentes
import CharactersTable from '../../components/CharactersTable/CharactersTable';
import OccupationsTable from '../../components/OccupationsTable/OccupationsTable';

//importacion de tipos
import type { Character, CharacterInput } from '../../types/character';
import type { Occupation } from '../../types/occupations';

//importacion servicios
import {
  getCharacters,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../../services/character';
import {
  getOccupations,
  updateOccupation,
  deleteOccupation,
  createOccupation,
} from '../../services/occupations';


const Admin: React.FC = () => {

  const [characters, setCharacters] = useState<Character[]>([]);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('Masculino');
  const [newPeriod, setNewPeriod] = useState('Edad Antigua');
  const [newCountry, setNewCountry] = useState('');
  const [newContinent, setNewContinent] = useState('Europa');
  const [newKnowFor, setNewKnowFor] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newBirthYear, setNewBirthYear] = useState(0);
  const [newYearOfDeath, setNewYearOfDeath] = useState(0);
  const [newOccupationsIds, setNewOccupationsIds] = useState<number[]>([]);

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editForm, setEditForm] = useState<CharacterInput | null>(null);


  useEffect(() => {
    Promise.all([getCharacters(), getOccupations()])
      .then(([loadedCharacters, loadedOccupations]) => {
        setCharacters(loadedCharacters);
        setOccupations(loadedOccupations);
      })
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error ? reason.message : 'Error al cargar los datos',
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const [occupationsError, setOccupationsError] = useState<string | null>(null);
  const [editingOccupation, setEditingOccupation] = useState<Occupation | null>(null);
  const [occupationName, setOccupationName] = useState('');

  useEffect(() => {
    getOccupations()
      .then(setOccupations)
      .catch((reason: unknown) => {
        setOccupationsError(
          reason instanceof Error
            ? reason.message
            : 'Error al cargar las ocupaciones',
        );
      });
  }, []);

  if (loading) return <p>Cargando personajes...</p>;
  if (error) return <p>{error}</p>;


  const addCharacter = async (event: SubmitEvent) => {
    event.preventDefault();

    const characterDTO: CharacterInput = {
      name: newName,
      gender: newGender,
      period: newPeriod,
      country: newCountry,
      continent: newContinent,
      knowFor: newKnowFor,
      position: newPosition,
      birthYear: newBirthYear,
      yearOfDeath: newYearOfDeath,
      occupationIds: newOccupationsIds
    };

    try {
      console.log(characterDTO);
      const createdCharacter = await createCharacter(characterDTO);
      setCharacters((currentCharacters) => [...currentCharacters, createdCharacter])

      setNewName('');
      setNewGender('Masculino');
      setNewPeriod('Edad Antigua');
      setNewCountry('');
      setNewContinent('Europa');
      setNewKnowFor('');
      setNewPosition('');
      setNewBirthYear(0);
      setNewYearOfDeath(0);
      setNewOccupationsIds([]);
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo crear el personaje');
    }
  };


  const addOccupation = async (event: SubmitEvent) => {
    event.preventDefault();

    const name = occupationName.trim();
    if (!name) {
      alert('El nombre de la ocupación no puede estar vacío.');
      return;
    }

    try {
      const createdOccupation = await createOccupation( { name });
      setOccupations((currentOccupations) => [...currentOccupations, createdOccupation]);
      setOccupationName('');
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo crear la ocupación');
    }
  };

  const startEditing = (character: Character) => {
    setEditingCharacter(character);
    setEditForm({
      name: character.name,
      gender: character.gender,
      period: character.period,
      country: character.country,
      continent: character.continent,
      knowFor: character.knowFor,
      position: character.position,
      birthYear: character.birthYear,
      yearOfDeath: character.yearOfDeath,
      occupationIds: character.occupations.map((occupation) => occupation.id)
    });
  };


  type EditableCharacter = Omit<CharacterInput, 'occupationIds'>;

  function updateEditField<Key extends keyof EditableCharacter>(
    field: Key,
    value: EditableCharacter[Key],
  ) {
    setEditForm((current) =>
      current ? { ...current, [field]: value } : current
    );
  }


  const saveCharacter = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!editingCharacter || !editForm) return;

    try {
      const updatedCharacter = await updateCharacter(
        editingCharacter.id,
        editForm
      );

     // updateInList(updatedCharacter);
      setCharacters((currentCharacters) =>
        currentCharacters.map((character) =>
          character.id === updatedCharacter.id ? updatedCharacter : character,
        ),
      );

      setEditingCharacter(null);
      setEditForm(null);
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo modificar el personaje');
    }
  };

  const startEditingOccupation = (occupation: Occupation) => {
    setEditingOccupation(occupation);
    setOccupationName(occupation.name);
  };

  const saveOccupation = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!editingOccupation) return;
    if (!occupationName.trim()) {
      alert('El nombre de la ocupación no puede estar vacío.');
      return;
    }

    try {
      const updatedOccupation = await updateOccupation(editingOccupation.id, {
        name: occupationName.trim(),
      });
      setOccupations((currentOccupations) =>
        currentOccupations.map((occupation) =>
          occupation.id === updatedOccupation.id ? updatedOccupation : occupation,
        ),
      );
      setEditingOccupation(null);
      setOccupationName('');
      alert('La ocupación se modificó correctamente.');
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo modificar la ocupación');
    }
  };

  const deleteSelectedCharacter = async (character: Character) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar a ${character.name}?`
    );
    if (!confirmed) return;

    try {
      await deleteCharacter(character.id);
      setCharacters((currentCharacters) =>
        currentCharacters.filter((currentCharacter) => currentCharacter.id !== character.id),
      );

      if (editingCharacter?.id === character.id) {
        setEditingCharacter(null);
        setEditForm(null);
      }
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo eliminar el personaje');
    }
  };

  const readOccupationIds = (select: HTMLSelectElement) =>
    Array.from(select.selectedOptions, (option) => Number(option.value));

  const removeOccupation = async (occupation: Occupation) => {
    if (!window.confirm(`¿Está seguro de eliminar la ocupación "${occupation.name}"?`)) {
      return;
    }

    try {
      await deleteOccupation(occupation.id);
      setOccupations((currentOccupations) =>
        currentOccupations.filter((currentOccupation) => currentOccupation.id !== occupation.id),
      );
      if (editingOccupation?.id === occupation.id) {
        setEditingOccupation(null);
        setOccupationName('');
      }
      alert('La ocupación se eliminó correctamente.');
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo eliminar la ocupación');
    }
  };

  return (
    <section>
      <h1>Administrador</h1>
      <p>Listado de personajes:</p>

      <CharactersTable
        characters={characters}
        onEdit={startEditing}
        onDelete={(character) => {
          void deleteSelectedCharacter(character);
        }}
      />

      {editingCharacter && editForm && (
        <>
          <h2>Modificar personaje: {editingCharacter.name}</h2>

          <form onSubmit={saveCharacter}>
            <div>
              Nombre: <input
                value={editForm.name}
                onChange={(event) => updateEditField('name', event.target.value)}
              />
            </div>
            <div>
              Género: <select
                value={editForm.gender}
                onChange={(event) => updateEditField('gender', event.target.value)}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>
            <div>
              Período: <select
                value={editForm.period}
                onChange={(event) => updateEditField('period', event.target.value)}
              >
                <option value="Edad Antigua">Edad Antigua</option>
                <option value="Edad Media">Edad Media</option>
                <option value="Edad Moderna">Edad Moderna</option>
                <option value="Edad Contemporanea">Edad Contemporanea</option>
              </select>
            </div>
            <div>
              País: <input
                value={editForm.country}
                onChange={(event) => updateEditField('country', event.target.value)}
              />
            </div>
            <div>
              Continente: <select
                value={editForm.continent}
                onChange={(event) => updateEditField('continent', event.target.value)}
              >
                <option value="Europa">Europa</option>
                <option value="Asia">Asia</option>
                <option value="America">America</option>
                <option value="Oceania">Oceania</option>
                <option value="Africa">Africa</option>
              </select>
            </div>
            <div>
              Conocido por: <input
                value={editForm.knowFor}
                onChange={(event) => updateEditField('knowFor', event.target.value)}
              />
            </div>
            <div>
              Posición: <input
                value={editForm.position}
                onChange={(event) => updateEditField('position', event.target.value)}
              />
            </div>
            <div>
              Año de nacimiento: <input
                type="number"
                value={editForm.birthYear}
                onChange={(event) => updateEditField('birthYear', Number(event.target.value))}
              />
            </div>
            <div>
              Año de fallecimiento: <input
                type="number"
                value={editForm.yearOfDeath}
                onChange={(event) => updateEditField('yearOfDeath', Number(event.target.value))}
              />
            </div>

            <label>
              Ocupaciones
              <select
                multiple
                value={editForm.occupationIds.map(String)}
                onChange={(event) => {
                  const occupationIds = readOccupationIds(event.currentTarget);

                  setEditForm((current) => 
                    current ? { ...current, occupationIds } : current
                  );
                }}
              >
                {occupations.map((occupation) => (
                  <option key={occupation.id} value={occupation.id}>
                    {occupation.name}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <button type="submit">Guardar cambios</button>
              <button
                type="button"
                onClick={() => {
                  setEditingCharacter(null);
                  setEditForm(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}

      <h2>Agregar Personaje historico:</h2>
      <form onSubmit={addCharacter}>
        <div>
          Nombre: <input value={newName} onChange={(event) => setNewName(event.target.value)} />
        </div>
        <div>
          Genero: <select value={newGender} onChange={(event) => setNewGender(event.target.value)}>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>
        <div>
          Periodo: <select value={newPeriod} onChange={(event) => setNewPeriod(event.target.value)}>
            <option value="Edad Antigua">Edad Antigua</option>
            <option value="Edad Media">Edad Media</option>
            <option value="Edad Moderna">Edad Moderna</option>
            <option value="Edad Contemporanea">Edad Contemporanea</option>
          </select>
        </div>
        <div>
          Pais: <input value={newCountry} onChange={(event) => setNewCountry(event.target.value)} />
        </div>
        <div>
          Continente: <select value={newContinent} onChange={(event) => setNewContinent(event.target.value)}>
            <option value="Europa">Europa</option>
            <option value="Asia">Asia</option>
            <option value="America">America</option>
            <option value="Oceania">Oceania</option>
            <option value="Africa">Africa</option>
          </select>
        </div>
        <div>
          Conocido por: <input value={newKnowFor} onChange={(event) => setNewKnowFor(event.target.value)} />
        </div>
        <div>
          Posicion: <input value={newPosition} onChange={(event) => setNewPosition(event.target.value)} />
        </div>
        <div>
          Anio de nacimiento: <input value={newBirthYear} onChange={(event) => setNewBirthYear(Number(event.target.value))} />
        </div>
        <div>
          Anio de fallecimiento: <input value={newYearOfDeath} onChange={(event) => setNewYearOfDeath(Number(event.target.value))} />
        </div>

        <label>
          Ocupaciones
          <select 
            multiple
            value={newOccupationsIds.map(String)}
            onChange={(event) => 
              setNewOccupationsIds(readOccupationIds(event.currentTarget))
            }
          >
            {occupations.map((occupation) => (
              <option key={occupation.id} value={occupation.id}>
                {occupation.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <button type="submit">Agregar Personaje</button>
        </div>
      </form>

      <h2>Ocupaciones</h2>
      {occupationsError ? (
        <p>{occupationsError}</p>
      ) : (
        <OccupationsTable
          occupations={occupations}
          onEdit={startEditingOccupation}
          onDelete={removeOccupation}
        />
      )}

      {editingOccupation && (
        <>
          <h2>Modificar ocupación: {editingOccupation.name}</h2>
          <form onSubmit={saveOccupation}>
            <div>
              Nombre:{' '}
              <input
                required
                value={occupationName}
                onChange={(event) => setOccupationName(event.target.value)}
              />
            </div>
            <div>
              <button type="submit">Guardar cambios</button>
              <button
                type="button"
                onClick={() => {
                  setEditingOccupation(null);
                  setOccupationName('');
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}
      <h2>Agregar Ocupación:</h2>
      <form onSubmit={addOccupation}>
        <div>
          Nombre: <input value={occupationName} onChange={(event) => setOccupationName(event.target.value)} />
        </div>
        <div>
          <button type="submit">Agregar Ocupación</button>
        </div>
      </form>
    </section>
  );
};

export default Admin;