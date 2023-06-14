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
            <Image
                src={backgroundImage} fluid
                className='BackgroundImage'
            />
            <Row>
                <Container className="Home" fluid>
                    <Row className="justify-content-md-center">
                        <h1 className="Home-title">cotagraph</h1>
                        {installPromptEvent && <Button className="InstallButton" onClick={handleInstallClick}><i className="fas fa-download"></i> Instale nosso App para acompanhar de perto!</Button>}
                    </Row>
                    <Row className="justify-content-md-center mb-5">
                        <h7 className='pl-5 pr-5' style={{ color: '#a6703d' }}>
                            🙈conheça o perfil dos gastos de <b><u>seus</u></b>  deputados🙉
                        </h7>
                    </Row>
                    <Row>
                        <Form onSubmit={handleSubmit} className="Form">
                            <Row>
                                <Col md={4}>
                                    <Form.Group controlId="year">
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
                                <Col md={4}>
                                    <Form.Group controlId="month">
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
                                <Col md={4} className="d-flex align-items-end">
                                    <Button className="Form-button" type="submit">
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
