import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Form, Button, Container, Row, Col } from 'react-bootstrap';
import DeputyAnalytics from '../../components/DeputyAnalytics/DeputyAnalytics';
import './DeputyDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const ITEMS_PER_PAGE = 10;

const DeputyDetails = () => {
    const { id } = useParams();
    const [deputy, setDeputy] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ tipoDespesa: '', minValor: '', maxValor: '', empresa: '', data: '' });
    const [tipoDespesas, setTipoDespesas] = useState([]);
    const [empresas, setEmpresas] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const deputyResponse = await axios.get(`${API_BASE_URL}/api/deputy/${id}`);

                setDeputy(deputyResponse.data[0]);

                const expensesResponse = await axios.get(`${API_BASE_URL}/api/deputy/${id}/expenses`, {
                    params: {
                        ...filters,
                    }
                });

                setExpenses(expensesResponse.data);
            } catch (error) {
                console.error('Error fetching deputy data:', error);
            }
        };

        fetchData();
    }, [id, filters]);

    //Effect to setEmpresa and setTipoDespesa
    useEffect(() => {
        if (!empresas || empresas.length < 1) {
            setEmpresas(expenses.reduce((acc, curr) => {
                if (!acc.includes(curr.nomeFornecedor)) {
                    acc.push(curr.nomeFornecedor);
                }
                return acc;
            }, []));
        }

        if (!tipoDespesas || tipoDespesas.length < 1) {
            setTipoDespesas(expenses.reduce((acc, curr) => {
                if (!acc.includes(curr.tipoDespesa)) {
                    acc.push(curr.tipoDespesa);
                }
                return acc;
            }, []));
        }
    }, [id, expenses]);

    if (!deputy) {
        return <div>Loading...</div>;
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > Math.ceil(expenses.length / ITEMS_PER_PAGE)) return;
        setCurrentPage(newPage);
    }

    const expensesOnPage = expenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <Container className="mt-4">
            <Card>
                <Card.Body>
                    <Container>
                        <Row>
                            <Col className="text-center mb-4 mt-4 mb-md-0 mt-md-0">
                                <Card.Img src={deputy.photoUrl} alt={deputy.name} />
                            </Col>
                            <Col md={9}>
                                <Card.Title>{deputy.name}</Card.Title>
                                <Card.Text>Partido: {deputy.party}</Card.Text>
                                <Card.Text>UF: {deputy.uf}</Card.Text>
                                <Card.Text>E-mail: <a href={`mailto:${deputy.email}`}>{deputy.email}</a></Card.Text>
                            </Col>
                        </Row>
                        <hr />
                        <Row>
                            <Card.Title className="justify-content-center mb-1">Analytics: </Card.Title>
                            <Col>
                                <DeputyAnalytics data={expenses} />
                            </Col>
                        </Row>
                        <br />
                        <hr />
                        <br />
                        <Row className="justify-content-center mb-3">
                            <br />
                            <Col>

                                <Card.Title className="justify-content-center mb-3">Despesas: </Card.Title>
                                <Form>
                                    <Row className="mb-3">
                                        <Col>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Form.Group controlId="expenseTypeFilter">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Tipo de Despesa</Form.Label>
                                                        <Form.Control as="select" name="tipoDespesa" onChange={handleFilterChange}>
                                                            <option value="">Todos</option>
                                                            {tipoDespesas.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))
                                                            }
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Form.Group controlId="expenseCompanyFilter">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Nome do Fornecedor</Form.Label>
                                                        <Form.Control as="select" name="nomeFornecedor" onChange={handleFilterChange}>
                                                            <option value="">Todos</option>
                                                            {empresas.map(company => (
                                                                <option key={company} value={company}>{company}</option>
                                                            ))
                                                            }
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Form>
                                <Container style={{ overflowY: 'scroll', maxHeight: '300px' }}>
                                    <Table striped bordered hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Fornecedor</th>
                                                <th>Data</th>
                                                <th>Valor</th>
                                                <th>Link Documento</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expensesOnPage.map((expense) => (
                                                <tr key={expense._id}>
                                                    <td>{expense.tipoDespesa}</td>
                                                    <td>{expense.nomeFornecedor}</td>
                                                    <td>{new Date(expense.dataDocumento).toLocaleDateString()}</td>
                                                    <td>R$ {expense.valorDocumento.toFixed(2)}</td>
                                                    <td><a href={expense.urlDocumento} target="_blank" rel="noreferrer">Link</a></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Container>

                                <Row className="justify-content-md-center mt-3">
                                    <Col>
                                        <Button onClick={() => handlePageChange(currentPage - 1)}>Anterior</Button>
                                    </Col>
                                    <Col>
                                        <Button onClick={() => handlePageChange(currentPage + 1)}>Próxima</Button>
                                    </Col>
                                </Row>

                                <Row className="justify-content-md-center mt-3">
                                    <Col>
                                        <Row>
                                            <Col>
                                                {/* Mostrando 10 de 100 despesas ex */}
                                                Mostrando {expensesOnPage.length + ((currentPage - 1) * ITEMS_PER_PAGE)} de {expenses.length} despesas
                                            </Col>
                                            <Col>
                                                <input type="number" className="form-control" value={currentPage} onChange={(e) => handlePageChange(parseInt(e.target.value))} /> de {Math.ceil(expenses.length / ITEMS_PER_PAGE)} despesas
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                    </Container>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default DeputyDetails;