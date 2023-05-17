import React from 'react';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import './NodeDetails.css';

function NodeDetails({ selectedNode, expense }) {
    console.log(selectedNode);

    if (!selectedNode && !expense) {
        return null;
    }

    console.log(selectedNode);

    return (
        // Card components looks to big for mobile devices, should reduce text size and image size
        <div className="NodeDetailsContainer">
            {selectedNode && (
                <Card className="NodeDetails" style={{ width: '18rem' }}>
                    <Card.Img
                        className="NodeDetails-image"
                        variant="top"
                        src={selectedNode.photoUrl}
                    />
                    <Card.Body>
                        <Card.Title className="NodeDetails-title">
                            <Link to={`/deputy/${selectedNode.id}`}>{selectedNode.name}</Link>
                        </Card.Title>
                        <Card.Text>Nome: {selectedNode.name}</Card.Text>
                        <Card.Text>email: {selectedNode.email}</Card.Text>
                        <Card.Text>Estado: {selectedNode.uf}</Card.Text>
                        <Card.Text>Partido: {selectedNode.party}</Card.Text>
                    </Card.Body>
                </Card>
            )}

            {expense && (
                <Card className="ExpenseDetails" style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Title className="ExpenseDetails-title">{expense.tipoDespesa}</Card.Title>
                        <Card.Text>Nome do Fornecedor: {expense.nomeFornecedor}</Card.Text>
                        <Card.Text>CNPJ/CPF do Fornecedor: {expense.cnpjCpfFornecedor}</Card.Text>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
}

export default NodeDetails;
