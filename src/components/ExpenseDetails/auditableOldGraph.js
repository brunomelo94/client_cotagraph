import React, { useEffect, useRef, useState } from 'react';
import { Sigma } from 'sigma';
import graphology from 'graphology';
import './Graph.css';
import NodeDetails from '../NodeDetails/NodeDetails';
import ExpenseDetails from '../ExpenseDetails/ExpenseDetails'; // New component
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
    const [selectedExpense, setSelectedExpense] = useState(null); // New state for selected expense

    useEffect(() => {
        setValueOptions([]);
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
            return () => { }
        }

        const graph = new graphology();

        // Add nodes and edges to the graph
        graphData.nodes.forEach((node) => {
            if (node.type === 'expense') {
                // Create a unique id for the expense
                node._id = `${node.deputyName}-${node.expenseAmount}`;
            }
            // Only add the node if it doesn't already exist in the graph
            if (!graph.hasNode(node._id)) {
                graph.addNode(node._id, node);
            }
        });

        graphData.edges.forEach((edge) => {
            graph.addEdge(edge.source, edge.target, edge);
        });

        const renderer = new Sigma(graph, containerRef.current);

        setSigmaRenderer(renderer);

        renderer.on('clickNode', (event) => {
            const { node } = event;
            const nodeData = graph.getNodeAttributes(node);
            if (nodeData.type === 'deputy') { // Assuming type property in nodeData
                setSelectedNode(nodeData);
                setSelectedExpense(null); // Clear selected expense
            } else if (nodeData.type === 'expense') {
                setSelectedExpense(nodeData);
                setSelectedNode(null); // Clear selected deputy

                // Move related deputy nodes closer
                const edges = graph.edges(node);
                edges.forEach(edge => {
                    const otherNode = graph.opposite(node, edge);
                    const otherNodeData = sigmaRenderer.getNodeDisplayData(otherNode);
                    const camera = sigmaRenderer.getCamera();
                    camera.animate({
                        x: otherNodeData.x,
                        y: otherNodeData.y,
                        ratio: 0.005
                    }, {
                        duration: 500
                    });
                });
            }
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
            {isLoading && <img src="loading.gif" alt="Loading" />} {/* Loading gif */}
            <div ref={containerRef} className="Graph" />
            <div className="sigma-tooltip" />
            <div className="GraphSearch">
                <select /* Changed from input to select */
                    className="GraphSearch-input"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                >
                    {valueOptions.map((value) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </select>
                <button className="GraphSearch-button" onClick={handleSearch}>
                    Buscar
                </button>
            </div>
            {selectedNode && <NodeDetails selectedNode={selectedNode} />}
            {selectedExpense && <ExpenseDetails selectedExpense={selectedExpense} />} {/* Display ExpenseDetails */}
            {/* {selectedEdge && <EdgeDetails selectedNode={selectedEdge} />} */}
        </div>
    );
};

export default Graph;