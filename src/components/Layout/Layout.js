// src/components/Layout/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="Layout">
            <header className="Layout-header">
                <Link to="/" className="Layout-link">cotagraph</Link>
            </header>
            <main className="Layout-main">{children}</main>
            <footer className="Layout-footer">
                <Link to="/utilitarios" className="Layout-link">Utilitários</Link>
            </footer>
        </div>
    );
};

export default Layout;
