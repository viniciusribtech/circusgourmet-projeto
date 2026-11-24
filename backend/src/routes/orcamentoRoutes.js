const express = require('express');
const router = express.Router();
const orcamentoController = require('../controllers/orcamentoController');

router.get('/orcamentos/eventos-disponiveis', orcamentoController.listarEventosParaOrcamento);
router.get('/orcamentos/calcular', orcamentoController.obterPreviaOrcamento);
router.get('/orcamentos', orcamentoController.listarOrcamentos);
router.get('/orcamentos/buscar', orcamentoController.buscarOrcamentos);
router.post('/orcamentos', orcamentoController.cadastrarOrcamento);
router.put('/orcamentos/:id', orcamentoController.atualizarOrcamento);
router.delete('/orcamentos/:id', orcamentoController.excluirOrcamento);

module.exports = router;