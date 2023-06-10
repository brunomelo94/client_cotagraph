// src/pages/Home/Home.js
import React, { useState, useEffect } from 'react';
import Graph from '../../components/Graph/Graph';
import { Container, Card, Table, Button, Row, Col, Form, Spinner, Alert, Dropdown } from 'react-bootstrap';
import './Home.css';

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
        console.log('User action was: ', outcome);
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
        <Container>      <div
            className="BackgroundImage"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        />
            <Container className="Home">
                <Row className="justify-content-md-center">
                    <h1 className="Home-title">cotagraph</h1>
                    {installPromptEvent && <Button onClick={handleInstallClick}>Instalar Aplicativo</Button>}
                </Row>
                <Row>
                    <Form onSubmit={handleSubmit} className="Form">
                        <Row>
                            <Col md={4}>
                                <Form.Group controlId="year">
                                    <Form.Label>Ano</Form.Label>
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
                            <Col md={4}>
                                <Form.Group controlId="month">
                                    <Form.Label>Mês</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={month}
                                        onChange={(e) => setMonth(e.target.value)}
                                        required
                                    >
                                        <option value="">Um mês...</option>
                                        {months.map((month, index) =>
                                            <option key={index} value={index + 1}>{month}</option>
                                        )}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-end">
                                <Button className="Form-button" type="submit">
                                    Obter grafo!
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Row>
                {/* <Row> */}
                    {showGraph && <Graph year={year} month={month} submitClicked={submitClicked} />}
                {/* </Row> */}
            </Container>
        </Container>

    );
};

export default Home;
