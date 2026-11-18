const orcamentoService = require('../services/orcamentoService');

async function listarOrcamentos(req, res) {
    try {
        const orcamentos = await orcamentoService.listarOrcamentos();
        res.json(orcamentos);
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
}

async function buscarOrcamentos(req, res) {
    try {
        const { termo } = req.query;
        const orcamentos = await orcamentoService.buscarOrcamentos(termo);
        res.json(orcamentos);
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
}

async function cadastrarOrcamento(req, res) {
    try {
        const orcamento = await orcamentoService.cadastrarOrcamento(req.body);
        res.status(201).json(orcamento);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

async function atualizarOrcamento(req, res) {
    try {
        const { id } = req.params;
        const orcamento = await orcamentoService.atualizarOrcamento(id, req.body);
        res.json(orcamento);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

async function excluirOrcamento(req, res) {
    try {
        const { id } = req.params;
        const resultado = await orcamentoService.excluirOrcamento(id);
        res.json(resultado);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

module.exports = {
    listarOrcamentos,
    buscarOrcamentos,
    cadastrarOrcamento,
    atualizarOrcamento,
    excluirOrcamento
};