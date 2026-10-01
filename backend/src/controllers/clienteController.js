const clienteService = require('../services/clienteService');

async function listarClientes(req, res) {
    try {
        const clientes = await clienteService.listarClientes();
        res.json(clientes);
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
}

async function buscarClientes(req, res) {
    try {
        const { termo } = req.query;

        const clientes = await clienteService.buscarClientes(termo);

        res.json(clientes);
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
}

async function cadastrarCliente(req, res) {
    try {
        const cliente = await clienteService.cadastrarCliente(req.body);

        res.status(201).json(cliente);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

async function atualizarCliente(req, res) {
    try {
        const { id } = req.params;

        const cliente = await clienteService.atualizarCliente(id, req.body);

        res.json(cliente);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

async function excluirCliente(req, res) {
    try {
        const { id } = req.params;

        const resultado = await clienteService.excluirCliente(id);

        res.json(resultado);
    } catch (erro) {
        res.status(400).json({ mensagem: erro.message });
    }
}

module.exports = {
    listarClientes,
    buscarClientes,
    cadastrarCliente,
    atualizarCliente,
    excluirCliente
};