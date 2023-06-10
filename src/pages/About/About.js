// src/pages/About/About.js
import React from 'react';
import { Container } from 'react-bootstrap';
import './About.css';

const About = () => {
    const backgroundImage = "./deputados_gpt_1.webp";  // Atualize isso para o caminho correto de sua imagem de fundo.

    return (
        <Container>
            <div className="BackgroundImage" style={{ backgroundImage: `url(${backgroundImage})` }} />
            <Container className="About">
                <h1>Sobre o Aplicativo</h1>
                <p>
                    O cotagraph, uma ferramenta desenvolvida por Bruno Melo para seu Trabalho de Conclusão de Curso em Engenharia de Sistemas, visa facilitar a compreensão e análise das despesas de deputados federais. Através de uma representação gráfica intuitiva, permite aos usuários ver quais empresas recebem pagamentos dos deputados. Ao clicar em um nó específico, representando um deputado ou uma empresa, é possível visualizar detalhes sobre os gastos. A aplicação também oferece recursos de filtragem para permitir uma busca mais específica e focada.
                </p>
                <h2>ForceAtlas2 e o Grafo de Despesas</h2>
                <p>
                    A visualização gráfica em cotagraph usa o algoritmo ForceAtlas2 para gerar um layout intuitivo e informativo. ForceAtlas2 é um algoritmo de layout baseado em forças, que utiliza atrações e repulsões para posicionar os nós. No contexto de nosso aplicativo, os nós representam deputados e empresas.
                </p>
                <p>
                    Uma aresta (ou ligação) entre um nó de deputado e um nó de empresa indica uma transação financeira, com o peso da aresta correspondendo ao valor da transação. O algoritmo ForceAtlas2 garante que os nós conectados por transações de alto valor (ou seja, deputados e empresas com transações financeiras significativas entre eles) serão atraídos mais fortemente uns pelos outros e acabarão mais próximos no layout. Por outro lado, os nós com transações menores ou inexistentes serão repelidos.
                </p>
                <p>
                    Desta forma, a visualização resultante fornece uma perspectiva clara e direta das relações financeiras entre deputados e empresas. Os agrupamentos de nós e a densidade das conexões servem como indicadores visuais das tendências e padrões nas despesas dos deputados.
                </p>
            </Container>
        </Container>
    );
};

export default About;
