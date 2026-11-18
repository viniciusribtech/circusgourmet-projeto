
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    console.log(`Requisição recebida de ${req.ip}; ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());
app.use(express.json());

// Verifica a conexão com o banco
require('./src/database/connection');

// Rotas do dashboard
const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api', dashboardRoutes);

// Rota base de teste
app.get('/', (req, res) => {
    res.json({
        status: "Sucesso!",
        mensagem: "API Circus Gourmet rodando"
    });
});

// Rotas de Clientes
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api', clienteRoutes);

// Rotas de Insumos
const insumoRoutes = require('./src/routes/insumoRoutes');
app.use('/api', insumoRoutes);

// Rotas de Serviços
const servicoRoutes = require('./src/routes/servicoRoutes');
app.use('/api', servicoRoutes);

// Rotas de Carrinhos
const carrinhoRoutes = require('./src/routes/carrinhoRoutes');
app.use('/api', carrinhoRoutes);

// rota do orcamento
const orcamentoRoutes = require('./src/routes/orcamentoRoutes');
app.use('/api', orcamentoRoutes);
const eventoRoutes = require('./src/routes/eventoRoutes');
app.use('/api', eventoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
