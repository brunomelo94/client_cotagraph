// src/pages/Home/Home.js
import React, { useState, useEffect } from 'react';
import Graph from '../../components/Graph/Graph';
import { Container, Card, Table, Button, Row, Col, Form, Spinner, Alert, Dropdown } from 'react-bootstrap';
import './Home.css';
import Image from 'react-bootstrap/Image';

// I need to user a context to pass the submitClicked state to the Graph component

const Home = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState('');
    const [showGraph, setShowGraph] = useState(false);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState("./deputados_gpt_1.webp");
    const [installPromptEvent, setInstallPromptEvent] = useState(null);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPromptEvent(e);
        });
    }, []);

    const handleInstallClick = async () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        setInstallPromptEvent(null);
    };

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitClicked(true);
    };

    useEffect(() => {
        setShowGraph(false);
    }, [year, month]);

    useEffect(() => {
        if (submitClicked) {
            setShowGraph(true);
            setSubmitClicked(false);
        }
    }, [submitClicked]);

    return (
        <Container>
            <Row>
                <Container className="Home" fluid>
                    <Row className="justify-content-md-center">
                        <h1 className="Home-title">cotagraph</h1>
                        {installPromptEvent && <Button className="InstallButton" onClick={handleInstallClick}><i className="fas fa-download"></i> Instale nosso App para acompanhar de perto!</Button>}
                    </Row>
                    <Row className="justify-content-md-center mb-5">
                        <h4 className='pl-4 pr-4' style={{ color: '#000094', fontWeight: 'bold' }}>
                            Conheça o perfil de gastos dos &nbsp;
                            <span style={{ color: '#ff0421', fontSize: '1.1em' }}>
                                <u>seus</u>
                            </span>
                            &nbsp; deputados!
                        </h4>
                    </Row>
                    <Row className="justify-content-md-center">
                        <Form onSubmit={handleSubmit} className="Form">
                            <Row>
                                <Col>
                                    <Form.Group controlId="year" className="custom-form-group">
                                        <Form.Label>Selecione o Ano</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={year}
                                            onChange={(e) => setYear(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecione um ano...</option>
                                            {[2018, 2019, 2020, 2021, 2022, 2023].map((year, index) =>
                                                <option key={index} value={year}>{year}</option>
                                            )}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group controlId="month" className="custom-form-group">
                                        <Form.Label>Selecione o Mês</Form.Label>
                                        <Form.Control
                                            as="select"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            required
                                        >
                                            <option value="">Escolha um mês...</option>
                                            {months.map((month, index) =>
                                                <option key={index} value={index + 1}>{month}</option>
                                            )}
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="justify-content-md-center">
                                <Col>
                                    <Button type="submit" className='mt-3' variant="primary" block>
                                        Visualizar Gastos!
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Row>
                </Container>
            </Row>
            <Row>
                {showGraph && <Graph year={year} month={month} submitClicked={submitClicked} />}
            </Row>
        </Container>
    );
};

export default Home;
