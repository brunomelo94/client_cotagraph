import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand as={Link} to="/" className="navbar-brand-home">home</Navbar.Brand>
                <Navbar.Brand as={Link} to="/about" className="navbar-brand-home">sobre</Navbar.Brand>
            </Navbar>
            <div className="App">
                <Container fluid>
                    {children}
                </Container>
            </div>
        </>
    );
};

export default Layout;
