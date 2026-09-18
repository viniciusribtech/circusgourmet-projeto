const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Verifica a conexão com o banco
require('./src/database/connection');

// 1. Importa as rotas do dashboard que vocês criaram
const dashboardRoutes = require('./src/routes/dashboardRouter');

// Rota base de teste
app.get('/', (req, res) => { 
    res.json({ status: "Sucesso!", mensagem: "API Circus Gourmet rodando" }); 
});

// 2. Avisa ao Express para usar o dashboardRoutes com o prefixo '/api'
app.use('/api', dashboardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
    console.log(`Servidor rodando com sucesso na porta ${PORT}`); 
});
