// src/pages/DeputyDetails/DeputyDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;


const DeputyDetails = () => {
    const { id } = useParams();
    const [deputy, setDeputy] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const deputyResponse = await axios.get(`${API_BASE_URL}/deputy/${id}`);
                setDeputy(deputyResponse.data);

                const expensesResponse = await axios.get(`${API_BASE_URL}/deputy/${id}/expenses`);
                setExpenses(expensesResponse.data);
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
        <div>
            <h2>{deputy.name}</h2>
            <p>Partido: {deputy.party}</p>
            <p>UF: {deputy.uf}</p>
            <h3>Despesas</h3>
            <ul>
                {expenses.map((expense) => (
                    <li key={expense._id}>{expense.tipoDespesa}: R$ {expense.valorDocumento.toFixed(2)}</li>
                ))}
            </ul>
        </div>
    );
};

export default DeputyDetails;
