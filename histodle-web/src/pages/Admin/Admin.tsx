import React from 'react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import CharactersTable from '../../components/CharactersTable/CharactersTable';

import type { Character, CharactersOutletContext } from '../../types/character';
import type { SubmitEvent } from 'react';

import { createCharacter, updateCharacter } from '../../services/character';


const Admin: React.FC = () => {
  const {
    characters,
    loading,
    error,
    addCharacter: addToList,
    updateCharacter: updateInList
  } = useOutletContext<CharactersOutletContext>();

  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState('Masculino');
  const [newPeriod, setNewPeriod] = useState('Edad Antigua');
  const [newCountry, setNewCountry] = useState('');
  const [newContinent, setNewContinent] = useState('Europa');
  const [newKnowFor, setNewKnowFor] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newBirthYear, setNewBirthYear] = useState(0);
  const [newYearOfDeath, setNewYearOfDeath] = useState(0);

  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editForm, setEditForm] = useState<Omit<Character, 'id'> | null>(null);


  if (loading) return <p>Cargando personajes...</p>;
  if (error) return <p>{error}</p>;


  const addCharacter = async (event: SubmitEvent) => {
    event.preventDefault();

    const characterDTO: Character = {
      id: characters.length + 1,
      name: newName,
      gender: newGender,
      period: newPeriod,
      country: newCountry,
      continent: newContinent,
      knowFor: newKnowFor,
      position: newPosition,
      birthYear: newBirthYear,
      yearOfDeath: newYearOfDeath
    };

    try {
      console.log(characterDTO);
      const createdCharacter = await createCharacter(characterDTO);
      addToList(createdCharacter);

      setNewName('');
      setNewGender('');
      setNewPeriod('');
      setNewCountry('');
      setNewContinent('');
      setNewKnowFor('');
      setNewPosition('');
      setNewBirthYear(0);
      setNewYearOfDeath(0);
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo crear el personaje');
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
      yearOfDeath: character.yearOfDeath
    });
  };


  const updateEditField = (
    field: keyof Omit<Character, 'id'>,
    value: string | number
  ) => {
    setEditForm((current) =>
      current
        ? { ...current, [field]: value } as Omit<Character, 'id'>
        : current
    );
  };


  const saveCharacter = async (event: SubmitEvent) => {
    event.preventDefault();

    if (!editingCharacter || !editForm) return;

    try {
      const updatedCharacter = await updateCharacter(
        editingCharacter.id,
        editForm
      );

      updateInList(updatedCharacter);
      setEditingCharacter(null);
      setEditForm(null);
    } catch (reason) {
      alert(reason instanceof Error ? reason.message : 'No se pudo modificar el personaje');
    }
  };


  return (
    <section>
      <h1>Administrador</h1>
      <p>Listado de personajes:</p>

      <CharactersTable
        characters={characters}
        onEdit={startEditing}
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
        <div>
          <button type="submit">Agregar Personaje</button>
        </div>
      </form>
    </section>
  );
};

export default Admin;
