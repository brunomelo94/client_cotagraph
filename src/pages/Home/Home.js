// src/pages/Home/Home.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Graph from '../../components/Graph/Graph';
import './Home.css';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Home = () => {
    const [graphData, setGraphData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch deputies and expenses separately
                const deputiesResponse = await axios.get(`${API_BASE_URL}/deputies`);
                const expensesResponse = await axios.get(`${API_BASE_URL}/expenses`);

                // Combine the received data into a structure suitable for the Graph component
                const combinedData = {
                    deputies: deputiesResponse.data,
                    expenses: expensesResponse.data,
                };

                // Update the state with the combined data
                setGraphData(combinedData);
            } catch (error) {
                console.error('Error fetching graph data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="Home">
            <h1 className="Home-title">Graph Overview</h1>
            {graphData && <Graph data={graphData} />}
        </div>
    );
};

export default Home;
