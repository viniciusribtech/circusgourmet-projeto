const express = require('express');
const router = express.Router();
const insumoController = require('../controllers/insumoController');

router.get('/insumos', insumoController.listarInsumos);

router.get('/insumos/buscar', insumoController.buscarInsumos);

router.post('/insumos', insumoController.cadastrarInsumo);
router.put('/insumos/:id', insumoController.atualizarInsumo);
router.delete('/insumos/:id', insumoController.excluirInsumo);

module.exports = router;