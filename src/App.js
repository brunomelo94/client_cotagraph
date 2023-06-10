// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './pages/Home/Home';
import DeputyDetails from './pages/DeputyDetails/DeputyDetails';
import FornecedorDetails from './pages/FornecedorDetails/FornecedorDetails';
import About from './pages/About/About'; // Importe o componente About
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/deputy/:id" element={<DeputyDetails />} />
          <Route path="/fornecedor/:cnpjCpfFornecedor" element={<FornecedorDetails />} />
          <Route path="/about" element={<About />} /> {/* Adicione esta linha */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
