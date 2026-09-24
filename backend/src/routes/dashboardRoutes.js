const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rotas de leitura (GET)
router.get('/dashboard', dashboardController.getDashboard);
router.get('/health', dashboardController.getHealth);

// NOVA ROTA: Escrita no banco (POST)
router.post('/eventos', dashboardController.criarEvento);

module.exports = router;