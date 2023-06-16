import React, { useEffect, useRef, useState } from 'react';
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

// const getDeputyNodeColor = (party) => {
//     const partyColors = {
//         'PT': '#FF0000',
//         'PSDB': '#0000FF',
//         'PSOL': '#F66C0D',
//         'PSB': '#00FF00',
//         'DEM': '#FFFF00',
//         'MDB': '#00FFFF',
//         'PP': '#7A3E9D',
//         'PDT': '#83258D',
//         'PL': '#4B0082',
//         'PSC': '#2E8B57',
//         'PSD': '#008080',
//         'PTB': '#483D8B',
//         'PV': '#32CD32',
//         'REPUBLICANOS': '#DC143C',
//         'SOLIDARIEDADE': '#8B4513',
//         'AVANTE': '#FFD700',
//         'CIDADANIA': '#FF4500',
//         'PATRI': '#8A2BE2',
//         'PODE': '#20B2AA',
//         'PROS': '#228B22',
//         'PRTB': '#800000',
//         'PSL': '#DAA520',
//         'PTC': '#D2691E',
//         'REDE': '#B22222',
//         'S.PART.': '#FFA07A',
//         'PCdoB': '#FF6347',
//         'PMB': '#8B008B',
//         'PMN': '#006400',
//         'PPL': '#ADFF2F',
//         'PR': '#7FFF00',
//         'PRB': '#7CFC00',
//         'PRP': '#00FA9A',
//         'PSDC': '#4682B4'
//     };

