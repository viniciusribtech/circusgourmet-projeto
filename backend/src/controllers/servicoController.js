const servicoService = require('../services/servicoService');

async function listarServicos(_requisicao, resposta) {
    try {
        return resposta.status(200).json(await servicoService.listarServicos());
    } catch (erro) {
        console.error('Erro ao listar serviços:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao listar os serviços.' });
    }
}

async function buscarServicos(requisicao, resposta) {
    const termo = requisicao.query.pesquisa;
    if (typeof termo !== 'string' || !termo.trim()) {
        return resposta.status(400).json({ erro: 'Preencha a barra de pesquisa!' });
    }
    if (termo.trim().length > 30) {
        return resposta.status(400).json({ erro: 'A pesquisa não pode ultrapassar 30 caracteres.' });
    }
    try {
        return resposta.status(200).json(await servicoService.buscarServicos(termo.trim()));
    } catch (erro) {
        console.error('Erro ao buscar serviços:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao buscar os serviços.' });
    }
}

async function listarCategorias(_requisicao, resposta) {
    try {
        return resposta.status(200).json(await servicoService.listarCategorias());
    } catch (erro) {
        console.error('Erro ao listar categorias:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao carregar as categorias.' });
    }
}

async function cadastrarServico(requisicao, resposta) {
    try {
        const resultado = await servicoService.cadastrarServico(requisicao.body);
        return resposta.status(201).json(resultado);
    } catch (erro) {
        if (erro.status) return resposta.status(erro.status).json({ erro: erro.message });
        console.error('Erro ao cadastrar serviço:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao cadastrar o serviço.' });
    }
}

function validarId(requisicao, resposta) {
    const texto = requisicao.params.id;
    const id = Number(texto);
    if (!/^\d+$/.test(texto) || !Number.isSafeInteger(id) || id < 1) {
        resposta.status(400).json({ erro: 'Identificador de serviço inválido.' });
        return null;
    }
    return id;
}

async function obterServico(requisicao, resposta) {
    const id = validarId(requisicao, resposta);
    if (id === null) return;
    try {
        const servico = await servicoService.obterServicoPorId(id);
        if (!servico) return resposta.status(404).json({ erro: 'Serviço não encontrado!' });
        return resposta.status(200).json(servico);
    } catch (erro) {
        console.error('Erro ao consultar serviço:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao consultar o serviço.' });
    }
}

async function atualizarServico(requisicao, resposta) {
    const id = validarId(requisicao, resposta);
    if (id === null) return;
    try { return resposta.status(200).json(await servicoService.atualizarServico(id, requisicao.body)); }
    catch (erro) {
        if (erro.status) return resposta.status(erro.status).json({ erro: erro.message });
        console.error('Erro ao atualizar serviço:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao atualizar o serviço.' });
    }
}

async function excluirServico(requisicao, resposta) {
    const id = validarId(requisicao, resposta);
    if (id === null) return;
    try { return resposta.status(200).json(await servicoService.excluirServico(id)); }
    catch (erro) {
        if (erro.status) return resposta.status(erro.status).json({ erro: erro.message });
        console.error('Erro ao excluir serviço:', erro);
        return resposta.status(500).json({ erro: 'Falha interna ao excluir o serviço.' });
    }
}

module.exports = { listarServicos, buscarServicos, listarCategorias, cadastrarServico, obterServico, atualizarServico, excluirServico };
