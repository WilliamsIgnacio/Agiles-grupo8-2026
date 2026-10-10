import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

interface NavItem {
    name: string;
    path: string;
}

const navLinks: NavItem[] = [
    { name: 'Jugar', path: '/jugar'},
    { name: 'Administrador', path: '/admin'},
];

const Navbar: React.FC = () => {

    return (
        <header className="navbar-container">
        {/*logo*/}
            <span className="titulo">Histodle</span>
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
            </nav>
        </header>
    );
};

export default Navbar