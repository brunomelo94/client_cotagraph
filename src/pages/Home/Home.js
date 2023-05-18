// src/pages/Home/Home.js
import React, { useState } from 'react';
import Graph from '../../components/Graph/Graph';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import './Home.css';

const Home = () => {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState('');
    const [showGraph, setShowGraph] = useState(false);

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        if (year < 2018 || year > currentYear || month === '') {
            alert("Por favor, insira um ano maior ou igual a 2018 e selecione um mês.");
            return;
        }

        setShowGraph(true);
    };

    return (
        <Container className="Home">
            <h1 className="Home-title">cotagraph</h1>
            <Form onSubmit={handleSubmit} className="Form">
                <Row>
                    <Col md={4}>
                        <Form.Group controlId="year">
                            <Form.Label>Ano</Form.Label>
                            <Form.Control
                                type="number"
                                min="1900"
                                max={currentYear}
                                step="1"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="Ano"
                                required
                            />
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
                                <option value="">Selecione um mês...</option>
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
            {showGraph && <Graph year={year} month={month} />}
        </Container>
    );
};

export default Home;
