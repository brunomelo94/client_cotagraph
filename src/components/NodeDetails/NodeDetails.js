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

    const { photoUrl, id, name, email, uf, party } = selectedNode || {};
    const { tipoDespesa, nomeFornecedor, cnpjCpfFornecedor } = expense || {};

    return (
        <Row className="NodeDetailsContainer">
            {selectedNode && (
                <Col xs={12} md={6}>
                    <Card className="NodeDetails">
                        <Card.Img
                            className="NodeDetails-image"
                            variant="top"
                            src={photoUrl}
                        />
                        <Card.Body>
                            <Card.Title className="NodeDetails-title">
                                <Link to={`/deputy/${id}`}>{name}</Link>
                            </Card.Title>
                            <Card.Text>Nome: {name}</Card.Text>
                            <Card.Text>email: {email}</Card.Text>
                            <Card.Text>Estado: {uf}</Card.Text>
                            <Card.Text>Partido: {party}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            )}

            {expense && (
                <Col xs={12} md={6}>
                    <Card className="ExpenseDetails">
                        <Card.Body>
                            <Card.Title className="ExpenseDetails-title">{tipoDespesa}</Card.Title>
                            <Card.Text>Nome do Fornecedor: {nomeFornecedor}</Card.Text>
                            <Card.Text>CNPJ/CPF do Fornecedor: {cnpjCpfFornecedor}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            )}
        </Row>
    );
}

export default NodeDetails;
