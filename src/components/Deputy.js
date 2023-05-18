import React from 'react';
import { Link } from 'react-router-dom';

const Deputy = ({ deputy }) => {
    return (
        <div className="card">
            <img src={deputy.photoUrl} className="card-img-top" alt={deputy.name} />
            <div className="card-body">
                <h5 className="card-title">{deputy.name}</h5>
                <p className="card-text">{deputy.party} - {deputy.uf}</p>
                <Link to={`/deputies/${deputy.id}`} className="btn btn-primary">Detalhes</Link>
            </div>
        </div>
    );
}

export default Deputy;
