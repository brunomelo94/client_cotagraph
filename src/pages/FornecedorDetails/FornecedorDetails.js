// src/pages/DeputyDetails/DeputyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './FornecedorDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const FornecedorDetails = () => {
    const [expenses, setExpenses] = useState([]);
    const { cnpjCpfFornecedor } = useParams();
    const [fornecedor, setFornecedor] = useState(null);
    // Log fornecedor object to console
    console.log(cnpjCpfFornecedor);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // const response = await axios.get(`${API_BASE_URL}/deputy/${id}`);
                console.log(cnpjCpfFornecedor);

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

                // console.log(response.data);
                console.log(expensesResponse);

                setExpenses(expensesResponse.data);
                console.log(expensesResponse.data);
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
                <div className="col-md-9">
                    <div className="card-body">
                        <h2 className="card-title">{fornecedor.nomeFornecedor}</h2>
                        <p className="card-text">CNPJ/CPF Fornecedor: {fornecedor.cnpjCpfFornecedor}</p>
                        <p className="card-text">Tipo da despesa do fornecedor: {fornecedor.tipoDespesa}</p>
                        <h3>Despesas</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Fornecedor</th>
                                    <th scope="col">Data</th>
                                    <th scope="col">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((expense) => (
                                    <tr key={expense._id}>
                                        <td>{expense.tipoDespesa}</td>
                                        <td>{expense.nomeFornecedor}</td>
                                        <td>{new Date(expense.dataDocumento).toLocaleDateString()}</td>
                                        <td>R$ {expense.valorDocumento.toFixed(2)}</td>
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
