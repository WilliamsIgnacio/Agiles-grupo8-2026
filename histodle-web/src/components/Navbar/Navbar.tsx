import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../images/histodle-classic-white-on-black.png';
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
            </nav>
        </header>
    );
};

export default Navbar