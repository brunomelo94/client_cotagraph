// src/components/Layout/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="Layout">
            <header className="Layout-header">
                <Link to="/" className="Layout-link">home</Link>
            </header>
            <main className="Layout-main">{children}</main>
            <footer className="Layout-footer">
                <Link to="/utilitarios" className="Layout-link">utils</Link>
            </footer>
        </div>
    );
};

export default Layout;
