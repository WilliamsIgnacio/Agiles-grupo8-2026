import { createBrowserRouter, RouterProvider, Outlet, Navigate, useLocation } from 'react-router-dom';
import "./App.css";
import { Toaster } from 'sileo';

//importacion de componentes
import Navbar from './components/Navbar/Navbar';
import Admin, { CharacterFormOutlet, CharactersTableOutlet, ChallengesFormOutlet, ChallengesTableOutlet, ScoresTableOutlet } from './pages/Admin/Admin';
import Jugar from './pages/Jugar/Jugar';
import DailyChallenges from './pages/DailyChallenges/DailyChallenges';
import OccupationsTable from './components/OccupationsTable/OccupationsTable';
import DifficultiesTable from './components/DifficultiesTable/DifficultiesTable';
import Level from './components/Level/Level';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/Auth/Auth';
import ChangePassword from './pages/Account/ChangePassword';

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <p>Cargando sesión...</p>;
    if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    if (user.role !== 'admin') return <Navigate to="/jugar" replace />;
    return <>{children}</>;
};

const AuthenticatedGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    if (loading) return <p>Cargando sesión...</p>;
    if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
    return <>{children}</>;
};


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
            { path: 'auth', element: <AuthPage /> },
            { path: 'cuenta/password', element: <AuthenticatedGuard><ChangePassword /></AuthenticatedGuard> },
            { path: 'jugar', element: <Jugar /> },
            { path: 'jugar/practica', element: <Level practiceMode /> },
            { path: 'jugar/desafio/:challengeId', element: <Level /> },
            { path: 'jugar/desafios', element: <DailyChallenges /> },
            { path: 'jugar/desafio-diario/:date', element: <Level dailyMode /> },
            { 
                path: 'admin', 
                element: <AdminGuard><Admin /></AdminGuard> ,
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
                    {
                        path: 'scores',
                        element: <ScoresTableOutlet />,
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
            <AuthProvider><RouterProvider router={router} /></AuthProvider>
        </>
    );
};

export default App;