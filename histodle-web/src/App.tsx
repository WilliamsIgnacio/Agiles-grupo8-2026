import React from 'react';
import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin  from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';

//importacion de tipos
import type { Character } from './types/character';
import type { Occupation } from './types/occupations';

//importacion de servicios
import { getCharacters } from './services/character';
import { getOccupations } from './services/occupations';


const MainLayout: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addCharacter = (character: Character) => {
    setCharacters((currentCharacters) => [...currentCharacters, character]);
  };

  const updateCharacter = (updatedCharacter: Character) => {
    setCharacters((currentCharacters) =>
      currentCharacters.map((character) =>
        character.id === updatedCharacter.id ? updatedCharacter : character,
      ),
    );
  };
/*
  useEffect(() => {
    getCharacters()
      .then(setCharacters)
      .catch((reason: unknown) => {
        setError(
          reason instanceof Error
            ? reason.message
            : 'Error al cargar personajes',
        );
      })
      .finally(() => setLoading(false));
  }, []);
*/

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

  return (
    <>
      <Navbar />
      <main>
        <Outlet
          context={{
            characters,
            occupations,
            loading,
            error,
            addCharacter,
            updateCharacter,
          }}
        />
      </main>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'jugar', element: <Jugar /> },
      { path: 'admin', element: <Admin /> },
    ],
  },
]);

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;