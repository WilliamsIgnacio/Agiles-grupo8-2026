import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { sileo } from 'sileo';
import logo from '../../images/histodle-classic-white-on-black.png';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { googleLinkURL } from '../../services/auth';

interface NavItem {
    name: string;
    path: string;
}

const navLinks: NavItem[] = [{ name: 'Jugar', path: '/jugar' }];

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        try {
            await sileo.promise(logout(), {
                loading: { title: 'Cerrando sesión...' },
                success: { title: 'Sesión cerrada.' },
                error: { title: 'No se pudo cerrar la sesión.' },
            });
            setIsUserMenuOpen(false);
        } catch {
            setIsUserMenuOpen(true);
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        const closeMenu = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', closeMenu);
        return () => document.removeEventListener('mousedown', closeMenu);
    }, []);

    return (
        <header className="navbar-container">
            <div className="titulo" aria-label="Histodle logo">
                <img className="brand-logo" src={logo} alt="" />
                <span className="brand-text">Histodle</span>
            </div>
            <nav className="navbar-links">
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {link.name}
                    </NavLink>
                ))}
                {user?.role === 'admin' && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        Administrador
                    </NavLink>
                )}
                {user ? (
                    <div className="user-menu" ref={userMenuRef}>
                        <button
                            className="user-menu-trigger"
                            type="button"
                            aria-expanded={isUserMenuOpen}
                            aria-haspopup="menu"
                            onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                        >
                            {user.name || user.email}
                        </button>
                        {isUserMenuOpen && (
                            <div className="user-menu-dropdown" role="menu">
                                {user.provider === 'local' && (
                                    <a className="user-menu-item" href={googleLinkURL} role="menuitem">
                                        Vincular Google
                                    </a>
                                )}
                                <NavLink
                                    className="user-menu-item"
                                    to="/cuenta/password"
                                    role="menuitem"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    {user.provider === 'google' ? 'Agregar contraseña' : 'Cambiar contraseña'}
                                </NavLink>
                                <button
                                    className="user-menu-item user-menu-logout"
                                    type="button"
                                    role="menuitem"
                                    onClick={() => void handleLogout()}
                                    disabled={isLoggingOut}
                                >
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        width="18"
                                        height="18"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M10 17l5-5-5-5" />
                                        <path d="M15 12H3" />
                                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                                    </svg>
                                    {isLoggingOut ? 'Cerrando sesión...' : 'Salir'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <NavLink className="nav-item" to="/auth">Ingresar</NavLink>
                )}
            </nav>
        </header>
    );
};

export default Navbar