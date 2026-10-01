const express = require('express');

const router = express.Router();

const clienteController = require('../controllers/clienteController');

router.get('/clientes', clienteController.listarClientes);

router.get('/clientes/buscar', clienteController.buscarClientes);

router.post('/clientes', clienteController.cadastrarCliente);

router.put('/clientes/:id', clienteController.atualizarCliente);

router.delete('/clientes/:id', clienteController.excluirCliente);

module.exports = router;