import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ExpenseAnalytics from '../../components/ExpenseAnalytics/ExpenseAnalytics';
import { Container, Card, Table, Button, Row, Col } from 'react-bootstrap';

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
                <Row className="justify-content-center mt-4">
                    <Col xs={12}>
                        <h3>Despesas</h3>
                        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                            <Table striped bordered hover>
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
                                                    <img src={expense.photo} alt={expense.deputy} width="50" height="50" />
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
                            <Button variant="primary" onClick={() => setPage(prevPage => Math.max(prevPage - 1, 0))} disabled={page === 0}>Anterior</Button>
                            <Button variant="primary" onClick={() => setPage(prevPage => Math.min(prevPage + 1, Math.ceil(expenses.length / RECORDS_PER_PAGE) - 1))} disabled={page >= Math.ceil(expenses.length / RECORDS_PER_PAGE) - 1}>Próximo</Button>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
        </Container>
    );
};

export default FornecedorDetails;
