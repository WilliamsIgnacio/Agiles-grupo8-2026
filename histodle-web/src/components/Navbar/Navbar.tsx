import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  return (
    <header className='navbar-header'>
      <div className='navbar-container'>
        <NavLink to='/' className={'navbar-brand'}>
          <div className='brand-icon'>H</div>
          <span className='brand-text'>Histodle</span>
        </NavLink>

        <nav>
          <NavLink
            to='/'
            end
            className={({ isActive }) => `nav-button ${isActive ? 'nav-button-active' : ''}`}
          >
            Jugar
          </NavLink>
          <NavLink
            to='/admin'
            className={({ isActive }) => `nav-button ${isActive ? 'nav-button-active' : ''}`}
          >
            Administrar
          </NavLink>
        </nav>
      </div>
    </header>
  )
}