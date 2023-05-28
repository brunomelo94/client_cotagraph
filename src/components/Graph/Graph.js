import React, { useEffect, useRef, useState } from 'react';
import { Sigma } from 'sigma';
import { DirectedGraph } from 'graphology';
import './Graph.css';
import NodeDetails from '../NodeDetails/NodeDetails';
import EdgeDetails from '../EdgeDetails/EdgeDetails';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Graph = ({ year, month }) => {
    const containerRef = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [sigmaRenderer, setSigmaRenderer] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [valueOptionsDeputies, setValueOptionsDeputies] = useState([]); // New state for deputy names
    const [valueOptionsFornecedor, setValueOptionsFornecedor] = useState([]); // New state for deputy names

    const onClose = () => {
        setSelectedNode(null);
        setSelectedEdge(null);
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true at start of fetch
            try {
                const response = await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, {
                    ano: String(year),
                    mes: String(month),
                });

                console.log(response.data.nodes);
                // console.log(response.data.edges);
                // console.log(response.data.attributes);

                // throw new Error('Test error'); // TODO: remove this line

                const deputyNames = response.data.nodes.map(node => node.attributes.deputy ? node.attributes.label : '').filter(Boolean); // Get deputy names from nodes
                deputyNames.unshift('Busque um Deputado'); // Add empty string to start of array

                const fornecedorNames = response.data.nodes.map(node => node.attributes.fornecedor ? node.attributes.label : '').filter(Boolean); // Get fornecedor names from nodes
                fornecedorNames.unshift('Busque um Fornecedor'); // Add empty string to start of array

                setValueOptionsFornecedor(fornecedorNames); // Set state with fornecedor names
                setValueOptionsDeputies(deputyNames);
                setGraphData(response.data);
            } catch (error) {
                console.error('Error fetching graph data:', error);
                setGraphData(null);
            } finally {
                setIsLoading(false); // Set loading to false at end of fetch
            }
        };

        fetchData();
    }, [year, month]);

    useEffect(() => {
        if (!graphData) {
            // TODO: show loading
            return () => null;
        }

        const graph = new DirectedGraph().import(graphData);

        //Log the first node
        console.log(graph.nodes()[0]);

        const renderer = new Sigma(graph, containerRef.current);

        setSigmaRenderer(renderer);

        renderer.on('clickNode', (event) => {
            const { node } = event;
            const nodeData = graph.getNodeAttributes(node);

            console.log(nodeData);

            setSelectedNode(nodeData);

            // centrar a câmera no nó clicado e dar zoom
            // const camera = renderer.getCamera();
            // camera.animate({ x: nodeData.x, y: nodeData.y, ratio: 0.5 }, { duration: 300 });
        });

        renderer.on('clickEdge', (event) => {
            console.log('Edge clicked'); // New line
            const { edge } = event;
            const edgeData = graph.getEdgeAttributes(edge);

            console.log(edgeData);

            setSelectedEdge(edgeData);
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

    const handleSearch = () => {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();

        const nodeId = graph.nodes().find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValue.toLowerCase());

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


    return (
        <div className="GraphContainer">
            {(isLoading || !graphData) ? (
                <img src="..\Loading_icon.gif" alt="Loading" className="loading-gif" /> // Loading gif
            ) : (
                <>
                    <div ref={containerRef} className="Graph" />
                    <div className="sigma-tooltip" />
                    <div className="GraphSearch">
                        <select /* Changed from input to select */
                            className="GraphSearch-input"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        >
                                {valueOptionsDeputies.map((value, index) => (
                                    <option key={index} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <button className="GraphSearch-button" onClick={handleSearch}>
                                Buscar
                            </button>
                        </div>
                        <div className="GraphSearchFornecedor">
                            <select /* Changed from input to select */
                                className="GraphSearch-input"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            >
                                {valueOptionsFornecedor.map((value, index) => (
                                    <option key={index} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <button className="GraphSearch-button" onClick={handleSearch}>
                                Buscar
                            </button>
                        </div>
                        {selectedNode && selectedNode.deputy && <NodeDetails deputy={selectedNode.deputy} onClose={onClose} />}
                        {selectedNode && selectedNode.fornecedor && <NodeDetails fornecedor={selectedNode.fornecedor} onClose={onClose} />}
                        {selectedEdge && <EdgeDetails selectedEdge={selectedEdge} />}
                </>
            )}
        </div>
    );


};

export default Graph;