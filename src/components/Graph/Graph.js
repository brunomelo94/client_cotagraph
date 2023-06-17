import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Sigma } from 'sigma';
import { DirectedGraph } from 'graphology';
import NodeDetails from '../NodeDetails/NodeDetails';
import EdgeDetails from '../EdgeDetails/EdgeDetails';
import axios from 'axios';
import { Container, Card, Button, Row, Col, Alert, Image } from 'react-bootstrap';
import Select from 'react-select';

import './Graph.css';
import './Legendas.css'

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Graph = ({ year, month, submitClicked }) => {
    const containerRef = useRef();
    const [searchValueDeputy, setSearchValueDeputy] = useState('');
    const [searchValueFornecedor, setSearchValueFornecedor] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [sigmaRenderer, setSigmaRenderer] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [valueOptionsDeputies, setValueOptionsDeputies] = useState([]);
    const [valueOptionsFornecedor, setValueOptionsFornecedor] = useState([]);
    const [graphNotFound, setGraphNotFound] = useState(false);
    const [rendererState, setRendererState] = useState({
        hoveredNode: '',
        selectedNode: '',
        hoveredNeighbors: [],
    });
    const [colorTiposDespesa, setColorTiposDespesa] = useState({});
    const [tipoDeDespesasAtivas, setTipoDeDespesasAtivas] = useState({});
    const [todasDespesasDesativadas, setTodasDespesasDesativadas] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!submitClicked) {
                submitClicked = true;
                console.log('Fetching graph data...');
                setIsLoading(true);
                try {

                    const response = await fetchGraphData();
                    const processedData = processGraphData(response.data);

                    setColorTiposDespesa(processedData.colorByDespesas);
                    setTipoDeDespesasAtivas(processedData.tipoDeDespesasAtivas);
                    setValueOptionsFornecedor(processedData.fornecedorNames);
                    setValueOptionsDeputies(processedData.deputyNames);
                    setGraphData(processedData.graphData);

                    setGraphNotFound(false);
                } catch (error) {
                    setGraphNotFound(true);
                    setGraphData(null);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (!graphData && !isLoading) {
            fetchData();
        }
    }, [submitClicked]);

    async function fetchGraphData() {
        return await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, {
            ano: String(year),
            mes: String(month),
        });
    }

    function processGraphData(data) {
        const colorByDespesas = getColorByDespesas(data.edges);
        updateColorByDespesas(colorByDespesas, data.nodes);
        const tipoDeDespesasAtivas = getTipoDeDespesasAtivas(colorByDespesas);
        setEdgeTypeToArrow(data.edges);
        const deputyNames = getNames(data.nodes, 'deputy');
        const fornecedorNames = getNames(data.nodes, 'fornecedor');

        return {
            colorByDespesas,
            tipoDeDespesasAtivas,
            deputyNames,
            fornecedorNames,
            graphData: data,
        };
    }

    function getColorByDespesas(edges) {
        return edges.reduce((acc, edge) => {
            if (!(edge.attributes.label in acc)) {
                acc[edge.attributes.label] = {
                    color: edge.attributes && edge.attributes.color,
                };
            }
            return acc;
        }, {});
    }

    function updateColorByDespesas(colorByDespesas, nodes) {
        nodes.forEach(node => {
            if (node.attributes.fornecedor) {
                colorByDespesas[node.attributes.fornecedor.tipoDespesa]['valorTotal'] = (Number(colorByDespesas[node.attributes.fornecedor.tipoDespesa]['valorTotal'] || 0) + node.attributes.payments.reduce((acc, payment) => acc + Number(payment.valorDocumento), 0)).toFixed(2);
            }
        });
    }

    function getTipoDeDespesasAtivas(colorByDespesas) {
        return Object.keys(colorByDespesas).reduce((acc, tipoDespesa) => {
            acc[tipoDespesa] = true;
            return acc;
        }, {});
    }

    function setEdgeTypeToArrow(edges) {
        edges.forEach(edge => {
            edge.attributes.type = 'arrow';
        });
    }

    function getNames(nodes, attribute) {
        const names = nodes
            .map(node => node.attributes[attribute] ? node.attributes.label : '')
            .filter(Boolean);
        names.unshift(`Busque um ${attribute === 'deputy' ? 'Deputado' : 'Fornecedor'}`);
        return names;
    }

    const rendererSettings = {
        "labelRenderedSizeThreshold": 6,
        "labelFont": "Roboto",
        "labelSize": 12,
        "labelWeight": 452,
        "allowInvalidContainer": true,
        "labelColor": {
            attribute: '#000'
        }
    };

    const handleClickNode = useCallback((event, graph, renderer) => {
        const { node } = event;

        const nodeData = graph.getNodeAttributes(node);

        const neighbors = graph.neighbors(node);
        setRendererState((state) => ({
            ...state,
            hoveredNode: node,
            hoveredNeighbors: neighbors,
        }));

        setSelectedNode(nodeData);

        const nodePosition = renderer.getNodeDisplayData(nodeData.deputy ? nodeData.deputy.id : nodeData.fornecedor.cnpjCpfFornecedor);

        //Came off
        const camera = renderer.getCamera();
        camera.animate({
            x: nodePosition.x,
            y: nodePosition.y,
            ratio: 0.3678,
        }, {
            duration: 850
        });

        renderer.refresh();
    }, []);

    const handleClickEdge = useCallback((event, graph, renderer) => {
        const { edge } = event;
        const edgeData = graph.getEdgeAttributes(edge);

        setSelectedEdge(edgeData);
        renderer.refresh();
    }, []);

    const bindTooltip = (event) => {
        const { node, captor } = event.data;
        const tooltip = document.querySelector('.sigma-tooltip');
        // tooltip.style.display = 'block';
        tooltip.style.left = captor.clientX + 'px';
        tooltip.style.top = captor.clientY + 'px';
        tooltip.innerHTML = `${node.label}<br>Color: ${node.color}`;
    };

    const hideTooltip = () => {
        const tooltip = document.querySelector('.sigma-tooltip');
        tooltip.style.display = 'none';
    };

    useEffect(() => {
        if (!graphData) return;

        const graph = new DirectedGraph().import(graphData);
        const renderer = new Sigma(graph, containerRef.current);

        Object.entries(rendererSettings).forEach(([key, value]) => {
            renderer.setSetting(key, value);
        });

        setSigmaRenderer(renderer);

        const eventListeners = {
            'clickNode': (event) => handleClickNode(event, graph, renderer),
            'clickEdge': (event) => handleClickEdge(event, graph, renderer),
            'overNode': bindTooltip,
            'outNode': hideTooltip,
            'overEdge': bindTooltip,
            'outEdge': hideTooltip
        };

        Object.entries(eventListeners).forEach(([event, listener]) => {
            renderer.on(event, listener);
        });

        return () => {
            Object.entries(eventListeners).forEach(([event, listener]) => {
                renderer.off(event, listener);
            });
            renderer.kill();
        };

    }, [graphData, handleClickNode]);


    const nodeReducer = useCallback((node, data, rendererState) => {
        const res = { ...data };
        if (rendererState.hoveredNeighbors && rendererState.hoveredNeighbors.length && !rendererState.hoveredNeighbors.find((n) => n === node) && rendererState.hoveredNode !== node) {
            res.label = null;
            res.color = "#f6f6f6";
            res.labelSize = "fixed";
            res.labelWeight = 120;
        }
        if (rendererState.selectedNode === node && node) {
            res.highlighted = true;
        }

        return res;
    }, []);

    const edgeReducer = useCallback((edge, data, rendererState, graph) => {
        const res = { ...data };
        if (rendererState.hoveredNode && !graph.hasExtremity(edge, rendererState.hoveredNode) || !tipoDeDespesasAtivas[String(res.label)]) {
            res.hidden = true;
        }
        return res;
    }, []);

    useEffect(() => {
        if (!sigmaRenderer) return;

        const graph = sigmaRenderer.getGraph();

        const reducersListeners = {
            'nodeReducer': (node, data) => nodeReducer(node, data, rendererState),
            'edgeReducer': (edge, data) => edgeReducer(edge, data, rendererState, graph),
        };

        Object.entries(reducersListeners).forEach(([event, listener]) => {
            sigmaRenderer.setSetting(event, listener);
        });

        sigmaRenderer.setSetting("labelRenderedSizeThreshold", 0);

        sigmaRenderer.refresh();
    }, [rendererState]);

    // Esconder arestas que o tipo de despesa não está ativo
    useEffect(() => {
        if (!sigmaRenderer || selectedNode) return;
        // Esconder arestas que o tipo de despesa não está ativo 
        sigmaRenderer.setSetting("edgeReducer", (edge, data) => {
            const res = { ...data };

            if (tipoDeDespesasAtivas) {
                if (tipoDeDespesasAtivas[String(res.label)]) {
                    res.hidden = false;
                } else {
                    res.hidden = true;
                }
            }
            return res;
        });

        //Esconder nós que o tipo de despesa não está ativo
        sigmaRenderer.setSetting("nodeReducer", (node, data) => {
            const res = { ...data };

            if (res.fornecedor && tipoDeDespesasAtivas) {
                if (tipoDeDespesasAtivas[String(res.fornecedor.tipoDespesa)]) {
                    res.hidden = false;
                } else {
                    res.hidden = true;
                }
            }
            return res;
        });

        sigmaRenderer.refresh();
    }, [tipoDeDespesasAtivas, rendererState]);

    // Refresh label size if no node is selected (closed card)
    useEffect(() => {
        if (sigmaRenderer && (!selectedNode && !selectedEdge)) {
            sigmaRenderer.setSetting("labelRenderedSizeThreshold", 9);
            sigmaRenderer.refresh();
        }
    }, [selectedNode, selectedEdge]);


    const totalDespesas = Object.values(colorTiposDespesa).reduce((acc, curr) => Number(acc || 0) + Number(curr.valorTotal || 0), 0);

    async function handleSearchDeputy() {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();

        const nodeId = graph.nodes().find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValueDeputy.value.toLowerCase());

        if (nodeId) {
            const nodePosition = sigmaRenderer.getNodeDisplayData(nodeId);

            const camera = sigmaRenderer.getCamera();

            camera.animate({
                x: nodePosition.x,
                y: nodePosition.y,
                ratio: 0.01
            }, {
                duration: 850
            });
        } else {
            alert('Deputado não encontrado');
        }
    };

    async function handleSearchFornecedor() {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();

        const nodeId = graph.nodes().find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValueFornecedor.value.toLowerCase());

        if (nodeId) {
            const nodePosition = sigmaRenderer.getNodeDisplayData(nodeId);

            const camera = sigmaRenderer.getCamera();

            camera.animate({
                x: nodePosition.x,
                y: nodePosition.y,
                ratio: 0.01
            }, {
                duration: 850
            });
        } else {
            alert('Fornecedor não encontrado');
        }
    };

    async function onClose() {
        setRendererState((state) => ({
            ...state,
            hoveredNeighbors: [],
            hoveredNode: ''
        }));

        setSelectedNode(null);
        setSelectedEdge(null);
    };

    const ToggleDespesaButton = React.memo(({ tipoDespesa, isActive, toggleDespesa }) => (
        <Row className="justify-content-md-center">
            <Button size="sm" onClick={(event) => {
                // event.preventDefault();
                toggleDespesa(tipoDespesa);
            }} variant={isActive ? "primary" : "secondary"}>
                {isActive ? "Ligado" : "Desligado"}
            </Button>
        </Row>
    ));

    //** INIT - Legendas, controladores de legenda e de arestas e despesas **//
    const mapTiposDespesa = (colorTiposDespesa, todasDespesasDesativadas, tipoDeDespesasAtivas, totalDespesas) => {
        return Object.entries(colorTiposDespesa)
            .sort((a, b) => b[1].valorTotal - a[1].valorTotal)
            .map(([tipoDespesa, corValor], index) => {
                if (!corValor) return null;

                const valorTotalNum = Number(corValor.valorTotal);
                if (isNaN(valorTotalNum)) {
                    return null;
                }
                const percentual = ((valorTotalNum / Number(totalDespesas)) * 100).toFixed(2);
                const valorTotalBr = valorTotalNum.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

                return (
                    <Col key={index} className="legendaItem">
                        <div className="legendaColor" style={{ backgroundColor: todasDespesasDesativadas ? 'transparent' : (tipoDeDespesasAtivas[tipoDespesa] ? corValor.color : 'transparent') }}>
                            {tipoDespesa}
                        </div>
                        <div className="valorInfo">
                            <div>
                                <Row className="total">Total: R${valorTotalBr} </Row>
                                <Row className="percentual">Percentual: {percentual}%</Row>
                            </div>

                            <ToggleDespesaButton
                                tipoDespesa={tipoDespesa}
                                isActive={!todasDespesasDesativadas && tipoDeDespesasAtivas[tipoDespesa]}
                                toggleDespesa={toggleDespesa}
                            />
                        </div>
                    </Col>
                )
            })
    }

    const ColorLegendDespesas = () => {
        return (
            <Container className="mt-2 mb-5 legenda">
                <Card className="title">As cores representam os tipos de despesas e abaixo delas o valor total para o mês selecionado
                </Card>
                <DespesasButtons />
                <Row className="legendaContainer">
                    {mapTiposDespesa(colorTiposDespesa, todasDespesasDesativadas, tipoDeDespesasAtivas, totalDespesas)}
                </Row>
            </Container>
        )
    };

    const toggleDespesa = (tipoDespesa) => {
        setTipoDeDespesasAtivas(prevTipoDeDespesasAtivas => ({
            ...prevTipoDeDespesasAtivas,
            [tipoDespesa]: !prevTipoDeDespesasAtivas[tipoDespesa]
        }));
        setTodasDespesasDesativadas(false);
    };

    const DespesasButtons = () => {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Button style={{ margin: "10px" }} onClick={ativarTodos}>Ativar todas arestas (tipos de despesas)</Button>
                <Button style={{ margin: "10px" }} onClick={desativarTodos}>Desativar todas arestas (tipos de despesas)</Button>
            </div>
        )
    };

    const ativarTodos = () => {
        setTipoDeDespesasAtivas(prev => {
            const newObject = { ...prev };
            for (let key in newObject) {
                newObject[key] = true;
            }
            return newObject;
        });
        setTodasDespesasDesativadas(false);
    };

    const desativarTodos = () => {
        setTipoDeDespesasAtivas(prev => {
            const newObject = { ...prev };
            for (let key in newObject) {
                newObject[key] = false;
            }
            return newObject;
        });
        setTodasDespesasDesativadas(true);
    };

    const customStyles = {
        control: (provided) => ({
            ...provided,
            // padding: '0.2em 0.1em',
            // border: '0.1em solid #cccccc',
            borderRadius: '2em',
            fontSize: '1em',
            width: '100em',
            height: '2vh',
            maxWidth: '17em',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '1em',
        }),
    };

    return (
        <Container fluid className="GraphPage">
            {(isLoading) ? (
                <img src="..\Loading_icon.gif" alt="Loading" className="loading-gif" /> // Loading gif
            ) : graphNotFound ? (
                <Alert variant="danger">
                    <Alert.Heading>Grafo não encontrado 😢!</Alert.Heading>
                </Alert>
            ) : graphData && (
                <Row className="justify-content-md-center">

                    <Row className="justify-content-md-center">
                        <ColorLegendDespesas />
                    </Row>


                    <Row className="GraphContainer">

                        <Container>
                            <Row>
                                <Col className="SearchContainer">
                                    <Row>
                                        <Col>
                                            <Select
                                                styles={customStyles}
                                                className="GraphSearch-input"
                                                placeholder="Deputado"
                                                onChange={(selectedOption) => setSearchValueDeputy(selectedOption)}
                                                value={valueOptionsDeputies.find(option => option.value === searchValueDeputy)}
                                                options={valueOptionsDeputies.map(value => ({ value, label: value }))}
                                                isSearchable
                                            />
                                        </Col>

                                        <Col className='mt-2'>
                                            <Button className="GraphSearch-button" onClick={handleSearchDeputy}>
                                                Buscar
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>

                                <Col className="SearchContainer">
                                    <Row>
                                        <Col>
                                            <Select
                                                styles={customStyles}
                                                className="GraphSearch-input"
                                                onChange={(selectedOption) => setSearchValueFornecedor(selectedOption)}
                                                value={valueOptionsFornecedor.find(option => option.value === searchValueFornecedor)}
                                                placeholder="Fornecedor"
                                                options={valueOptionsFornecedor.map(value => ({ value, label: value }))}
                                                isSearchable
                                            />
                                        </Col>

                                        <Col className='mt-2'>
                                            <Button className="GraphSearch-button" onClick={handleSearchFornecedor}>
                                                Buscar
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Container>

                        <Row ref={containerRef} className="Graph">
                        </Row>
                    </Row>

                    <div className="GraphCardWrapper">
                        <div className="GraphCard">
                            {selectedNode && selectedNode.deputy && <NodeDetails deputy={selectedNode.deputy} onClose={onClose} />}
                            {selectedNode && selectedNode.fornecedor && <NodeDetails fornecedor={selectedNode.fornecedor} onClose={onClose} />}
                            {selectedEdge && <EdgeDetails selectedEdge={selectedEdge} />}
                        </div>
                    </div>

                </Row>
            )}
        </Container>
    );
};




export default Graph;