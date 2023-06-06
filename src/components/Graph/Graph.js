import React, { useEffect, useRef, useState } from 'react';
import { Sigma } from 'sigma';
import { DirectedGraph } from 'graphology';
import './Graph.css';
import NodeDetails from '../NodeDetails/NodeDetails';
import EdgeDetails from '../EdgeDetails/EdgeDetails';
import axios from 'axios';
import { Container, Card, Table, Button, Row, Col, Form, Spinner, Alert, Dropdown } from 'react-bootstrap';

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
    const [valueOptionsDeputies, setValueOptionsDeputies] = useState([]); // New state for deputy names
    const [valueOptionsFornecedor, setValueOptionsFornecedor] = useState([]); // New state for deputy names
    const [graphNotFound, setGraphNotFound] = useState(false);
    const [rendererState, setRendererState] = useState({
        hoveredNode: '',
        selectedNode: '',
        hoveredNeighbors: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!submitClicked) {
                submitClicked = true;
                console.log('Fetching graph data...');
                setIsLoading(true); // Set loading to true at start of fetch
                try {

                    const response = await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, {
                        ano: String(year),
                        mes: String(month),
                    });

                    console.log("Data fetched successfully");

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

        renderer.setSetting("labelRenderedSizeThreshold", 7.5);
        // renderer.setSetting("enableEdgeClickEvents", true);
        renderer.setSetting("labelFont", "Roboto");
        renderer.setSetting("labelSize", 12);
        renderer.setSetting("labelWeight", 452);
        renderer.setSetting("allowInvalidContainer", true);
        renderer.setSetting("labelColor", {
            attribute: '#000'
        });
        // renderer.setSetting("labelDensity", 123);
        // renderer.setSetting("labelGridCellSize", 512);

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
            renderer.refresh();
        });

        renderer.on('clickEdge', (event) => {
            console.log('Edge clicked'); // New line
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

        // Render nodes accordingly to the internal state:
        // 1. If a node is selected, it is highlighted
        // 2. If there is query, all non-matching nodes are greyed
        // 3. If there is a hovered node, all non-neighbor nodes are greyed
        sigmaRenderer.setSetting("nodeReducer", (node, data) => {
            const res = { ...data };

            // console.log(data)

            if (rendererState.hoveredNeighbors && rendererState.hoveredNeighbors.length && !rendererState.hoveredNeighbors.find((n) => n === node) && rendererState.hoveredNode !== node) {
                res.label = null;
                res.color = "#f6f6f6";
                //Display label independent of node size, in any zoom level
                res.labelSize = "fixed";
                res.labelWeight = 120;
            }

            if (rendererState.selectedNode === node && node) {
                res.highlighted = true;
            }

            return res;
        });

        // Render edges accordingly to the internal state:
        // 1. If a node is hovered, the edge is hidden if it is not connected to the node
        sigmaRenderer.setSetting("edgeReducer", (edge, data) => {
            const res = { ...data };

            if (rendererState.hoveredNode && !graph.hasExtremity(edge, rendererState.hoveredNode)) {
                res.hidden = true;
            }

            return res;
        });

        sigmaRenderer.setSetting("labelRenderedSizeThreshold", 0);

        sigmaRenderer.refresh();
    }, [rendererState]);

    useEffect(() => {
        if (sigmaRenderer && (!selectedNode && !selectedEdge)) {
            sigmaRenderer.setSetting("labelRenderedSizeThreshold", 9);
            sigmaRenderer.refresh();
        }
    }, [selectedNode, selectedEdge]);

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
                ratio: 0.005
            }, {
                duration: 500
            });
        } else {
            // Embed bootstrap alert
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
                ratio: 0.005
            }, {
                duration: 500
            });
        } else {
            // Embed bootstrap alert
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

    return (
        <Container className="GraphContainer">
            {(isLoading) ? (
                <img src="..\Loading_icon.gif" alt="Loading" className="loading-gif" /> // Loading gif
            ) : graphNotFound ? (
                <Alert variant="danger">
                    <Alert.Heading>Grafo não encontrado 😢!</Alert.Heading>
                </Alert>
            ) : (
                <>
                    <div ref={containerRef} className="Graph" />
                    <div className="sigma-tooltip" />
                            
                    <div className="GraphSearch">
                        <select
                            className="GraphSearch-input"
                            value={searchValueDeputy}
                            onChange={(e) => setSearchValueDeputy(e.target.value)}
                        >
                            {valueOptionsDeputies.map((value, index) => (
                                <option key={index} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <button className="GraphSearch-button" onClick={handleSearchDeputy}>
                            Buscar
                        </button>
                    </div>

                    <div className="GraphSearchFornecedor">
                        <select
                            className="GraphSearch-input"
                            value={searchValueFornecedor}
                            onChange={(e) => setSearchValueFornecedor(e.target.value)}
                        >
                            {valueOptionsFornecedor.map((value, index) => (
                                <option key={index} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        <button className="GraphSearch-button" onClick={handleSearchFornecedor}>
                            Buscar
                        </button>
                    </div>
                            
                    {selectedNode && selectedNode.deputy && <NodeDetails deputy={selectedNode.deputy} onClose={onClose} />}
                    {selectedNode && selectedNode.fornecedor && <NodeDetails fornecedor={selectedNode.fornecedor} onClose={onClose} />}
                    {selectedEdge && <EdgeDetails selectedEdge={selectedEdge} />}
                </>
            )}
        </Container>
    );
};


export default Graph;