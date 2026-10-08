const insumoService = require('../services/insumoService');

// 1. Listar todos os insumos (uso do _ para ignorar o parâmetro obrigatorio)
async function listarInsumos(_requisicao, resposta) {
    try {
        const listaDeInsumos = await insumoService.listarInsumos();
        return resposta.status(200).json(listaDeInsumos);
    } catch (erroServidor) {
        return resposta.status(500).json({ erro: "Falha interna ao listar os insumos." });
    }
}

// 2. Buscar insumos por nome
async function buscarInsumos(requisicao, resposta) {
    try {
        const termoPesquisado = requisicao.query.pesquisa;

        if (!termoPesquisado || termoPesquisado.trim().length === 0) {
            return resposta.status(400).json({ erro: "O termo de pesquisa não pode estar vazio!" });
        }

        const resultadosDaBusca = await insumoService.buscarInsumos(termoPesquisado.trim());
        return resposta.status(200).json(resultadosDaBusca);
    } catch (erroServidor) {
        return resposta.status(500).json({ erro: "Falha interna ao buscar o insumo." });
    }
}

// 3. Cadastrar um novo insumo
async function cadastrarInsumo(requisicao, resposta) {
    try {
        const dadosDoNovoInsumo = requisicao.body;
        const insumoCadastrado = await insumoService.cadastrarInsumo(dadosDoNovoInsumo);
        
        return resposta.status(201).json(insumoCadastrado);
    } catch (erroDeValidacao) {
        return resposta.status(400).json({ erro: erroDeValidacao.message });
    }
}

// 4. Atualizar um insumo
async function atualizarInsumo(requisicao, resposta) {
    try {
        const idDoInsumo = requisicao.params.id;
        const dadosParaAtualizar = requisicao.body;

        const insumoAtualizado = await insumoService.atualizarInsumo(idDoInsumo, dadosParaAtualizar);
        return resposta.status(200).json(insumoAtualizado);
    } catch (erroDeValidacao) {
        // Agora lê o status injetado pelo Service (se não houver, assume 400)
        const codigoHttp = erroDeValidacao.status || 400;
        return resposta.status(codigoHttp).json({ erro: erroDeValidacao.message });
    }
}

// 5. Excluir um insumo
async function excluirInsumo(requisicao, resposta) {
    try {
        const idDoInsumo = requisicao.params.id;
        const respostaDaExclusao = await insumoService.excluirInsumo(idDoInsumo);
        
        return resposta.status(200).json(respostaDaExclusao);
    } catch (erroDeValidacao) {
        const codigoHttp = erroDeValidacao.status || 400;
        return resposta.status(codigoHttp).json({ erro: erroDeValidacao.message });
    }
}

module.exports = {
    listarInsumos,
    buscarInsumos,
    cadastrarInsumo,
    atualizarInsumo,
    excluirInsumo
};