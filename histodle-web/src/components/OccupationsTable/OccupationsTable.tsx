import React from 'react';

import type { Occupation } from '../../types/occupations';

interface Props {
  occupations: Occupation[];
  onEdit: (occupation: Occupation) => void;
  onDelete: (occupation: Occupation) => void;
}

const OccupationsTable: React.FC<Props> = ({ occupations, onEdit, onDelete }) => (
  <table>
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {occupations.map((occupation) => (
        <tr key={occupation.id}>
          <td>{occupation.name}</td>
          <td>
            <button type="button" onClick={() => onEdit(occupation)}>
              Editar
            </button>
            <button type="button" onClick={() => onDelete(occupation)}>
              Eliminar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default OccupationsTable;
