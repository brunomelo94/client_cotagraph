import React, { useEffect, useRef, useState } from 'react';
import { Sigma, renderers } from 'sigma';
import graphology from 'graphology';
import ForceAtlas2 from 'graphology-layout-forceatlas2';
import './Graph.css';
import { Card, Form, Button } from 'react-bootstrap';


const partyColors = {
    'PT': '#FF0000',
    'PSDB': '#0000FF',
    'PSOL': '#FF00FF',
    'PSB': '#00FF00',
    'DEM': '#FFFF00',
    'MDB': '#00FFFF',
    'PP': '#FF00FF',
    'PDT': '#FF00FF',
    'PL': '#FF00FF',
    'PSC': '#FF00FF',
    'PSD': '#FF00FF',
    'PTB': '#FF00FF',
    'PV': '#FF00FF',
    'REPUBLICANOS': '#FF00FF',
    'SOLIDARIEDADE': '#FF00FF',
    'AVANTE': '#FF00FF',
    'CIDADANIA': '#FF00FF',
    'PATRI': '#FF00FF',
    'PODE': '#FF00FF',
    'PROS': '#FF00FF',
    'PRTB': '#FF00FF',
    'PSL': '#FF00FF',
    'PTC': '#FF00FF',
    'REDE': '#FF00FF',
    'S.PART.': '#FF00FF',
    'PCdoB': '#FF00FF',
    'PMB': '#FF00FF',
    'PMN': '#FF00FF',
    'PPL': '#FF00FF',
    'PR': '#FF00FF',
    'PRB': '#FF00FF',
    'PRP': '#FF00FF',
    'PSB': '#FF00FF',
    'PSDB': '#FF00FF',
    'PSDC': '#FF00FF'
};

const getNodeColor = (party) => {
    return partyColors[party] || '#000000';
};

const Graph = ({ data }) => {
    const containerRef = useRef();
    const [searchValue, setSearchValue] = useState('');
    const [selectedNode, setSelectedNode] = useState(null);
    const [layout, setLayout] = useState("forceAtlas2");
    const [sigmaRenderer, setSigmaRenderer] = useState(null);

    const randomCoordinate = () => Math.random() * 10;

    const applyForceAtlas2Layout = (graph) => {
        const settings = {
            iterations: 10,
            linLogMode: false,
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
            });

            // Adicione as arestas aqui de despesas para deputados, caso aresta já exista, somar o valor da despesa
            data.expenses.forEach((expense) => {
                const deputyId = expense.deputy;
                const expenseId = expense._id;
                graph.addEdge(deputyId, expenseId, {
                    label: expense.tipoDespesa,
                    size: Math.log(expense.valorDocumento + 1) / 10,
                    color: '#0f0',
                });
            });


            // data.expenses.forEach((expense) => {
            //     const deputyId = expense.deputy;
            //     const expenseId = expense._id;
            //     graph.addEdge(deputyId, expenseId, {
            //         label: expense.tipoDespesa,
            //         size: Math.log(expense.valorDocumento + 1) / 10,
            //         color: '#0f0',
            //     });
            // });

            if (layout === "forceAtlas2") {
                applyForceAtlas2Layout(graph);
            }

            const renderer = new Sigma(graph, containerRef.current, {
                zIndex: true,
            });

            setSigmaRenderer(renderer);

            renderer.on('clickNode', (event) => {
                const { node } = event;
                const nodeData = graph.getNodeAttributes(node);
                setSelectedNode(nodeData.deputy || nodeData.expense);
            });

            renderer.refresh();

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
            const coordinates = graph.getNodeAttributes(nodeId);
            sigmaRenderer.getCamera().animate(
                {
                    x: coordinates.x,
                    y: coordinates.y,
                    ratio: 1 / 2,
                },
                { duration: 1000 } // Mudei a duração para 1000ms (1 segundo) em vez de 100000ms
            );
            console.log(coordinates);
        } else {
            alert('Nó não encontrado');
        }
    };

    return (
        <div className="GraphContainer">
            <div ref={containerRef} className="Graph" />
            <div className="sigma-tooltip" />
            <div className="GraphSearch">
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Digite o nome do deputado"
                />
                <button onClick={handleSearch}>Buscar</button>
                <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                >
                    <option value="forceAtlas2">ForceAtlas2</option>
                    {/* Adicione outras opções de layout aqui */}
                </select>
            </div>
            {selectedNode && (
                <Card className="NodeDetails">
                    <Card.Img variant="top" src={selectedNode.party} />
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
                        {/* Foto */}
                        <Card.Img variant="top" src={selectedNode.photoUrl} />
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default Graph;

function getColours(type) {
    // return random color
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

