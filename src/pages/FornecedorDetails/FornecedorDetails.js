// src/pages/DeputyDetails/DeputyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './FornecedorDetails.css';
import ExpenseAnalytics from '../../components/ExpenseAnalytics/ExpenseAnalytics';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const FornecedorDetails = () => {
    const [expenses, setExpenses] = useState([]);
    const { cnpjCpfFornecedor } = useParams();
    const [fornecedor, setFornecedor] = useState(null);
    // const [ deputados, setDeputados ] = useState([]);
    // Log fornecedor object to console
    console.log(cnpjCpfFornecedor);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await axios.get(`${API_BASE_URL}/deputy/${id}`);
                // console.log(cnpjCpfFornecedor);

                //Post: example:
                /*
                    POST http://localhost:5000/fornecedor/expenses
                    Content-Type: application/json

                    {
                        "cnpjCpfFornecedor": "42886333972"
                    }
                */
                const expensesResponse = await axios.post(`${API_BASE_URL}/fornecedor/expenses`, {
                    cnpjCpfFornecedor: cnpjCpfFornecedor
                });

                // Set fornecedor to the first item in the response
                if (expensesResponse.data && expensesResponse.data.length > 0) {
                    setFornecedor(expensesResponse.data[0]);
                }

                // For each expense, fetch unique deputies (once for each value) base on field 'deputy' and add it to the expense object, so we can show the deputy name in the table
                // const DEPUTIES_DICTIONARY = {};
                // for (const expense of expensesResponse.data) {
                //     if (!DEPUTIES_DICTIONARY[expense.deputy]) {
                //         const deputyResponse = await axios.get(`${API_BASE_URL}/deputy/${expense.deputy}`);
                //         DEPUTIES_DICTIONARY[expense.deputy] = deputyResponse.data;
                //     } else {
                //         console.log('Deputy already fetched:', expense.deputy);
                //     }
                // }

                setExpenses(expensesResponse.data);

                // console.log(expensesResponse.data);
            } catch (error) {
                console.error('Error fetching fornecedor payments data:', error);
            }
        };

        fetchData();
    }, [cnpjCpfFornecedor]);

    if (!expenses || expenses.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="card">
            <div className="row no-gutters">
                <div className="col-md-12">
                    <div className="card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 className="card-title">{fornecedor.nomeFornecedor}</h2>
                                <p className="card-text">CNPJ/CPF Fornecedor: {fornecedor.cnpjCpfFornecedor}</p>
                                <p className="card-text">Tipo da despesa do fornecedor: {fornecedor.tipoDespesa}</p>
                            </div>
                            <div className="analytics-container">
                                <ExpenseAnalytics data={expenses} />
                            </div>
                        </div>
                        <h3>Despesas</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Deputado</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Fornecedor</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Valor</th>
                                    <th scope="col">Link Documento</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{expense.deputy}</td>
                                        <td>{expense.tipoDespesa}</td>
                                        <td>{expense.nomeFornecedor}</td>
                                        <td>{new Date(expense.dataDocumento).toLocaleDateString()}</td>
                                        <td>R$ {expense.valorDocumento.toFixed(2)}</td>
                                        <td> <a href={expense.urlDocumento} target="_blank">Link</a></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default FornecedorDetails;
