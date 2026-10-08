import React from 'react';

import type { Character } from '../../types/character';

interface Props {
  characters: Character[];
  onEdit: (character: Character) => void;
}

const CharactersTable: React.FC<Props> = ({ characters, onEdit }) => {
  const showKnowFor = (knowFor: string): void => {
    alert(knowFor);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Género</th>
          <th>Período</th>
          <th>País</th>
          <th>Continente</th>
          <th>Conocido por</th>
          <th>Posición</th>
          <th>Nacimiento</th>
          <th>Fallecimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {characters.map((character) => (
          <tr key={character.id}>
            <td>{character.name}</td>
            <td>{character.gender}</td>
            <td>{character.period}</td>
            <td>{character.country}</td>
            <td>{character.continent}</td>
            <td>
              <button
                type="button"
                onClick={() => showKnowFor(character.knowFor)}
              >
                Mostrar
              </button>
            </td>
            <td>{character.position}</td>
            <td>{character.birthYear}</td>
            <td>{character.yearOfDeath}</td>
            <td>
              <button type="button" onClick={() => onEdit(character)}>
                Editar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default CharactersTable;