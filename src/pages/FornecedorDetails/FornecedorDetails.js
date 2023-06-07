import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ExpenseAnalytics from '../../components/ExpenseAnalytics/ExpenseAnalytics';
import { Container, Card, Table, Button, Row, Col, Form } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const RECORDS_PER_PAGE = 10;

const FornecedorDetails = () => {
    const [expenses, setExpenses] = useState([]);
    const [page, setPage] = useState(0);
    const { cnpjCpfFornecedor } = useParams();
    const [fornecedor, setFornecedor] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const expensesResponse = await axios.post(`${API_BASE_URL}/fornecedor/expenses`, {
                    cnpjCpfFornecedor: cnpjCpfFornecedor
                });

                // Set fornecedor to the first item in the response
                if (expensesResponse.data && expensesResponse.data.length > 0) {
                    setFornecedor(expensesResponse.data[0]);
                }

                setExpenses(expensesResponse.data);
            } catch (error) {
                console.error('Error fetching fornecedor payments data:', error);
            }
        };

        fetchData();
    }, [cnpjCpfFornecedor]);

    if (!expenses || expenses.length === 0) {
        return <Container>Carregando...</Container>;
    }

    const paginatedExpenses = expenses.slice(page * RECORDS_PER_PAGE, (page + 1) * RECORDS_PER_PAGE);

    return (
        <Container className="mt-4"><Card>
            <Card.Body>
                <Row className="justify-content-center">
                    <Col xs={12}>
                        <Row>
                            <Col>
                                <h2 className="card-title">{fornecedor.nomeFornecedor}</h2>
                                <p className="card-text">CNPJ/CPF Fornecedor: {fornecedor.cnpjCpfFornecedor}</p>
                                <p className="card-text">Tipo da despesa do fornecedor: {fornecedor.tipoDespesa}</p>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <ExpenseAnalytics data={expenses} />
                    </Col>
                </Row>

                {/* Add filter by deputy name, party, expense type with valueoptions and date range with initial and final date */}
                <Container className="mt-4">
                    {/* <Card className="mt-4"> */}
                    <Row>
                        <Col>
                            <h3>Filtros</h3>
                            <Row>
                                <Col className='mt-4'>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Nome do deputado</Form.Label>
                                        <Form.Control type="text" placeholder="Nome do deputado" />
                                    </Form.Group>
                                </Col>
                                <Col className='mt-4'>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Partido</Form.Label>
                                        <Form.Control type="text" placeholder="Partido" />
                                    </Form.Group>
                                </Col>
                                <Col className='mt-4'>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Tipo da despesa</Form.Label>
                                        <Form.Control type="text" placeholder="Tipo da despesa" />
                                    </Form.Group>
                                </Col>
                                </Row>
                            <Row>
                                <Col className='mt-4'>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Data inicial</Form.Label>
                                        <Form.Control type="date" placeholder="Data inicial" />
                                    </Form.Group>
                                </Col>
                                <Col className='mt-4'>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Data final</Form.Label>
                                        <Form.Control type="date" placeholder="Data final" />
                                    </Form.Group>
                                </Col>
                                <Col className='mt-5'>
                                    <Button variant="primary" type="submit">
                                        Filtrar
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        </Row>
                    {/* </Card> */}
                </Container>
                
                <Row className="justify-content-center mt-4">
                    <Col xs={12}>
                        <h3>Despesas</h3>
                        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Deputado</th>
                                        <th>Partido</th>
                                        <th>Tipo</th>
                                        <th>Data</th>
                                        <th>Valor</th>
                                        <th>Link Documento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedExpenses.map((expense) => (
                                        <tr key={expense._id}>
                                            <td>
                                                {expense.photo &&
                                                    <img src={expense.photo} alt={expense.deputy} width="40" height="40" />
                                                }
                                                <br></br>
                                                {expense.deputy}
                                            </td>
                                            <td>{expense.party}</td>
                                            <td>{expense.tipoDespesa}</td>
                                            <td>{new Date(expense.dataDocumento).toLocaleDateString()}</td>
                                            <td>R$ {expense.valorDocumento.toFixed(2)}</td>
                                            <td><a href={expense.urlDocumento} target="_blank" rel="noreferrer">Link</a></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                        <div className="d-flex justify-content-between mt-3">
                            <Row>
                                <Col>
                                    <p>Mostrando {page * RECORDS_PER_PAGE + 1} até {Math.min((page + 1) * RECORDS_PER_PAGE, expenses.length)} de {expenses.length} despesas</p>
                                </Col>

                                <Col>
                                    <Button variant="primary" onClick={() => setPage(prevPage => Math.max(prevPage - 1, 0))} disabled={page === 0}>Anterior</Button>
                                </Col>

                                {/* Button to go to specific page */}
                                <Col>
                                    <input type="number" className="form-control" value={page + 1} onChange={e => setPage(e.target.value - 1)} style={{ width: '100px', display: 'inline' }} /> de {Math.ceil(expenses.length / RECORDS_PER_PAGE)}
                                </Col>

                                <Col>
                                    <Button variant="primary" onClick={() => setPage(prevPage => Math.min(prevPage + 1, Math.ceil(expenses.length / RECORDS_PER_PAGE) - 1))} disabled={page >= Math.ceil(expenses.length / RECORDS_PER_PAGE) - 1}>Próximo</Button>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
        </Container>
    );
};

export default FornecedorDetails;
