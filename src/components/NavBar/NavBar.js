// src/components/NavBar/NavBar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    return (
        <nav className="NavBar">
            <NavLink to="/" exact activeClassName="active">Home</NavLink>
            <NavLink to="/details" activeClassName="active">Detalhes</NavLink>
        </nav>
    );
};

export default NavBar;
