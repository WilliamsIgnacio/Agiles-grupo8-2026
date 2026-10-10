import React from 'react';
import { Link } from 'react-router-dom';


const Jugar: React.FC = () => {

  const levels = [
    { number: 1, title: 'Mente Brillante', difficulty: 'Fácil', attempts: 10 },
    { number: 2, title: 'Barrilete Cósmico', difficulty: 'Fácil', attempts: 10 },
  ];

  return (
    <div>
      <h1>Quien se esconde detras de la historia?</h1>
      <p>Elegi un nivel y escribi cualquier personaje. Cada intento te muestra que tan cerca estas del misterioso.</p>

      <div>
        <div></div>
        <p>Coincide</p>
      </div>
      <div>
        <div></div>
        <p>Cerca</p>
      </div>
      <div>
        <div></div>
        <p>No Coincide</p>
      </div>
      <div>
        <div></div>
        <p>El misterioso tiene un valor mayor</p>
      </div>


      <h2>Elegi un nivel</h2>
      {levels.map((level) => (
        <div className="level" key={level.number}>
          <b>Nivel {level.number}</b>
          <p>{level.difficulty}</p>
          <h3>{level.title}</h3>
          <b>{level.attempts} intentos</b>
          <Link to={`/jugar/nivel/${level.number}`}>Jugar</Link>
        </div>
      ))}
    </div>
  );
};

export default Jugar;