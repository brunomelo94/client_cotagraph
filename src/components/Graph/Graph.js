import React, { useEffect, useRef, useState, FC } from 'react';
import { Sigma, renderers } from 'sigma';
import graphology from 'graphology';
import ForceAtlas2 from 'graphology-layout-forceatlas2';
import './Graph.css';
import { Card, Form, Button } from 'react-bootstrap';

// Import Card, Layout, Deputy
import DeputyCard from '../Card/Card';

const partyColors = {
    'PT': '#FF0000',
    'PSDB': '#0000FF',
    'PSOL': '#F66C0D',
    'PSB': '#00FF00',
    'DEM': '#FFFF00',
    'MDB': '#00FFFF',
    'PP': '#7A3E9D',
    'PDT': '#83258D',
    'PL': '#4B0082',
    'PSC': '#2E8B57',
    'PSD': '#008080',
    'PTB': '#483D8B',
    'PV': '#32CD32',
    'REPUBLICANOS': '#DC143C',
    'SOLIDARIEDADE': '#8B4513',
    'AVANTE': '#FFD700',
    'CIDADANIA': '#FF4500',
    'PATRI': '#8A2BE2',
    'PODE': '#20B2AA',
    'PROS': '#228B22',
    'PRTB': '#800000',
    'PSL': '#DAA520',
    'PTC': '#D2691E',
    'REDE': '#B22222',
    'S.PART.': '#FFA07A',
    'PCdoB': '#FF6347',
    'PMB': '#8B008B',
    'PMN': '#006400',
    'PPL': '#ADFF2F',
    'PR': '#7FFF00',
    'PRB': '#7CFC00',
    'PRP': '#00FA9A',
    'PSB': '#00FF7F',
    'PSDC': '#4682B4'
};

const getNodeColor = (party) => {
    return partyColors[party] || '#000000';
};


