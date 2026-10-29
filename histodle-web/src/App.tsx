import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import "./App.css";
import { Toaster } from 'sileo';

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin, { CharacterFormOutlet, CharactersTableOutlet, ChallengesFormOutlet, ChallengesTableOutlet } from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';
import OccupationsTable from './components/OccupationsTable/OccupationsTable';
import DifficultiesTable from './components/DifficultiesTable/DifficultiesTable';
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
            { index: true, element: <Navigate to="jugar" replace /> },
            { path: 'jugar', element: <Jugar /> },
            { path: 'jugar/practica', element: <Level practiceMode /> },
            { path: 'jugar/desafio/:challengeId', element: <Level /> },
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
                    {
                        path: 'difficulties',
                        element: <DifficultiesTable />,
                    },
                    {
                        path: 'challenges',
                        element: <ChallengesTableOutlet />,
                    },
                    {
                        path: 'challenges/register',
                        element: <ChallengesFormOutlet />,
                    },
                    {
                        path: 'challenges/edit/:id',
                        element: <ChallengesFormOutlet />,
                    },
                ],
            },
        ],
    },
]);

const App: React.FC = () => {
    return ( 
        <>
            <Toaster position='top-center'/>
            <RouterProvider router={router} /> 
        </>
    );
};

export default App;