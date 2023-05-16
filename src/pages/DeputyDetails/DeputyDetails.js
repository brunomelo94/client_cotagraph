// src/pages/DeputyDetails/DeputyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './DeputyDetails.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;


const DeputyDetails = () => {
    const { id } = useParams();
    const [deputy, setDeputy] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log(`${API_BASE_URL}/api/deputy/${id}`);

                const deputyResponse = await axios.get(`${API_BASE_URL}/api/deputy/${id}`);
                setDeputy(deputyResponse.data[0]);
                console.log(deputyResponse.data);

                const expensesResponse = await axios.get(`${API_BASE_URL}/api/deputy/${id}/expenses`);
                setExpenses(expensesResponse.data);
                console.log(expensesResponse.data);
            } catch (error) {
                console.error('Error fetching deputy data:', error);
            }
        };

        fetchData();
    }, [id]);

    if (!deputy) {
        return <div>Loading...</div>;
    } 

    return (
        <div className="card">
            <div className="row no-gutters">
                <div className="col-md-2">
                    <img src={deputy.photoUrl} className="card-img" alt={deputy.name} />
                </div>
                <div className="col-md-9">
                    <div className="card-body">
                        <h2 className="card-title">{deputy.name}</h2>
                        <p className="card-text">Partido: {deputy.party}</p>
                        <p className="card-text">UF: {deputy.uf}</p>
                        <a href={`mailto:${deputy.email}`} className="card-text">E-mail: {deputy.email}</a>
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

export default DeputyDetails;
