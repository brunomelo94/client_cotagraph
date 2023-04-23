// src/pages/Home/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Graph from '../../components/Graph/Graph';
import './Home.css';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// console.log('API_BASE_URL:', API_BASE_URL);

const Home = () => {
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Buscar deputados e despesas separadamente
                const deputiesResponse = await axios.get(`${API_BASE_URL}/deputies`);
                const expensesResponse = await axios.get(`${API_BASE_URL}/expenses`);

                // Combinar os dados recebidos em uma estrutura adequada para o componente Graph
                const combinedData = {
                    deputies: deputiesResponse.data,
                    expenses: expensesResponse.data,
                };

                // console.log('Dados do grafo:', combinedData);

                // Atualizar o estado com os dados combinados
                setGraphData(combinedData);
            } catch (error) {
                console.error('Erro ao buscar dados do grafo:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="Home">
            {graphData && <Graph data={graphData} />}
        </div>
    );
};

export default Home;
