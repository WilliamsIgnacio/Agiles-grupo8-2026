import React from 'react';
import { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin  from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';

//importacion de tipos
import type { Character } from './types/character';

//importacion de servicios
import { getCharacters } from './services/character';


const MainLayout: React.FC = () => {

  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCharacters()
      .then(setCharacters)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : 'Error al cargar personajes');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Outlet context={{ characters, loading, error }} />
      </main>
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'jugar', element: <Jugar />},
      { path: 'admin', element: <Admin />}
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App
