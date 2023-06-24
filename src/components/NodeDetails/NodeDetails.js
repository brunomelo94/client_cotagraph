import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import './NodeDetails.css';

function NodeDetails({ deputy, fornecedor, onClose, indexToTipoDeDespesa }) {
    if (!deputy && !fornecedor) {
        return null;
    }

    const { photoUrl, id, name, email, uf, party } = deputy || {};
    const { nomeFornecedor, cnpjCpfFornecedor } = fornecedor || {};

    return (
        <Row className="NodeDetailsContainer">
            {(deputy || fornecedor) && (
                <Col className="GraphCardWrapper">
                    <Card className="NodeDetails">
                        <Button variant="light" className="closeButton" onClick={onClose}>X</Button>
                        {deputy ? (
                            <>
                                <Card.Img
                                    className="NodeDetails-image"
                                    src={photoUrl}
                                />
                                <Card.Body className='NodeDetails-body'>
                                    <Card.Title className="NodeDetails-title">
                                        <Link to={`/deputy/${id}`}>{name}</Link>
                                    </Card.Title>
                                    <Card.Text>Nome: {name}</Card.Text>
                                    <Card.Text>email: {email}</Card.Text>
                                    <Card.Text>Estado: {uf}</Card.Text>
                                    <Card.Text>Partido: {party}</Card.Text>
                                </Card.Body>
                            </>
                        ) : (
                            <Card.Body className='NodeDetails-body'>
                                <Card.Title className="NodeDetails-title">
                                    <Link to={`/fornecedor/${cnpjCpfFornecedor}`}>{nomeFornecedor}</Link>
                                </Card.Title>
                                <Card.Text>CNPJ/CPF do Fornecedor: {cnpjCpfFornecedor}</Card.Text>
                                <Card.Text>Tipo de despesa: {indexToTipoDeDespesa[fornecedor && fornecedor.tipoDespesa]}</Card.Text>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            )}
        </Row>
    );
}

export default NodeDetails;
