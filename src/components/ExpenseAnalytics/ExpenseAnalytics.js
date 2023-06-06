import { useState, useMemo, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Container, Card, Table, Button, Row, Col, Form } from 'react-bootstrap';

const OTHERS_CATEGORY = 'Outros';

const generateColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16);

const partyColors = {
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
};

const ExpenseAnalytics = ({ data }) => {
    const [selectedMonth, setSelectedMonth] = useState('Todos');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedParty, setSelectedParty] = useState('');
    const [filterBy, setFilterBy] = useState('Deputado');
    const [othersData, setOthersData] = useState(null);
    const [dataToDisplay, setDataToDisplay] = useState([]);


    const aggregateData = (data) => {
        let acc = {};
        const dictPartyByDeputy = {};

        data.forEach(current => {
            let key = filterBy === 'Partido' ? current.party : current.deputy;
            acc[key] = Number((acc[key] || 0)) + Number(current.valorDocumento);
            acc[key] = Math.round(acc[key] * 100) / 100;
            dictPartyByDeputy[current.deputy] = current.party;
        });

        let total = Object.values(acc).reduce((a, b) => a + b, 0);
        let sortedKeys = Object.keys(acc).sort((a, b) => acc[b] - acc[a]);
        let topTen = sortedKeys.slice(0, 10);
        let others = sortedKeys.slice(10).reduce((a, b) => a + acc[b], 0);

        let formattedData = topTen.map((key, index) => ({ name: key, value: acc[key], percent: acc[key] / total, party: dictPartyByDeputy[key] }));

        let othersData = sortedKeys.slice(10).map((key, index) => ({ name: key, value: acc[key], percent: acc[key] / total, party: dictPartyByDeputy[key] }));
        if (others > 0) {
            formattedData.push({ name: OTHERS_CATEGORY, value: others, percent: others / total, data: othersData });
        }

        return formattedData;
    };

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
    }, [data, selectedMonth, selectedParty, filterBy]);

    const onClick = (data, index) => {
        if (data.name === OTHERS_CATEGORY) {
            if (data.data[0] && data.data[0].name) {
                setDataToDisplay(data.data);
            } else {
                const newAggregatedData = aggregateData(data.data, filterBy);
                setOthersData(newAggregatedData);
                setDataToDisplay(newAggregatedData);
            }
        }
    };


    const resetData = () => {
        setOthersData(null);
        setDataToDisplay(aggregateData(data, filterBy));
    };

    // const dataToDisplay = othersStack.length > othersDepth ? othersStack[othersDepth] : aggregatedData;

    return (
        <Container className='mt-4'>
            <Row>
                <Col>
                    <Form.Label style={{ fontWeight: 'bold' }}>Mês</Form.Label> {/* Estilo modificado */}
                    <Form.Control as="select" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                        <option value="Todos">Todos</option> {/* Adicionado a opção "Todos" */}
                        {Array.from({ length: 72 }, (_, i) => {
                            const year = 2018 + Math.floor(i / 12);
                            const month = ("0" + (i % 12 + 1)).slice(-2);
                            const value = `${year}-${month}`;
                            return <option value={value} key={value}>{value}</option>
                        })}
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Label style={{ fontWeight: 'bold' }}>Filtro por</Form.Label> {/* Label e estilo adicionados */}
                    <Form.Control as="select" value={filterBy} onChange={e => setFilterBy(e.target.value)}>
                        <option value="Deputado">Deputado</option>
                        <option value="Partido">Partido</option>
                    </Form.Control>
                </Col>
                <Col>
                    <Form.Label style={{ fontWeight: 'bold' }}>Partido</Form.Label> {/* Estilo modificado */}
                    <Form.Control as="select" value={selectedParty} onChange={e => setSelectedParty(e.target.value)}>
                        <option value="">Todos</option>
                        {Array.from(new Set(data.map(item => item.party))).map(party =>
                            <option value={party} key={party}>{party}</option>
                        )}
                    </Form.Control>
                </Col>
            </Row>
            <Row className="justify-content-center mt-4" style={{ height: '100%' }}>
                <Col>
                    <ResponsiveContainer width={'100%'} height={400}>
                        <PieChart fontSize='50%'>
                            <Pie
                                dataKey="value"
                                isAnimationActive={true}
                                data={dataToDisplay}
                                cx="50%"
                                cy="50%"
                                outerRadius={'73%'}
                                fill="#8884d8"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                onClick={onClick}
                            >
                                {
                                    dataToDisplay.map((entry, index) =>
                                        <Cell key={`cell-${index}`} fill={partyColors[entry.name] || partyColors[entry.party] || generateColor()} />)
                                }
                            </Pie>
                            <Tooltip formatter={(value, name) => [value, name]} />
                            <Legend iconSize={3} formatter={(value, entry) => partyColors[entry.party] || entry.party || value} />
                        </PieChart>
                    </ResponsiveContainer>
                    <Button variant="primary" onClick={resetData}>
                        Reset grafico de pizza
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default ExpenseAnalytics;
