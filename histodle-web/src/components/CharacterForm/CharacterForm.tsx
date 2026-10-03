import React from 'react';
import { useState } from 'react';
import type { Character } from '../../types/character';
import './CharacterForm.css';


//NO SE INCLUYERON LAS OCUPACIONES, ESTAN HARDCODEADAS PARA PODER ORIENTARSE VISUALMENTE

const occupations = [
  'Artista',
  'Cientifico'
]

interface CharacterFormProps {
  onBack: () => void;
  onSubmit: (newCharacter: Omit<Character, 'id'>) => void;
}

export const CharacterForm: React.FC<CharacterFromProps> = ({ onBack, onSubmit }) => {
  const [name,setName] = useState('');
  const [gender, setGender] = useState('');
  const [period, setPeriod] = useState('');
  const [country, setCountry] = useState('');
  const [continent, setContinent] = useState('');
  const [knowFor, setKnowFor] = useState('');
  const [position, setPosition] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');

  //NO ESTAN INCLUIDAS LAS OCUPACIONES, HAY QUE AGREGARLAS CUANDO TENGAMOS EL ABMC DE OCUPACIONES
  const [selectedOccupations, setSelectedOccupations] = useState<string[]>([]);

  const toggleOccupation = (occupation: string) => {
    setSelectedOccupations((prev) => 
      prev.includes(occupation) ? prev.filter((item) => item !== occupation) : [...prev, occupation]
    );
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSubmit({
      name,
      gender,
      period,
      country,
      continent,
      knowFor,
      position,
      birthYear,
      deathYear
    });
  };

  return (
    <div className='form-page-container'>
      <button type='button' className='btn-back-link' onClick={onBack}>
        <span className='arrow-back'>←</span> Personajes
      </button>

      <h1 className='form-main-title'>Registrar Personaje</h1>

      <div className='form-card-container'>
        <form onSubmit={handleSubmit} className='character-form'>

          //NOMBRE
          <div className="form-fild full-width">
            <label className='form-label'>Nombre</label>
            <input
              type='text'
              className='form-input'
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          //GENERO
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Genero</label>
              <div className='select-wrapper'>
                <select
                  className='form-select'
                  value={gender}
                  onChange={(event) => setGender(event.target.value)}
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          //PERIODO
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Periodo</label>
              <div className='select-wrapper'>
                <select
                  className='form-select'
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                >
                  <option value="Edad Contemporanea">Edad Contemporanea</option>
                  <option value="Edad Moderna">Edad Moderna</option>
                  <option value="Edad Media">Edad Media</option>
                  <option value="Edad Antigua">Edad Antigua</option>
                </select>
              </div>
            </div>
          </div>

          //PAIS
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Pais</label>
              <input
                type='text'
                className='form-input'
                placeholder='Ej. Francia'
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                required
              />
            </div>
          </div>

          //CONTINENTE
          <div className='form-fild'>
            <label className='form-label'>Continente</label>
            <div className='select-wrapper'>
              <select
                className='form-select'
                value={continent}
                onChange={(event) => setContinent(event.target.value)}
              >
                <option value="Europa">Europa</option>
                <option value="America">America</option>
                <option value="Asia">Asia</option>
                <option value="Africa">Africa</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>
          </div>

          //CONOCIDO POR 
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Conocido por</label>
              <input
                type='text'
                className='form-input'
                placeholder='Ej. Cruzar los Andes'
                value={knowFor}
                onChange={(event) => setKnowFor(event.target.value)}
                required
              />
            </div>
          </div>

          //CARGO
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Cargo</label>
              <input
                type='text'
                className='form-input'
                placeholder='Ej. Emperador'
                value={position}
                onChange={(event) => setPosition(event.target.value)}
                required
              />
            </div>
          </div>

          //FECHA NACIMIENTO
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Año de nacimiento</label>
              <input
                type='number'
                className='form-input'
                placeholder='Ej. 1769'
                value={birthYear}
                onChange={(event) => setBirthYear(event.target.value)}
                required
              />
            </div>
          </div>

          //FECHA FALLECIMIENTO
          <div className='form-row'>
            <div className='form-fild'>
              <label className='form-label'>Año de fallecimiento</label>
              <input
                type='number'
                className='form-input'
                placeholder='Ej. 1700'
                value={deathYear}
                onChange={(event) => setDeathYear(event.target.value)}
                required
              />
            </div>
          </div>

          <div className='form-submit-row'>
            <button type='submit' className='btn-submit-character'>
              Registrar personaje
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


