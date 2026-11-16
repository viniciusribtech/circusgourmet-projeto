
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/BarraNav/navbar.jsx';
import Home from './pages/Home/home';
import Clientes from './pages/Cliente/cliente';
import Insumo from './pages/Insumo/insumo';

// Módulo de Serviços
import Servico from './pages/Servico/servico.jsx';

// Módulo de Carrinhos
import Carrinhos from './pages/Carrinho/carrinho.jsx';

// Página provisória para rotas que ainda não foram criadas
function EmConstrucao() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '32px', textAlign: 'center' }}>
                Página em construção.
            </div>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/insumos" element={<Insumo />} />

                {/* Módulo de Serviços */}
                <Route path="/servicos" element={<Servico />} />

                {/* Módulo de Carrinhos */}
                <Route path="/carrinho" element={<Carrinhos />} />

                {/* Rotas ainda não implementadas */}
                <Route path="*" element={<EmConstrucao />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
