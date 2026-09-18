const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Rota principal da página inicial
router.get('/dashboard', dashboardController.getDashboard);

// Rota de teste rápido de funcionamento
router.get('/health', dashboardController.getHealth);

module.exports = router;