const Graph = ({ data }) => {
    const containerRef = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [selectedEdge, setSelectedEdge] = useState(null);
    const [layout, setLayout] = useState("forceAtlas2");
    const [sigmaRenderer, setSigmaRenderer] = useState(null);

    const randomCoordinate = () => Math.random() * 5;

    const applyForceAtlas2Layout = (graph) => {
        const settings = {
            iterations: 2,
            linLogMode: true,
        };
        ForceAtlas2.assign(graph, settings);
    };

    useEffect(() => {
        if (data && data.deputies && data.expenses) {
            const graph = new graphology();

            // Adicione os nós deputados aqui
            data.deputies.forEach((deputy) => {
                let randomX = randomCoordinate();
                let randomY = randomCoordinate();
                graph.addNode(deputy._id, {
                    label: deputy.name,
                    size: 2,
                    color: getNodeColor(deputy.party),
                    x: randomX,
                    y: randomY,
                    deputy: {
                        id: deputy.id,
                        uri: deputy.uri,
                        name: deputy.name,
                        party: deputy.party,
                        uriParty: deputy.uriParty,
                        uf: deputy.uf,
                        legislatureId: deputy.legislatureId,
                        photoUrl: deputy.photoUrl,
                        email: deputy.email,
                        x: randomX,
                        y: randomY
                    }
                });
            });

            // Adicione os nós empresas aqui, somente se o valor da despesa for maior que 0 e evitar duplicação pelo nomeFornecedor,
            data.expenses.forEach((expense) => {
                const expenseId = expense._id;
                graph.addNode(expenseId, {
                    label: expense.nomeFornecedor,
                    size: 2,
                    // color should be based on the expense type
                    color: getColours(expense.tipoDespesa),
                    expense: {
                        ano: expense.ano,
                        mes: expense.mes,
                        tipoDespesa: expense.tipoDespesa,
                        codDocumento: expense.codDocumento,
                        tipoDocumento: expense.tipoDocumento,
                        codTipoDocumento: expense.codTipoDocumento,
                        dataDocumento: expense.dataDocumento,
                        numDocumento: expense.numDocumento,
                        valorDocumento: expense.valorDocumento,
                        urlDocumento: expense.urlDocumento,
                        nomeFornecedor: expense.nomeFornecedor,
                        cnpjCpfFornecedor: expense.cnpjCpfFornecedor,
                        valorLiquido: expense.valorLiquido,
                        valorGlosa: expense.valorGlosa,
                        numRessarcimento: expense.numRessarcimento,
                        codLote: expense.codLote,
                        parcela: expense.parcela,
                        deputy: expense.deputy
                    },
                    x: randomCoordinate(),
                    y: randomCoordinate(),
                });
                const deputyId = expense.deputy;
                graph.addEdge(deputyId, expenseId, {
                    label: expense.tipoDespesa,
                    size: Math.log(expense.valorDocumento + 1) / 50,
                    color: '#0f0',
                    expense: {
                        ano: expense.ano,
                        mes: expense.mes,
                        tipoDespesa: expense.tipoDespesa,
                        codDocumento: expense.codDocumento,
                        tipoDocumento: expense.tipoDocumento,
                        codTipoDocumento: expense.codTipoDocumento,
                        dataDocumento: expense.dataDocumento,
                        numDocumento: expense.numDocumento,
                        valorDocumento: expense.valorDocumento,
                        urlDocumento: expense.urlDocumento,
                        nomeFornecedor: expense.nomeFornecedor,
                        cnpjCpfFornecedor: expense.cnpjCpfFornecedor,
                        valorLiquido: expense.valorLiquido,
                        valorGlosa: expense.valorGlosa,
                        numRessarcimento: expense.numRessarcimento,
                        codLote: expense.codLote,
                        parcela: expense.parcela,
                        deputy: expense.deputy
                    }
                });
            });

            if (layout === "forceAtlas2" && sigmaRenderer) {
                applyForceAtlas2Layout(graph);
                console.log('forceAtlas2');
            }

            const renderer = new Sigma(graph, containerRef.current, {
                zIndex: true,
                defaultEdgeColor: '#000',
                defaultEdgeType: 'arrow',
                defaultEdgeHoverColor: '#000',
                defaultNodeColor: '#000',
                defaultNodeHoverColor: '#000',
                defaultNodeBorderColor: '#000',
                defaultLabelColor: '#000',
                defaultEdgeLabelColor: '#000',
                edgeColor: 'default',
            });

            setSigmaRenderer(renderer);

            renderer.on('clickEdge', (event) => {
                const { edge } = event;
                const edgeData = graph.getEdgeAttributes(edge);
                console.log(edgeData);
                setSelectedEdge(edgeData.expense);
            });

            renderer.on('clickNode', (event) => {
                const { node } = event;
                const nodeData = graph.getNodeAttributes(node);
                setSelectedNode(nodeData.deputy);
            });

            // renderer.refresh();

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
        }
    }, [data, layout]);

    const handleSearch = () => {
        if (!sigmaRenderer) {
            alert('Gráfico não disponível');
            return;
        }

        const graph = sigmaRenderer.getGraph();
        const nodeId = graph
            .nodes()
            .find((id) => graph.getNodeAttributes(id).label.toLowerCase() === searchValue.toLowerCase());

        if (nodeId) {
            const nodePosition = sigmaRenderer.getNodeDisplayData(nodeId);

            console.log(nodePosition);

            const camera = sigmaRenderer.getCamera();

            // camera.animatedZoom(, {
            //     duration: 500,
            //     factor: 10,
            // });

            camera.animate(nodePosition, {
                duration: 500,
            })

        } else {
            // Embbed bootstrap alert
            alert('Deputado não encontrado');
        }
    };

    return (
        <div className="GraphContainer">
            <div ref={containerRef} className="Graph" />
            <div className="sigma-tooltip" />
            <div className="GraphSearch">
                <input
                    className="GraphSearch-input"
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite o nome do deputado"
                />
                <button className="GraphSearch-button" onClick={handleSearch}>Buscar</button>
                <select
                    className="GraphSearch-select"
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                >
                    <option value="forceAtlas2">ForceAtlas2</option>
                    {/* Add other layout options here */}
                </select>
            </div>
            {selectedNode && (
                <div className="NodeDetailsContainer">
                    <Card className="NodeDetails">
                        <Card.Img className="NodeDetails-image" variant="top" src={selectedNode.photoUrl} />
                        <Card.Body>
                            <Card.Title>{selectedNode.name}</Card.Title>
                            <Card.Text>
                                Nome: {selectedNode.name}
                            </Card.Text>
                            <Card.Text>
                                email: {selectedNode.email}
                            </Card.Text>
                            <Card.Text>
                                Estado: {selectedNode.uf}
                            </Card.Text>
                            <Card.Text>
                                Partido: {selectedNode.party}
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            )}
            {selectedEdge && (
                <div className="EdgeDetailsContainer">
                    <Card className="EdgeDetails">
                        <Card.Body>
                            <Card.Title>{selectedEdge.tipoDespesa}</Card.Title>
                            <Card.Text>
                                Ano: {selectedEdge.ano}
                            </Card.Text>
                            <Card.Text>
                                Mês: {selectedEdge.mes}
                            </Card.Text>
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
        </div>
    );

};

export default Graph;

function getColours(type) {
    // return random color
    return '#' + Math.floor(Math.random() * 1677).toString(16);
}

