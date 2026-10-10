import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import "./App.css";

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin, { CharacterFormOutlet, CharactersTableOutlet } from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';
import OccupationsTable from './components/OccupationsTable/OccupationsTable';
import Level from './components/Level/Level';


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
            { path: 'jugar/nivel/:nroLevel', element: <Level /> },
            { 
                path: 'admin', 
                element: <Admin /> ,
                children: [
                    { index: true, element: <Navigate to="characters" replace /> },
                    {
                        path: 'characters',
                        element: <CharactersTableOutlet />,
                    },
                    {
                        path: 'characters/register',
                        element: <CharacterFormOutlet />,
                    },
                    {
                        path: 'characters/edit/:id',
                        element: <CharacterFormOutlet />,
                    },
                    {
                        path: 'occupations',
                        element: (
                            <OccupationsTable
                                occupations={[]}
                            />
                        ),
                    },
                ],
            },
        ],
    },
]);

const App: React.FC = () => {
    return <RouterProvider router={router} />;
};

export default App;