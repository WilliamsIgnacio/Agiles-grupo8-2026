import React from 'react';

import type { Character } from '../../types/character';


interface Props {
  characters: Character[]
};

const CharactersTable: React.FC<Props> = ({ characters }) => {

  const showKnowFor = (knowFor: string): void => {
    alert(knowFor);
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Genero</th>
          <th>Periodo</th>
          <th>Pais</th>
          <th>Continente</th>
          <th>Conocido por</th>
          <th>Nacimiento</th>
          <th>Fallecimiento</th>
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
            <td><button type="button" onClick={() => showKnowFor(character.knowFor)}>Mostrar</button></td>
            <td>{character.position}</td>
            <td>{character.birthYear}</td>
            <td>{character.yearOfDeath}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default CharactersTable;