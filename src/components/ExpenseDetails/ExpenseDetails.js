import React from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import './ExpenseDetails.css';

const ExpenseDetails = ({ selectedExpense }) => {
    return (
        // Card components looks to big for mobile devices, should reduce text size and image size
        <div className="NodeDetailsContainer">
            <Card className="NodeDetails" style={{ width: '18rem' }}>
                <Card.Img
                    className="NodeDetails-image"
                    variant="top"
                    src={selectedExpense.photoUrl}
                />
                <Card.Body>
                    <Card.Title className="NodeDetails-title">
                        Card
                    </Card.Title>
                    <Card.Text>Nome: {selectedExpense.name}</Card.Text>
                    <Card.Text>email: {selectedExpense.email}</Card.Text>
                    <Card.Text>Estado: {selectedExpense.uf}</Card.Text>
                    <Card.Text>Partido: {selectedExpense.party}</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ExpenseDetails;
