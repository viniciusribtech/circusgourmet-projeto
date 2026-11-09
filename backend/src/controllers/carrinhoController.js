const carrinhoService = require('../services/carrinhoService');


// Listar carrinhos
async function listarCarrinhos(req, res) {
    try {
        const carrinhos = await carrinhoService.listarCarrinhos();

        res.json(carrinhos);

    } catch (erro) {
        console.error("Erro ao listar carrinhos:", erro);

        res.status(500).json({
            mensagem: erro.message
        });
    }
}


// Buscar carrinhos
async function buscarCarrinhos(req, res) {
    try {
        const { termo } = req.query;

        const carrinhos = await carrinhoService.buscarCarrinhos(termo);

        res.json(carrinhos);

    } catch (erro) {
        console.error("Erro ao buscar carrinhos:", erro);

        res.status(500).json({
            mensagem: erro.message
        });
    }
}


// Cadastrar carrinho
async function cadastrarCarrinho(req, res) {
    try {
        const carrinho = await carrinhoService.cadastrarCarrinho(req.body);

        res.status(201).json(carrinho);

    } catch (erro) {
        console.error("Erro ao cadastrar carrinho:", erro);

        res.status(400).json({
            mensagem: erro.message
        });
    }
}


// Atualizar carrinho
async function atualizarCarrinho(req, res) {
    try {
        const { id } = req.params;

        const carrinho = await carrinhoService.atualizarCarrinho(
            id,
            req.body
        );

        res.json(carrinho);

    } catch (erro) {
        console.error("Erro ao atualizar carrinho:", erro);

        res.status(400).json({
            mensagem: erro.message
        });
    }
}


// Excluir carrinho
async function excluirCarrinho(req, res) {
    try {
        const { id } = req.params;

        const resultado = await carrinhoService.excluirCarrinho(id);

        res.json(resultado);

    } catch (erro) {
        console.error("Erro ao excluir carrinho:", erro);

        res.status(400).json({
            mensagem: erro.message
        });
    }
}


module.exports = {
    listarCarrinhos,
    buscarCarrinhos,
    cadastrarCarrinho,
    atualizarCarrinho,
    excluirCarrinho
};