import React from 'react';
import Card from 'react-bootstrap/Card';
import './EdgeDetails.css';

function EdgeDetails({ selectedEdge }) {
    if (!selectedEdge) {
        return null;
    }

    console.log(selectedEdge);

    return (
        <div className="EdgeDetailsContainer">
            <Card className="EdgeDetails" style={{ width: '18rem' }}>
                <Card.Body>
                    <Card.Title className="EdgeDetails-title">Detalhes da Aresta</Card.Title>
                    <Card.Text>Source: {selectedEdge.source}</Card.Text>
                    <Card.Text>Target: {selectedEdge.target}</Card.Text>
                    <Card.Text>Expense: {selectedEdge.expense}</Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
}

export default EdgeDetails;
