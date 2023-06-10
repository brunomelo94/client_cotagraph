import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import './ColorLegendDespesas.css';

const ColorLegendDespesas = ({ colorTiposDespesa }) => {
    const totalDespesas = Object.values(colorTiposDespesa).reduce((acc, curr) => Number(acc || 0) + Number(curr.valorTotal || 0), 0);

    return (
        <Container className="mt-2 mb-5 legenda">
            <Card className="title">As cores representam os tipos de despesas e o valor total para cada um.</Card>
            <Row className="legendaContainer">
                {Object.entries(colorTiposDespesa).sort((a, b) => b[1].valorTotal - a[1].valorTotal).map(([tipoDespesa, corValor], index) => {
                    const valorTotalNum = Number(corValor.valorTotal);
                    if (isNaN(valorTotalNum)) {
                        console.warn(`Valor total para tipo de despesa ${tipoDespesa} não é um número: ${corValor.valorTotal}`);
                        return null;
                    }
                    const percentual = ((Number(valorTotalNum) / Number(totalDespesas)) * 100).toFixed(2);
                    const valorTotalBr = valorTotalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    return (
                        <Col key={index} className="legendaItem">
                            <div className="legendaColor" style={{ backgroundColor: corValor.color }}>
                                {tipoDespesa}
                            </div>
                            <div className="valorInfo">
                                <Row className="total">Total: R${valorTotalBr} </Row>
                                <Row className="percentual">Percentual: {percentual}%</Row>
                            </div>
                        </Col>
                    )
                })}
            </Row>
        </Container>
    );
};

export default ColorLegendDespesas;
