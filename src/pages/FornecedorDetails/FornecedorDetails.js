import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ExpenseAnalytics from '../../components/ExpenseAnalytics/ExpenseAnalytics';
import { Container, Card, Table, Button, Row, Col, Form } from 'react-bootstrap';
import './FornecedorDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;
const RECORDS_PER_PAGE = 10;

const FornecedorDetails = () => {
    const [expenses, setExpenses] = useState([]);
    const [mutatedExpenses, setMutatedExpenses] = useState([]); // Used to filter expenses
    const [page, setPage] = useState(0);
    const { cnpjCpfFornecedor } = useParams();
    const [fornecedor, setFornecedor] = useState(null);
    const [deputadoFiltro, setDeputadoFiltro] = useState('Todos');
    const [partidoFiltro, setPartidoFiltro] = useState('Todos');
    const [dataInicialFiltro, setDataInicialFiltro] = useState('');
    const [dataFinalFiltro, setDataFinalFiltro] = useState('');
    // Value options partidos
    const [partidos, setPartidos] = useState([]);
    // Value options deputados
    const [deputados, setDeputados] = useState([]);

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

                setPartidos(expensesResponse.data.map((expense) => expense.party).filter((value, index, self) => self.indexOf(value) === index));

                setDeputados(expensesResponse.data.map((expense) => expense.deputy).filter((value, index, self) => self.indexOf(value) === index));
            } catch (error) {
                console.error('Error fetching fornecedor payments data:', error);
            }
        };

        fetchData();
    }, [cnpjCpfFornecedor]);

    useEffect(() => {
        if (!expenses) return;
        
        const filteredExpenses = expenses.filter((expense) => {
            if (deputadoFiltro !== 'Todos' && expense.deputy !== deputadoFiltro) {
                    return false;
                }

                if (partidoFiltro !== 'Todos' && expense.party !== partidoFiltro) {
                    return false;
                }

                if (dataInicialFiltro && expense.dataDocumento < dataInicialFiltro) {
                    return false;
                }

                if (dataFinalFiltro && expense.dataDocumento > dataFinalFiltro) {
                    return false;
                }

                return true;
            }
        );

        setMutatedExpenses(filteredExpenses);
    }, [deputadoFiltro, partidoFiltro, dataInicialFiltro, dataFinalFiltro]);

    console.log(mutatedExpenses)

    if (!expenses || expenses.length === 0) {
        return <Container>Carregando...</Container>;
    }

    const paginatedExpenses = mutatedExpenses.slice(page * RECORDS_PER_PAGE, (page + 1) * RECORDS_PER_PAGE);

    return (
        <Container className="mt-4">
            <Card>
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

                    <hr />

                    <Row>
                        <Card.Title className="justify-content-center mb-3">Analytics: </Card.Title>
                        <Col>
                            <ExpenseAnalytics data={expenses} />
                        </Col>
                    </Row>

                    <br />
                    <hr />

                    <Row className="justify-content-center mt-1">
                        <Col xs={12}>
                            <Card.Title className="justify-content-center mb-3">Despesas: </Card.Title>
                            <Row>
                                <Col>
                                    <Row>
                                        <Col className='mt-3'>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Form.Group controlId="formBasicEmail">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Nome do deputado</Form.Label>
                                                        <Form.Control as="select" onChange={(e) => setDeputadoFiltro(e.target.value)}>
                                                            <option>Todos</option>
                                                            {deputados.map((deputado) => (
                                                                <option>{deputado}</option>
                                                            ))}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col className='mt-3'>
                                            <Card className="mb-4">
                                                <Card.Body>
                                                    <Form.Group controlId="formBasicEmail">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Partido</Form.Label>
                                                        <Form.Control as="select" onChange={(e) => setPartidoFiltro(e.target.value)}>
                                                            <option>Todos</option>
                                                            {partidos.map((partido) => (
                                                                <option>{partido}</option>
                                                            ))}
                                                        </Form.Control>
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                    <Row className='mt-1'>
                                        <Col className='mt-1'>
                                            <Card className="mb-1">
                                                <Card.Body>
                                                    <Form.Group controlId="formBasicEmail">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Data inicial</Form.Label>
                                                        <Form.Control type="date" placeholder="Data inicial" onChange={(e) => setDataInicialFiltro(e.target.value)} />
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col className='mt-1'>
                                            <Card className="mb-1">
                                                <Card.Body>
                                                    <Form.Group controlId="formBasicEmail">
                                                        <Form.Label style={{ fontWeight: 'bold' }}>Data final</Form.Label>
                                                        <Form.Control type="date" placeholder="Data final" onChange={(e) => setDataFinalFiltro(e.target.value)} />
                                                    </Form.Group>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>

                            <br />

                            <Container style={{ maxHeight: '60vh', overflow: 'auto' }}>
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
                            </Container>

                            <Row className="justify-content-md-center mt-3">
                                <Col>
                                    <Button variant="primary" onClick={() => setPage(prevPage => Math.max(prevPage - 1, 0))} disabled={page === 0}>Anterior</Button>
                                </Col>
                                <Col>
                                    <Button variant="primary" onClick={() => setPage(prevPage => Math.min(prevPage + 1, Math.ceil(mutatedExpenses.length / RECORDS_PER_PAGE) - 1))} disabled={page >= Math.ceil(mutatedExpenses.length / RECORDS_PER_PAGE) - 1}>Próximo</Button>
                                </Col>
                            </Row>

                            <Row className="justify-content-md-center mt-3">
                                <Col>
                                    <p>Mostrando {page * RECORDS_PER_PAGE + 1} até {Math.min((page + 1) * RECORDS_PER_PAGE, mutatedExpenses.length)} de {mutatedExpenses.length} despesas</p>
                                </Col>

                                <Col>
                                    <input type="number" className="form-control" value={page + 1} onChange={e => setPage(e.target.value - 1)} style={{ width: '100px', display: 'inline' }} /> de {Math.ceil(mutatedExpenses.length / RECORDS_PER_PAGE)} despesas
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default FornecedorDetails;
