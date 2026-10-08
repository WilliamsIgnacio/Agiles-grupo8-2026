import React from 'react';
import { NavLink } from 'react-router-dom';

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
    <nav>
      {navLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar
