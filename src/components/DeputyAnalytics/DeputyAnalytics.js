import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Container, Card, Table, Button, Row, Col, Form } from 'react-bootstrap';
import './DeputyAnalytics.css';

const OTHERS_CATEGORY = 'Outros';

// Gerando um conjunto predefinido de cores
const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#653CAD', '#AD653C', '#3CAD65', '#AD3C65', '#653CAD', '#AD653C'];

const DeputyAnalytics = ({ data }) => {
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const [history, setHistory] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('Todos');
    const [selectTipoDespesa, setSelectTipoDespesa] = useState('Todos');

    // Extração dos meses únicos do conjunto de dados
    const uniqueMonths = useMemo(() => Array.from(new Set(data.map(({ mes, ano }) => `${ano}-${String(mes).padStart(2, '0')}`))), [data]);

    const uniqueTipoDespesa = useMemo(() => Array.from(new Set(data.map(({ tipoDespesa }) => tipoDespesa))), [data]);

    const aggregateData = (data, filterBy) => {
        let acc = {};

        data.forEach(current => {
            let key = current.nomeFornecedor;
            acc[key] = Number(Number(current.valorDocumento) + Number(acc[key] || 0)).toFixed(2);
        });

        let total = Object.values(acc).reduce((a, b) => Number(a) + Number(b), 0);
        let sortedKeys = Object.keys(acc).sort((a, b) => acc[b] - acc[a]);
        let topTen = sortedKeys.slice(0, 10);
        let others = sortedKeys.slice(10).reduce((a, b) => Number(a) + Number(acc[b]), 0);

        console.log({
            total,
            sortedKeys,
            topTen,
            others
        })

        if (topTen.length === 0 && others === 0) {
            return data;
        }

        let formattedData = (topTen || []).map((key, index) => ({ name: key, value: acc[key], percent: (acc[key] / total).toFixed(2) }));

        if (others > 0) {
            let othersData = (sortedKeys.slice(10) || []).map((key, index) => ({ name: key, value: acc[key], percent: acc[key] / total }));
            let topTenOthers = othersData.slice(0, 10);
            let restOfOthers = othersData.slice(10).reduce((a, b) => a + b.value, 0);

            topTenOthers.push({ name: OTHERS_CATEGORY, value: restOfOthers, percent: restOfOthers / total });
            formattedData.push({ name: OTHERS_CATEGORY, value: others, percent: others / total, data: topTenOthers });
        }

        console.log(formattedData)

        return formattedData;
    };

    useEffect(() => {
        const aggregatedData = aggregateData(
            data.filter(item => {
                let mes = ("0" + item.mes).slice(-2);
                let ano = ("0000" + item.ano).slice(-4);
                return (selectedMonth === 'Todos' || ano + '-' + mes === selectedMonth);
            })
        );
        setDataToDisplay(aggregatedData);
    }, [data, selectedMonth]);

    useEffect(() => {
        const aggregatedData = aggregateData(
            data.filter(item => {
                return (selectTipoDespesa === 'Todos' || item.tipoDespesa === selectTipoDespesa);
            })
        );
        setDataToDisplay(aggregatedData);
    }, [data, selectTipoDespesa]);

    const onClick = (_, index) => {
        if (dataToDisplay[index].name === OTHERS_CATEGORY) {
            setHistory([...history, dataToDisplay]);
            setDataToDisplay(dataToDisplay[index].data);
        }
    }

    const resetData = () => {
        setHistory([]);
        setDataToDisplay(aggregateData(data));
    };

    const goBack = () => {
        if (history && history.length > 0) {
            setDataToDisplay(history[history.length - 1]);
            setHistory(history.slice(0, -1));
        }
    };

    console.log(dataToDisplay);

    return (
        <Container className='mt-3'>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Form>
                                <Form.Group as={Row} controlId="formMonth">
                                    <Form.Label style={{ fontWeight: 'bold' }}>Mês</Form.Label>
                                    <Col>
                                        <Form.Control as="select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                                            <option value="Todos">Todos</option>
                                            {uniqueMonths.map(month => <option key={month} value={month}>{month}</option>)}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Form>
                                <Form.Group as={Row} controlId="formTipoDespesa">
                                    <Form.Label style={{ fontWeight: 'bold' }}>Tipo de Despesa</Form.Label>
                                    <Col>
                                        <Form.Control as="select" value={selectTipoDespesa} onChange={(e) => setSelectTipoDespesa(e.target.value)}>
                                            <option value="Todos">Todos</option>
                                            {uniqueTipoDespesa.map(tipoDespesa => <option key={tipoDespesa} value={tipoDespesa}>{tipoDespesa}</option>)}
                                        </Form.Control>
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Col>
                <ResponsiveContainer className='mb-4' width="100%" height={400}>
                    <PieChart fontSize='60%'>
                        <Pie
                            data={dataToDisplay.map(item => ({ name: item.name + ' | R$', value: Number(item.value) }))}
                            dataKey="value"
                            nameKey="name"
                            cx="40%"
                            cy="40%"
                            isAnimationActive={false}
                            outerRadius={'50%'}
                            fill="#8884d8"
                            label={
                                ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            onClick={onClick}
                        >
                            {dataToDisplay.map((entry, index) => <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend iconSize={6} />
                    </PieChart>
                </ResponsiveContainer>

                <Row className='justify-content-center mt-2'>
                    <Col>
                        <Card className="mb-4">
                            <Card.Body>
                                <Button variant="primary" onClick={resetData} block>
                                    Reset do gráfico
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col>
                        <Card className="mb-4">
                            <Card.Body>
                                <Button
                                    variant="primary"
                                    onClick={goBack}
                                    disabled={history && history.length === 0}
                                    block
                                >
                                    Voltar um nível
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Col>

        </Container>
    );
};

export default DeputyAnalytics;
