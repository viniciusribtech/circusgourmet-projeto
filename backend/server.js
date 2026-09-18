const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ status: "Sucesso!", mensagem: "API Circus Gourmet rodando"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});

require('./src/database/connection');