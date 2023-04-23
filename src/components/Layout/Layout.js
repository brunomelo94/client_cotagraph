// src/components/Layout/Layout.js
import React from 'react';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="Layout">
            <header className="Layout-header">Cota Graph</header>
            <main className="Layout-main">{children}</main>
            <footer className="Layout-footer">Utilitários</footer>
        </div>
    );
};

export default Layout;
