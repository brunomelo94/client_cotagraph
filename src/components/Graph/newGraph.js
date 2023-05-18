import React, { useEffect, useRef, useState } from 'react';
import { Sigma, ForceAtlas2, NOverlap } from 'react-sigma-v2';
import graphology from 'graphology';
import './Graph.css';
import { Card } from 'react-bootstrap';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Graph = ({ year, month }) => {
    const sigmaRef = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [sigmaComponent, setSigmaComponent] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.post(`${API_BASE_URL}/graphAPI/getGraph`, { ano: String(year), mes: String(month) });
                const data = response.data;
                processData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [year, month]);

    const processData = (data) => {
        const graph = new graphology(data);

        setSigmaComponent(
            <Sigma
                ref={sigmaRef}
                graph={graph}
                settings={{
                    drawEdges: true,
                    drawEdgeLabels: false,
                    drawLabels: true,
                    enableEdgeHovering: true,
                    edgeHoverPrecision: 5,
                    defaultEdgeType: 'arrow',
                    defaultEdgeColor: '#000',
                    defaultNodeColor: '#000',
                    defaultLabelColor: '#000',
                    edgeColor: 'default',
                    zIndex: true,
                }}
                onClickEdge={(event) => {
                    const { edge } = event;
                    const edgeData = graph.getEdgeAttributes(edge);
                    console.log(edgeData);
                    setSelectedEdge(edgeData.expense);
                }}
                onClickNode={(event) => {
                    const { node } = event;
                    const nodeData = graph.getNodeAttributes(node);
                    setSelectedNode(nodeData.deputy);
                }}
            >
                <ForceAtlas2 />
                <NOverlap />
            </Sigma>
        );
    };

    const handleSearch = () => {
        if (!sigmaRef.current) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRef.current.getGraph();
        const nodeId = graph
            .nodes()
            .find(
                (id) =>
                    graph.getNodeAttributes(id).label.toLowerCase() ===
                    searchValue.toLowerCase()
            );

        if (nodeId) {
            const nodePosition = sigmaRef.current.getNodeDisplayData(nodeId);

            const camera = sigmaRef.current.getCamera();

            camera.animate(nodePosition, {
                duration: 500,
            });
        } else {
            alert('Deputado não encontrado');
        }
    };

    return (
        <div className="GraphContainer">
            <div className="sigma-tooltip" />
            <div className="GraphSearch">
                <input
                    className="GraphSearch-input"
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite o nome do deputado"
                />
                <button className="GraphSearch-button" onClick={handleSearch}>
                    Buscar
                </button>
            </div>
            {selectedNode && (
                <div className="NodeDetailsContainer">
                    <Card className="NodeDetails">
                        <Card.Img
                            className="NodeDetails-image"
                            variant="top"
                            src={selectedNode.photoUrl}
                        />
                        <Card.Body>
                            <Card.Title>{selectedNode.name}</Card.Title>
                            <Card.Text>Nome: {selectedNode.name}</Card.Text>
                            <Card.Text>email: {selectedNode.email}</Card.Text>
                            <Card.Text>Estado: {selectedNode.uf}</Card.Text>
                            <Card.Text>Partido: {selectedNode.party}</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            )}
            {selectedEdge && (
                <div className="EdgeDetailsContainer">
                    <Card className="EdgeDetails">
                        <Card.Body>
                            <Card.Title>{selectedEdge.tipoDespesa}</Card.Title>
                            <Card.Text>Ano: {selectedEdge.ano}</Card.Text>
                            <Card.Text>Mês: {selectedEdge.mes}</Card.Text>
                            <Card.Text>
                                Tipo de Despesa: {selectedEdge.tipoDespesa}
                            </Card.Text>
                            <Card.Text>
                                Código do Documento: {selectedEdge.codDocumento}
                            </Card.Text>
                            <Card.Text>
                                Tipo de Documento: {selectedEdge.tipoDocumento}
                            </Card.Text>
                            <Card.Text>
                                Data do Documento: {selectedEdge.dataDocumento}
                            </Card.Text>
                            <Card.Text>
                                Número do Documento: {selectedEdge.numDocumento}
                            </Card.Text>
                            <Card.Text>
                                Valor: {selectedEdge.valorDocumento}
                            </Card.Text>
                            <Card.Text>
                                Valor Glosa: {selectedEdge.valorGlosa}
                            </Card.Text>
                            <Card.Text>
                                Valor Líquido: {selectedEdge.valorLiquido}
                            </Card.Text>
                            <Card.Text>
                                Valor Reembolsado: {selectedEdge.valorReembolsado}
                            </Card.Text>
                            <Card.Text>
                                Valor Restituído: {selectedEdge.valorRestituicao}
                            </Card.Text>
                            <Card.Text>
                                Valor Sem Glosa: {selectedEdge.valorSemGlosa}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            )}
            {sigmaComponent}
        </div>
    );
};

export default Graph;
