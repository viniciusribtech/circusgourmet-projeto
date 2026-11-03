const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/servicos', servicoController.listarServicos);
router.get('/servicos/buscar', servicoController.buscarServicos);
router.get('/servicos/categorias', servicoController.listarCategorias);
router.post('/servicos', servicoController.cadastrarServico);

router.get('/servicos/:id', servicoController.obterServico);
router.put('/servicos/:id', servicoController.atualizarServico);
router.delete('/servicos/:id', servicoController.excluirServico);

module.exports = router;
