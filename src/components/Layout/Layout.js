import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <>
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand as={Link} to="/" className="navbar-brand-home">home</Navbar.Brand>
            </Navbar>
            <Container fluid>
                {children}
            </Container>
            <Navbar bg="dark" variant="dark" fixed="bottom" className="navbar-footer">
                <Navbar.Text>
                </Navbar.Text>
            </Navbar>
        </>
    );
};

export default Layout;
