// src/components/NavBar/NavBar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    return (
        <nav className="NavBar">
            <ul>
                <li>
                    <NavLink to="/" exact activeClassName="active">Home</NavLink>
                </li>
                <li>
                    <NavLink to="/details" activeClassName="active">Detalhes</NavLink>
                </li>
            </ul>
        </nav>
    );
};

export default NavBar;
