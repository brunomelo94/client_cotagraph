import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './NodeDetails.css';

function NodeDetails({ deputy, fornecedor, onClose }) {
    if (!deputy && !fornecedor) {
        return null;
    }

    const { photoUrl, id, name, email, uf, party } = deputy || {};
    const { tipoDespesa, nomeFornecedor, cnpjCpfFornecedor } = fornecedor || {};

    return (
        <Row className="NodeDetailsContainer">

            {deputy && (
                <Col xs={12} md={6}>
                    <Card className="NodeDetails">
                        <Button variant="light" className="closeButton" onClick={onClose}>X</Button>
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

            {fornecedor && (
                <Col xs={12} md={6}>
                    <Card className="ExpenseDetails">
                        <Button variant="light" className="closeButton" onClick={onClose}>X</Button>
                        <Card.Body>
                            <Card.Title className="ExpenseDetails-title">
                                <Link to={`/fornecedor/${cnpjCpfFornecedor}`}>{nomeFornecedor}</Link>
                            </Card.Title>
                            <Card.Text>CNPJ/CPF do Fornecedor: {cnpjCpfFornecedor}</Card.Text>
                            <Card.Text>Tipo de despesa: {tipoDespesa}</Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            )}
        </Row>
    );
}

export default NodeDetails;
