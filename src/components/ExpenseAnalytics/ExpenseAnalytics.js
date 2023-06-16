import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Container, Card, Button, Row, Col, Form } from 'react-bootstrap';
import './ExpenseAnalytics.css';

const OTHERS_CATEGORY = 'Outros';

const generateColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

const ExpenseAnalytics = ({ data }) => {
    const [selectedMonth, setSelectedMonth] = useState('Todos');
    const [selectedParty, setSelectedParty] = useState('');
    const [filterBy, setFilterBy] = useState('Deputado');
    const [othersData, setOthersData] = useState(null);
    const [dataToDisplay, setDataToDisplay] = useState([]);
    const [history, setHistory] = useState([]);
    const scrollContainerRef = useRef(null);

    const scrollToMiddle = () => {
        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            const scrollWidth = scrollContainer.scrollWidth;
            const middleScrollPosition = scrollWidth / 4;
            scrollContainer.scrollTo(middleScrollPosition, 0);
        }
    };

    const aggregateData = (data, filterBy) => {
        let acc = {};
        const dictPartyByDeputy = {};

        data.forEach(current => {
            let key = filterBy === 'Partido' ? current.party : current.deputy;

            // Format of value should be ex: 100.020,50
            acc[key] = String((acc[key] || 0) + Number(current.valorDocumento));

            acc[key] = Math.round(acc[key] * 100) / 100;
            dictPartyByDeputy[current.deputy] = current.party;
        });

        let total = Object.values(acc).reduce((a, b) => a + b, 0);
        let sortedKeys = Object.keys(acc).sort((a, b) => acc[b] - acc[a]);
        let topTen = sortedKeys.slice(0, 10);
        let others = sortedKeys.slice(10).reduce((a, b) => a + acc[b], 0);

        // Verificar se a categoria 'Outros' tem elementos suficientes para ser mostrada novamente.
        if (topTen.length === 0 && others === 0) {
            return data;
        }

        let formattedData = (topTen || []).map((key, index) => ({ name: key, value: acc[key], percent: acc[key] / total, party: dictPartyByDeputy[key] }));

        if (others > 0) {
            let othersData = (sortedKeys.slice(10) || []).map((key, index) => ({ name: key, value: acc[key], percent: acc[key] / total, party: dictPartyByDeputy[key] }));
            let topTenOthers = othersData.slice(0, 10);
            let restOfOthers = othersData.slice(10).reduce((a, b) => a + b.value, 0);

            topTenOthers.push({ name: OTHERS_CATEGORY, value: restOfOthers, percent: restOfOthers / total });
            formattedData.push({ name: OTHERS_CATEGORY, value: others, percent: others / total, data: topTenOthers });
        }
        return formattedData;
    };

    // Se filtro for por deputado, limpar o filtro de partido
    useEffect(() => {
        if (filterBy === 'Deputado') {
            setSelectedParty('');
        }
    }, [filterBy]);

    useEffect(() => {
        const aggregatedData = aggregateData(
            data.filter(item => {
                let mes = ("0" + item.mes).slice(-2);
                let ano = ("0000" + item.ano).slice(-4);
                return (selectedMonth === 'Todos' || ano + '-' + mes === selectedMonth) && (!selectedParty || item.party === selectedParty);
            }),
            filterBy
        );
        setDataToDisplay(aggregatedData);
        scrollToMiddle();
    }, [data, selectedMonth, selectedParty, filterBy]);

    const onClick = (_, index) => {
        if (dataToDisplay[index].name === OTHERS_CATEGORY) {
            setOthersData(dataToDisplay[index].data);
            setHistory([...history, dataToDisplay]);
            setDataToDisplay(dataToDisplay[index].data);
        }
    }

    const resetData = () => {
        // Reset both main data and history
        setOthersData(null);
        setHistory([]);
        setDataToDisplay(aggregateData(data, filterBy));
    };

    const goBack = () => {
        // Remove the last data from history and set it as current
        if (history && history.length > 0) {
            setDataToDisplay(history[history.length - 1]);
            setHistory(history.slice(0, -1));
        }
        scrollToMiddle();
    };

    return (
        <Container className='mt-1'>
            <Row>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Form.Label style={{ fontWeight: 'bold' }}>Mês</Form.Label>
                            <Form.Control as="select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                                <option value="Todos">Todos</option>
                                {Array.from({ length: 72 }, (_, i) => {
                                    const year = 2018 + Math.floor(i / 12);
                                    const month = ("0" + (i % 12 + 1)).slice(-2);
                                    const value = `${year}-${month}`;
                                    return <option value={value} key={value}>{value}</option>
                                })}
                            </Form.Control>
                        </Card.Body>
                    </Card>
                </Col>
                <Col>
                    <Card className="mb-4">
                        <Card.Body>
                            <Form.Label style={{ fontWeight: 'bold' }}>Filtro por</Form.Label>
                            <Form.Control as="select" value={filterBy} onChange={e => setFilterBy(e.target.value)}>
                                <option value="Deputado">Deputado</option>
                                <option value="Partido">Partido</option>
                            </Form.Control>
                        </Card.Body>
                    </Card>
                </Col>
                {filterBy === 'Deputado' &&
                    <Col>
                        <Card className="mb-4">
                            <Card.Body>
                                <Form.Label style={{ fontWeight: 'bold' }}>Partido</Form.Label>
                                <Form.Control as="select" value={selectedParty} onChange={e => setSelectedParty(e.target.value)}>
                                    <option value="">Todos</option>
                                    {Array.from(new Set((data || []).map(item => item.party))).map(party =>
                                        <option value={party} key={party}>{party}</option>
                                    )}
                                </Form.Control>
                            </Card.Body>
                        </Card>

                    </Col>
                }
            </Row>
            <Row className="justify-content-center mt-1" style={{ height: '100%' }}>
                <Col>
                    {dataToDisplay && dataToDisplay.length === 0 ? (
                        <div className="alert alert-warning" role="alert">
                            Não existem dados de acordo com o filtro aplicado.
                        </div>
                    ) : (
                        <Container>
                            <Row ref={scrollContainerRef} style={{ overflowX: 'scroll' }} className='justify-content-center'>
                                <ResponsiveContainer style={{ overflowX: 'scroll' }} width={800} className='mt-0' height={400} overflowX={'scroll'}>
                                    <PieChart fontSize='70%' className='mt-4 mb-4' width={800} height={300} overflowX={'scroll'}>
                                        <Pie
                                            dataKey="value"
                                            isAnimationActive={true}
                                            data={dataToDisplay.map(item => ({ ...item, name: (item.name || item.party) + ' | R$' })) || []}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={'55%'}
                                            innerRadius={'2%'}
                                            fill="#8884d8"
                                            label={
                                                ({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            onClick={onClick}
                                        >
                                            {
                                                (dataToDisplay || []).map((entry, index) =>
                                                    <Cell key={`cell-${index}`} fill={partyColors(entry.name) || partyColors(entry.party) || generateColor()} />)
                                            }
                                        </Pie>
                                        <Tooltip formatter={(value, name) => [value, name]} />
                                        {/* <Legend iconSize={6} formatter={(value, entry) => partyColors(entry.party) || entry.party || value} /> */}
                                    </PieChart>
                                </ResponsiveContainer>

                            </Row>

                            <Row className='justify-content-center mt-2'>
                                <Col>
                                    <Card className="mb-4">
                                        <Card.Body>
                                            <Button variant="primary" onClick={resetData} className="w-100">
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
                                                className="w-100"
                                            >
                                                Voltar um nível
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Container>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

function partyColors(party) {
    return {
        'PT': '#FF0000', // Vermelho
        'PSDB': '#0000FF', // Azul
        'PMDB': '#008B8B', // Verde escuro
        'DEM': '#FFD700', // Dourado
        'PSOL': '#f78157', // Laranja escuro
        'PP': '#32CD32', // Verde lima
        'PSL': '#509de6', // Azul claro
        'PL': '#800000', // Marrom
        'PDT': '#00CED1', // Turquesa escuro
        'PSB': '#8A2BE2', // Azul violeta
        'MDB': '#D2691E', // Chocolate
        'PCdoB': '#B22222', // Vermelho tijolo
        'PODE': '#FF8C00', // Laranja escuro
        'PSD': '#4B0082', // Índigo
        'PATRIOTAS': '#7FFF00', // Verde chartreuse
        'REPUBLICANOS': '#2E8B57', // Verde mar
        'SOLIDARIEDADE': '#ADFF2F', // Verde amarelado
        'PROS': '#FF69B4', // Rosa intenso
        'PV': '#9ACD32', // Amarelo verde
        'AVANTE': '#9400D3', // Violeta escuro
        'CIDADANIA': '#DC143C', // Carmesim
        'NOVO': '#1E90FF', // Azul Dodger
        'REDE': '#00FF00', // Verde lima
        'PSC': '#FFB6C1', // Rosa claro
        'PTB': '#9370DB', // Púrpura médio
        'DC': '#00BFFF', // Azul profundo do céu
        'PCB': '#3CB371', // Verde médio do mar
        'PCO': '#800080', // Roxo
        'PMB': '#008000', // Verde
        'PMN': '#00008B', // Azul escuro
        'PRB': '#556B2F', // Verde oliva escuro
        'PRTB': '#7B68EE', // Azul ardósia médio
        'PRP': '#191970', // Azul meia-noite
        'PSTU': '#FFA500', // Laranja
        'PTC': '#20B2AA', // Verde claro do mar
        'PV': '#8B4513', // Castanho sela
        'REDE': '#483D8B', // Ardósia azul escuro
        'SDD': '#6A5ACD', // Ardósia azul
        'UP': '#A52A2A', // Castanho
        'UNIÃO': '#eded02' // Amarelo
    }[party];
}

export default ExpenseAnalytics;
