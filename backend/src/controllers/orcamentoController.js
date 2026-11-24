const orcamentoService = require('../services/orcamentoService');

function responderErro(res, erro, fallback) {
    const status = erro.status || 400;
    if (status >= 500) {
        console.error(fallback, erro);
    }
    return res.status(status).json({ mensagem: erro.message || fallback });
}

async function listarEventosParaOrcamento(req, res) {
    try {
        const eventos = await orcamentoService.listarEventosParaOrcamento();
        return res.json(eventos);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao listar eventos para orçamento:');
    }
}

async function obterPreviaOrcamento(req, res) {
    try {
        const { eventoId, desconto } = req.query;
        const previa = await orcamentoService.obterPreviaOrcamento(eventoId, desconto);
        return res.json(previa);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao calcular prévia de orçamento:');
    }
}

async function listarOrcamentos(req, res) {
    try {
        const orcamentos = await orcamentoService.listarOrcamentos();
        return res.json(orcamentos);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao listar orçamentos:');
    }
}

async function buscarOrcamentos(req, res) {
    try {
        const { termo } = req.query;
        const orcamentos = await orcamentoService.buscarOrcamentos(termo);
        return res.json(orcamentos);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao buscar orçamentos:');
    }
}

async function cadastrarOrcamento(req, res) {
    try {
        const orcamento = await orcamentoService.cadastrarOrcamento(req.body);
        return res.status(201).json(orcamento);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao cadastrar orçamento:');
    }
}

async function atualizarOrcamento(req, res) {
    try {
        const { id } = req.params;
        const orcamento = await orcamentoService.atualizarOrcamento(id, req.body);
        return res.json(orcamento);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao atualizar orçamento:');
    }
}

async function excluirOrcamento(req, res) {
    try {
        const { id } = req.params;
        const resultado = await orcamentoService.excluirOrcamento(id);
        return res.json(resultado);
    } catch (erro) {
        return responderErro(res, erro, 'Erro ao excluir orçamento:');
    }
}

module.exports = {
    listarEventosParaOrcamento,
    obterPreviaOrcamento,
    listarOrcamentos,
    buscarOrcamentos,
    cadastrarOrcamento,
    atualizarOrcamento,
    excluirOrcamento
};