import React, { useEffect, useRef, useState } from 'react';
import { Sigma } from 'sigma';
import graphology from 'graphology';
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
    const [layout, setLayout] = useState('forceAtlas2');
    const [sigmaRenderer, setSigmaRenderer] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [valueOptions, setValueOptions] = useState([]); // New state for deputy names

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true at start of fetch
            try {
                const response = await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, {
                    ano: String(year),
                    mes: String(month),
                });

                const deputyNames = response.data.nodes.map(node => node.label); // Assuming label is the deputy name
                setValueOptions(deputyNames);
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

        const graph = new graphology();

        // Add nodes and edges to the graph
        graphData.nodes.forEach((node) => {
            // If node is a expense, add ir only if it is not added yet
            node._id = node.expense ? `${node.expense.cnpjCpfFornecedor}-${node.expense.valorLiquido}` : node._id;
            graph.addNode(node._id, node);
        });

        // console.log(graph.nodes());

        graphData.edges.forEach((edge) => {
            edge.target = graph.findNode(node => {
                let hereNode = graph.getNodeAttributes(node);
                return hereNode.expense && hereNode.expense.cnpjCpfFornecedor === edge.expense.cnpjCpfFornecedor;
            });

            // console.log(edge.target);

            graph.addEdge(edge.source, edge.target, edge);
        });

        const renderer = new Sigma(graph, containerRef.current);

        setSigmaRenderer(renderer);

        renderer.on('clickNode', (event) => {
            const { node } = event;
            const nodeData = graph.getNodeAttributes(node);
            setSelectedNode(nodeData);

            // centrar a câmera no nó clicado e dar zoom
            // const camera = renderer.getCamera();
            // camera.animate({ x: nodeData.x, y: nodeData.y, ratio: 0.5 }, { duration: 300 });
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
    }, [graphData, layout]);

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
            // Embbed bootstrap alert
            alert('Deputado não encontrado');
        }
    };


    return (
        <div className="GraphContainer">
            {isLoading ? (
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
                                {valueOptions.map((value, index) => (
                                    <option key={index} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                            <button className="GraphSearch-button" onClick={handleSearch}>
                                Buscar
                            </button>
                        </div>
                        {selectedNode && selectedNode.deputy && <NodeDetails selectedNode={selectedNode.deputy} />}
                        {selectedNode && selectedNode.expense && <NodeDetails expense={selectedNode.expense} />}
                        {selectedEdge && <EdgeDetails selectedNode={selectedEdge} />}
                </>
            )}
        </div>
    );


};

export default Graph;