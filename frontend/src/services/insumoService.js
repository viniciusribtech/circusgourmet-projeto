import axios from 'axios';

// Utiliza o padrão existente no projeto para a URL base
const API_URL = 'http://localhost:3000/api/insumos';

// Tratamento de erros compatível com o backend (lê 'erro' ou 'mensagem')
const mensagemDeErro = (erro) => {
    if (erro.response && erro.response.data) {
        return erro.response.data.erro || erro.response.data.mensagem || "Erro inesperado ao processar a requisição.";
    }
    if (erro.message === "Network Error") {
        return "Falha de conexão com o servidor. Verifique se o backend está ativo.";
    }
    return erro.message;
};

export const listarInsumos = async () => {
    try {
        const resposta = await axios.get(API_URL);
        return resposta.data;
    } catch (erro) {
        throw new Error(mensagemDeErro(erro));
    }
};

export const buscarInsumos = async (termo) => {
    try {
        // Resolve a incompatibilidade: frontend usa 'termo', backend espera 'pesquisa'
        const resposta = await axios.get(`${API_URL}/buscar`, { params: { pesquisa: termo } });
        return resposta.data;
    } catch (erro) {
        throw new Error(mensagemDeErro(erro));
    }
};

export const cadastrarInsumo = async (dadosInsumo) => {
    try {
        // Tratamento para garantir que o custo_unitario seja numérico caso venha com vírgula do input
        const dadosFormatados = {
            ...dadosInsumo,
            custo_unitario: typeof dadosInsumo.custo_unitario === 'string' 
                ? parseFloat(dadosInsumo.custo_unitario.replace(',', '.')) 
                : dadosInsumo.custo_unitario
        };
        const resposta = await axios.post(API_URL, dadosFormatados);
        return resposta.data;
    } catch (erro) {
        throw new Error(mensagemDeErro(erro));
    }
};

export const atualizarInsumo = async (id_insumo, dadosInsumo) => {
    try {
        const dadosFormatados = {
            ...dadosInsumo,
            custo_unitario: typeof dadosInsumo.custo_unitario === 'string' 
                ? parseFloat(dadosInsumo.custo_unitario.replace(',', '.')) 
                : dadosInsumo.custo_unitario
        };
        const resposta = await axios.put(`${API_URL}/${id_insumo}`, dadosFormatados);
        return resposta.data;
    } catch (erro) {
        throw new Error(mensagemDeErro(erro));
    }
};

export const excluirInsumo = async (id_insumo) => {
    try {
        const resposta = await axios.delete(`${API_URL}/${id_insumo}`);
        return resposta.data;
    } catch (erro) {
        throw new Error(mensagemDeErro(erro));
    }
};