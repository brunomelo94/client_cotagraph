import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Table, Form, Button, Container, Row, Col } from 'react-bootstrap';
import './DeputyDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const ITEMS_PER_PAGE = 10;

const DeputyDetails = () => {
    const { id } = useParams();
    const [deputy, setDeputy] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [expenseOptions, setExpenseOptions] = useState({ types: [], companies: [] });
    const [currentPage, setCurrentPage] = useState(1);
    const [filters, setFilters] = useState({ tipoDespesa: '', minValor: '', maxValor: '', empresa: '', data: '' });


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

                // const expenseTypesResponse = await axios.get(`${API_BASE_URL}/api/expenses/types`);

                // console.log(expenseTypesResponse.data);

                // const expenseCompaniesResponse = await axios.get(`${API_BASE_URL}/api/expenses/companies`);

                // setExpenseOptions({ types: expenseTypesResponse.data, companies: expenseCompaniesResponse.data });

            } catch (error) {
                console.error('Error fetching deputy data:', error);
            }
        };

        fetchData();
    }, [id, filters]);

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
        <Card>
            <Card.Body>
                <Container>
                    <Row>
                        <Col md={2} className="mb-3">
                            <Card.Img variant="top" src={deputy.photoUrl} alt={deputy.name} />
                        </Col>
                        <Col md={9}>
                            <Card.Title>{deputy.name}</Card.Title>
                            <Card.Text>Partido: {deputy.party}</Card.Text>
                            <Card.Text>UF: {deputy.uf}</Card.Text>
                            <Card.Text>E-mail: <a href={`mailto:${deputy.email}`}>{deputy.email}</a></Card.Text>
                            <Card.Title>Despesas</Card.Title>
                            <Form>
                                <Row className="mb-3">
                                    <Col>
                                        <Form.Group controlId="expenseTypeFilter">
                                            <Form.Label>Tipo de Despesa</Form.Label>
                                            <Form.Control as="select" name="tipoDespesa" onChange={handleFilterChange}>
                                                <option value="">Todos</option>
                                                {expenseOptions.types.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                    <Col>
                                        <Form.Group controlId="expenseCompanyFilter">
                                            <Form.Label>Nome do Fornecedor</Form.Label>
                                            <Form.Control as="select" name="nomeFornecedor" onChange={handleFilterChange}>
                                                <option value="">Todos</option>
                                                {expenseOptions.companies.map(company => (
                                                    <option key={company} value={company}>{company}</option>
                                                ))}
                                            </Form.Control>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row className="mb-3">
                                    <Col>
                                        <Button variant="primary" type="submit">Buscar!</Button>
                                    </Col>
                                </Row>
                            </Form>
                            <div style={{ overflowY: 'scroll', maxHeight: '300px' }}> {/* Add scroll to table */}
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Fornecedor</th>
                                            <th>Data</th>
                                            <th>Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expensesOnPage.map((expense) => (
                                            <tr key={expense._id}>
                                                <td>{expense.tipoDespesa}</td>
                                                <td>{expense.nomeFornecedor}</td>
                                                <td>{new Date(expense.dataDocumento).toLocaleDateString()}</td>
                                                <td>R$ {expense.valorDocumento.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>

                                {/* <Row className="justify-content-center mt-4">
                                    <Col md="auto">
                                        <Form.Group controlId="minValueFilter">
                                            <Form.Label>Valor Mínimo</Form.Label>
                                            <Form.Control type="number" name="minValor" onChange={handleFilterChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md="auto">
                                        <Form.Group controlId="maxValueFilter">
                                            <Form.Label>Valor Máximo</Form.Label>
                                            <Form.Control type="number" name="maxValor" onChange={handleFilterChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md="auto">
                                        <Form.Group controlId="dateFilter">
                                            <Form.Label>Data</Form.Label>
                                            <Form.Control type="date" name="data" onChange={handleFilterChange} />
                                        </Form.Group>
                                    </Col>
                                </Row> */}
                                
                                {/* Implement paging //TODO */}

                                <Row className="justify-content-md-center">
                                    <Col md="auto">
                                        <Button onClick={() => handlePageChange(currentPage - 1)}>Anterior</Button>
                                    </Col>
                                    {/* On the left */}
                                    <Col md="auto" className='mt-3'>
                                        <Button onClick={() => handlePageChange(currentPage + 1)}>Próxima</Button>
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
        </Card>
    );
};

export default DeputyDetails;