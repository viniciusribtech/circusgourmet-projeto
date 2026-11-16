const servico = require('../services/eventoService');

function identificador(req, res) {
    const texto = req.params.id;
    const id = Number(texto);
    if (!/^\d+$/.test(texto) || !Number.isSafeInteger(id) || id < 1) {
        res.status(400).json({ erro: 'Identificador de evento inválido.' });
        return null;
    }
    return id;
}

function executar(operacao, codigoSucesso = 200) {
    return async (req, res) => {
        try {
            const resultado = await operacao(req, res);
            if (resultado !== undefined) res.status(codigoSucesso).json(resultado);
        } catch (erro) {
            if (!erro.status) console.error('Erro na operação de eventos:', erro);
            res.status(erro.status || 500).json({ erro: erro.status ? erro.message : 'Não foi possível realizar a operação de eventos.' });
        }
    };
}

const listar = executar(() => servico.listarEventos());
const buscar = executar((req) => {
    const pesquisa = req.query.pesquisa;
    if (typeof pesquisa !== 'string' || !pesquisa.trim()) {
        const erro = new Error('Preencha a barra de pesquisa!'); erro.status = 400; throw erro;
    }
    if (pesquisa.trim().length > 50) {
        const erro = new Error('A pesquisa não pode ultrapassar 50 caracteres.'); erro.status = 400; throw erro;
    }
    return servico.listarEventos(pesquisa);
});
const clientes = executar(() => servico.listarClientes());
const cidades = executar(() => servico.listarCidades());
const obter = executar(async (req, res) => {
    const id = identificador(req, res);
    if (id === null) return;
    const evento = await servico.obterEvento(id);
    if (!evento) { res.status(404).json({ erro: 'Evento não encontrado!' }); return; }
    return evento;
});
const cadastrar = executar((req) => servico.cadastrarEvento(req.body), 201);
const atualizar = executar((req, res) => {
    const id = identificador(req, res);
    if (id !== null) return servico.atualizarEvento(id, req.body);
});
const excluir = executar((req, res) => {
    const id = identificador(req, res);
    if (id !== null) return servico.excluirEvento(id);
});
module.exports = { listar, buscar, clientes, cidades, obter, cadastrar, atualizar, excluir };
