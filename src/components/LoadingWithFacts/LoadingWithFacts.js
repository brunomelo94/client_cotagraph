import React, { useState, useEffect } from "react";
import Carousel from 'react-bootstrap/Carousel'; // assumindo que você está usando o react-bootstrap
import "bootstrap/dist/css/bootstrap.min.css"; // Estilos do Bootstrap, caso ainda não tenha importado
import "./LoadingWithFacts.css";

const facts = [
    "A CEAP foi criado em 2009!", // correto1
    "A CEAP tem como objetivo auxiliar os parlamentares em seus gastos vinculados ao exercício da atividade parlamentar.", // mais específico1
    "O uso do CEAP é regulamentado por uma série de normas e portarias da Câmara dos Deputados.", // mais claro1
    "A CEAP substituiu a verba indenizatória, que possuía uma lista mais restrita de despesas permitidas.", // mais preciso1
    "Os valores da CEAP variam de estado para estado, levando em consideração o preço das passagens aéreas até Brasília.", // mais exato12
    "As despesas da CEAP incluem aluguel de escritórios, aquisição de material de escritório, consultorias e outras despesas operacionais como passagens aéreas, telefonia, serviços postais, alimentação, hospedagem e locomoção.", // mais completo1
    "As despesas da CEAP não incluem salários para os funcionários dos parlamentares que são pagos com a verba de gabinete.", // mais informativo3
    "Os valores não utilizados da CEAP em um mês ficam acumulados ao longo do ano.", // correto3
    "A CEAP é apenas uma das várias formas de apoio financeiro que os parlamentares recebem para realizar seu trabalho, como verba de gabinete, auxílio-moradia e remuneração.", // mais abrangente3
    "Cada deputado tem uma cota mensal que varia de R$ 30.788,66 a R$ 45.612,53, dependendo do estado que representa.", // mais coerente12
    "Os senadores têm uma cota que varia de R$ 21.045,20 a R$ 38.616,18 por mês, também dependendo do estado que representa." // mais coerente2
];



const LoadingWithFacts = ({ isLoading }) => {
    const [factIndex, setFactIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setFactIndex((factIndex + 1) % facts.length);
        }, 7000); // Mudar a cada 3 segundos

        return () => clearInterval(intervalId); // Limpar na desmontagem do componente
    }, [factIndex]);

    return (
        <div>
            {isLoading ? (
                <div>
                    <Carousel activeIndex={factIndex} onSelect={setFactIndex} controls={false} indicators={false} pause={false}>
                        {facts.map((fact, index) => (
                            <Carousel.Item key={index}>
                                <div className="fact-card">
                                    <h5>Você sabia?</h5>
                                    <p>{fact}</p>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    <img src="..\Loading_icon.gif" alt="Loading" className="loading-gif" />
                </div>
            ) : null}
        </div>
    );
};

export default LoadingWithFacts;
