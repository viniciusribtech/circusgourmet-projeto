const express = require('express');

const router = express.Router();

const carrinhoController = require('../controllers/carrinhoController');


// Listar carrinhos
router.get('/carrinhos', carrinhoController.listarCarrinhos);

// Buscar carrinhos por ID ou tipo
router.get('/carrinhos/buscar', carrinhoController.buscarCarrinhos);

// Cadastrar carrinho
router.post('/carrinhos', carrinhoController.cadastrarCarrinho);

// Atualizar carrinho
router.put('/carrinhos/:id', carrinhoController.atualizarCarrinho);

// Excluir carrinho
router.delete('/carrinhos/:id', carrinhoController.excluirCarrinho);


module.exports = router;