//     return partyColors[party || 'Outros'] || '#000000';
// };

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

    // const [partidosAtivos, setPartidosAtivos] = useState({});
    // const [todosPartidosDesativados, setTodosPartidosDesativados] = useState(false);


    // const partyNames = ['PT', 'PSDB', 'PSOL', 'PSB', 'DEM', 'MDB', 'PP', 'PDT', 'PL', 'PSC', /*... mais partidos*/];
    // const colorPartidos = {};

    // partyNames.forEach(party => {
    //     colorPartidos[party] = {
    //         // valorTotal: getPartyTotalExpenses(party), // função fictícia para ilustrar, você precisará de uma função real para obter o valor total das despesas de cada partido
    //         color: getDeputyNodeColor(party)
    //     }
    // });


    useEffect(() => {
        const fetchData = async () => {
            if (!submitClicked) {
                submitClicked = true;
                console.log('Fetching graph data...');
                setIsLoading(true);
                try {

                    const response = await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, {
                        ano: String(year),
                        mes: String(month),
                    });

                    console.log("Data fetched successfully");

                    const colorByDespesas = response.data.edges.reduce((acc, edge) => {
                        if (edge.attributes.label in acc) {
                            return acc;
                        } else {
                            acc[edge.attributes.label] = {
                                color: edge.attributes && edge.attributes.color,
                            };
                            return acc;
                        }
                    }, {});

                    // const colorByPartidos = response.data.nodes.reduce((acc, node) => {
                    //     if (node.attributes.deputy) {
                    //         if (node.attributes.deputy.party in acc) {
                    //             return acc;
                    //         } else {
                    //             acc[node.attributes.deputy.party] = {
                    //                 color: node.attributes && node.attributes.color,
                    //             };
                    //             return acc;
                    //         }
                    //     } else {
                    //         return acc;
                    //     }
                    // }, {});

                    response.data.nodes.forEach(node => {
                        if (node.attributes.fornecedor) {
                            // Valor total de despesas por tipo de despesa
                            colorByDespesas[node.attributes.fornecedor.tipoDespesa]['valorTotal'] = (Number(colorByDespesas[node.attributes.fornecedor.tipoDespesa]['valorTotal'] || 0) + node.attributes.payments.reduce((acc, payment) => acc + Number(payment.valorDocumento), 0)).toFixed(2);

                            // // Valor total de despesas por partido
                            // colorByPartidos[node.attributes.deputy.party]['valorTotal'] = (Number(colorByPartidos[node.attributes.deputy.party]['valorTotal'] || 0) + node.attributes.payments.reduce((acc, payment) => {
                            //     if (payment.deputy) {
                            //         let deputy = response.data.nodes
                            //     }
                            // } , 0)).toFixed(2);
                        }
                    });

                    setColorTiposDespesa(colorByDespesas);

                    setTipoDeDespesasAtivas(Object.keys(colorByDespesas).reduce((acc, tipoDespesa) => {
                        acc[tipoDespesa] = true;
                        return acc;
                    }, {}));

                    // For each edge, change type to arrow
                    response.data.edges.forEach(edge => {
                        edge.attributes.type = 'arrow';
                    });

                    const deputyNames = response.data.nodes.map(node => node.attributes.deputy ? node.attributes.label : '').filter(Boolean); // Get deputy names from nodes

                    deputyNames.unshift('Busque um Deputado'); // Add empty string to start of array

                    const fornecedorNames = response.data.nodes.map(node => node.attributes.fornecedor ? node.attributes.label : '').filter(Boolean); // Get fornecedor names from nodes

                    fornecedorNames.unshift('Busque um Fornecedor'); // Add empty string to start of array

                    setValueOptionsFornecedor(fornecedorNames); // Set state with fornecedor names

                    setValueOptionsDeputies(deputyNames);

                    setGraphData(response.data);

                    setGraphNotFound(false);
                } catch (error) {
                    setGraphNotFound(true);
                    setGraphData(null);
                } finally {
                    setIsLoading(false); // Set loading to false at end of fetch
                }
            }
        };

        if (!graphData && !isLoading) {
            fetchData();
        }
    }, [submitClicked]);

    useEffect(() => {
        if (!graphData) return;

        const graph = new DirectedGraph().import(graphData);
        const renderer = new Sigma(graph, containerRef.current);

        // renderer.setSetting("enableEdgeClickEvents", true);
        renderer.setSetting("labelRenderedSizeThreshold", 7);
        renderer.setSetting("labelFont", "Roboto");
        renderer.setSetting("labelSize", 12);
        renderer.setSetting("labelWeight", 452);
        renderer.setSetting("allowInvalidContainer", true);
        renderer.setSetting("labelColor", {
            attribute: '#000'
        });

        setSigmaRenderer(renderer);

        renderer.on('clickNode', (event) => {
            const { node } = event;

            const nodeData = graph.getNodeAttributes(node);

            const neighbors = graph.neighbors(node);
            setRendererState((state) => ({
                ...state,
                hoveredNode: node,
                hoveredNeighbors: neighbors,
            }));

            setSelectedNode(nodeData);

            console.log(nodeData);

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
        });

        renderer.on('clickEdge', (event) => {
            const { edge } = event;
            const edgeData = graph.getEdgeAttributes(edge);

            setSelectedEdge(edgeData);

            renderer.refresh();
        });

        const bindTooltip = (event) => {
            const { node, captor } = event.data;
            const tooltip = document.querySelector('.sigma-tooltip');
            tooltip.style.display = 'block';
            tooltip.style.left = captor.clientX + 'px';
            tooltip.style.top = captor.clientY + 'px';
            tooltip.innerHTML = `${node.label}<br>Color: ${node.color}`;
        };

        const hideTooltip = () => {
            const tooltip = document.querySelector('.sigma-tooltip');
            tooltip.style.display = 'none';
        };

        renderer.on('overNode', bindTooltip);
        renderer.on('outNode', hideTooltip);
        renderer.on('overEdge', bindTooltip);
        renderer.on('outEdge', hideTooltip);

        return () => {
            renderer.off('overNode', bindTooltip);
            renderer.off('outNode', hideTooltip);
            renderer.off('overEdge', bindTooltip);
            renderer.off('outEdge', hideTooltip);
            renderer.kill();
        };

    }, [graphData]);

    useEffect(() => {
        if (!sigmaRenderer) return;

        const graph = sigmaRenderer.getGraph();

        sigmaRenderer.setSetting("nodeReducer", (node, data) => {
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
        });

        sigmaRenderer.setSetting("edgeReducer", (edge, data) => {
            const res = { ...data };
            if (rendererState.hoveredNode && !graph.hasExtremity(edge, rendererState.hoveredNode) || !tipoDeDespesasAtivas[String(res.label)]) {
                res.hidden = true;
            }
            return res;
        });

        sigmaRenderer.setSetting("labelRenderedSizeThreshold", 0);

        sigmaRenderer.refresh();
    }, [rendererState]);

    // Refresh label size if no node is selected (closed card)
    useEffect(() => {
        if (sigmaRenderer && (!selectedNode && !selectedEdge)) {
            sigmaRenderer.setSetting("labelRenderedSizeThreshold", 9);
            sigmaRenderer.refresh();
        }
    }, [selectedNode, selectedEdge]);

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

    // useEffect(() => {
    //     if (!sigmaRenderer || selectedNode) return;

    //     sigmaRenderer.setSetting("nodeReducer", (node, data) => {
    //         const res = { ...data };

    //         if (partidosAtivos) {
    //             if (partidosAtivos[res.deputy && res.deputy.party]) {
    //                 res.hidden = false;
    //             } else {
    //                 res.hidden = true;
    //             }
    //         }
    //         return res;
    //     });

    //     sigmaRenderer.refresh();
    // }, [partidosAtivos, rendererState]);


    const totalDespesas = Object.values(colorTiposDespesa).reduce((acc, curr) => Number(acc || 0) + Number(curr.valorTotal || 0), 0);

    const handleSearchDeputy = () => {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();

        const nodeId = graph.nodes().find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValueDeputy.toLowerCase());

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

    const handleSearchFornecedor = () => {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();

        const nodeId = graph.nodes().find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValueFornecedor.toLowerCase());

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

    const onClose = () => {
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
                event.preventDefault();
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
                <Card className="title">As cores representam os tipos de despesas e abaixo delas o valor total para o mês selecionado -- o tamanho do nó dos deputados é constante em contraste aos das empresas beneficiárias em que o tamanho do nó é proporcional ao logaritmo na base 10 do valor total das despesas para o mês selecionado.
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

    // const togglePartido = (partido) => {
    //     setPartidosAtivos(prevPartidosAtivos => ({
    //         ...prevPartidosAtivos,
    //         [partido]: !prevPartidosAtivos[partido]
    //     }));
    // };


    // const TogglePartidoButton = React.memo(({ partido, isActive, togglePartido }) => (
    //     <Row className="justify-content-md-center">
    //         <Button size="sm" onClick={(event) => {
    //             event.preventDefault();
    //             togglePartido(partido);
    //         }} variant={isActive ? "primary" : "secondary"}>
    //             {isActive ? "Ligado" : "Desligado"}
    //         </Button>
    //     </Row>
    // ));

    // const mapPartidos = (colorPartidos, partidosAtivos) => {
    //     return Object.entries(colorPartidos)
    //         .map(([partido, corValor], index) => {
    //             return (
    //                 <Col key={index} className="legendaItem">
    //                     <div className="legendaColor" style={{ backgroundColor: partidosAtivos[partido] ? corValor.color : 'transparent' }}>
    //                         {partido}
    //                     </div>
    //                     <div className="valorInfo">
    //                         <TogglePartidoButton
    //                             partido={partido}
    //                             isActive={partidosAtivos[partido]}
    //                             togglePartido={togglePartido}
    //                         />
    //                     </div>
    //                 </Col>
    //             )
    //         })
    // }

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
            width: '90%',
            height: '2vh',
            maxWidth: '17em',
        }),
        option: (provided) => ({
            ...provided,
            fontSize: '1em',
        }),
    };


    return (
        <Container>
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
                        {/* {mapPartidos(colorPartidos, partidosAtivos)} */}
                    </Row>

                    <Row className="GraphContainer">
                        <Col className="SearchContainer">
                            <div className="GraphSearchDeputy">
                                <Select
                                    styles={customStyles}
                                    className="GraphSearch-input"
                                    value={searchValueDeputy}
                                    onChange={(selectedOption) => setSearchValueDeputy(selectedOption.value)}
                                    options={valueOptionsDeputies.map(value => ({ value, label: value }))}
                                    isSearchable
                                />
                                <button className="GraphSearch-button" onClick={handleSearchDeputy}>
                                    Buscar
                                </button>
                            </div>
                        </Col>

                        <Row ref={containerRef} className="Graph">
                        </Row>

                        <Col className="SearchContainer">
                            <div className="GraphSearchFornecedor">
                                <Select
                                    styles={customStyles}
                                    className="GraphSearch-input"
                                    value={searchValueFornecedor}
                                    onChange={(selectedOption) => setSearchValueFornecedor(selectedOption.value)}
                                    options={valueOptionsFornecedor.map(value => ({ value, label: value }))}
                                    isSearchable
                                />
                                <button className="GraphSearch-button" onClick={handleSearchFornecedor}>
                                    Buscar
                                </button>
                            </div>
                        </Col>
                    </Row>

                    {/* <Row> */}

                    <div className="GraphCardWrapper">
                        <div className="GraphCard">
                            {selectedNode && selectedNode.deputy && <NodeDetails deputy={selectedNode.deputy} onClose={onClose} />}
                            {selectedNode && selectedNode.fornecedor && <NodeDetails fornecedor={selectedNode.fornecedor} onClose={onClose} />}
                            {selectedEdge && <EdgeDetails selectedEdge={selectedEdge} />}
                        </div>
                    </div>

                    {/* </Row> */}

                </Row>
            )}
        </Container>
    );
};




export default Graph;