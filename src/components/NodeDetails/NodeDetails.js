import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import './NodeDetails.css';

function NodeDetails({ selectedNode, expense }) {
    if (!selectedNode && !expense) {
        return null;
    }

    return (
        <Row className="NodeDetailsContainer">
            {selectedNode && (
                <Col xs={12} md={6}>
                    <Card className="NodeDetails">
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
                </Col>
            )}

            {expense && (
                <Col xs={12} md={6}>
                    <Card className="ExpenseDetails">
                        <Card.Body>
                            <Card.Title className="ExpenseDetails-title">{expense.tipoDespesa}</Card.Title>
                            <Card.Text>Nome do Fornecedor: {expense.nomeFornecedor}</Card.Text>
                            <Card.Text>CNPJ/CPF do Fornecedor: {expense.cnpjCpfFornecedor}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            )}
        </Row>
    );
}

export default NodeDetails;
