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

//1. Importa as rotas do dashboard que vocês criaram
const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/api', dashboardRoutes);

// Rota base de teste
app.get('/', (req, res) => { 
    res.json({ status: "Sucesso!", mensagem: "API Circus Gourmet rodando" }); 
});

// rota do cliente
const clienteRoutes = require('./src/routes/clienteRoutes');
app.use('/api', clienteRoutes);

// rota do insumo
const insumoRoutes = require('./src/routes/insumoRoutes');
app.use('/api', insumoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
    console.log(`Servidor rodando com sucesso na porta ${PORT}`); 
});