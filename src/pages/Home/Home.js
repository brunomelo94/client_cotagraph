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

    // Array of images to be used as background 
    const images = [
        "./deputados_gpt_2.webp",
        "./deputados_gpt_3.webp",
        "./deputados_gpt_1.webp",
        // Add more images here
    ];

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

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const intervalId = setInterval(() => {
            // Transforma a nova imagem de fundo em uma nova string CSS
            const newImage = images[Math.floor(Math.random() * images.length)];
            // Adiciona um parâmetro fictício à URL da imagem
            const newBackgroundImage = `url(${newImage}?t=${Date.now()})`;
            setBackgroundImage(newBackgroundImage);
        }, 15000);

        return () => clearInterval(intervalId);
    }, []); 

    return (
        <Container className="Home">
            <div
                className="BackgroundImage"
                style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <h1 className="Home-title">cotagraph</h1>
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
            {showGraph && <Graph year={year} month={month} submitClicked={submitClicked} />}
        </Container>
    );
};

export default Home;
