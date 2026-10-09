import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin  from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';


const MainLayout: React.FC = () => {

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
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