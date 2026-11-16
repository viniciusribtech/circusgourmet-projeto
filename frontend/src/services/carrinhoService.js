import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

export async function listarCarrinhos() {
    const resposta = await api.get("/carrinhos");
    return resposta.data;
}

export async function buscarCarrinhos(termo) {
    const pesquisa = String(termo ?? "").trim();
    if (!pesquisa) return listarCarrinhos();
    const resposta = await api.get("/carrinhos/buscar", { params: { termo: pesquisa } });
    return resposta.data;
}

function prepararDados(dados) {
    const tipo_base = String(dados.tipo_base ?? "").trim();
    const capacidade = Number(dados.capacidade);
    // Trata o checkbox do modal (quando vem booleano ou string '1'/'0')
    const ativo = dados.ativo === true || dados.ativo === 1 || dados.ativo === "1";

    if (!tipo_base) throw new Error("O tipo de base é obrigatório!");
    if (!capacidade || capacidade <= 0) throw new Error("Informe uma capacidade válida!");

    return { tipo_base, capacidade, ativo };
}

export async function cadastrarCarrinho(dados) {
    const dadosValidados = prepararDados(dados);
    const resposta = await api.post("/carrinhos", dadosValidados);
    return resposta.data;
}

export async function atualizarCarrinho(id, dados) {
    const dadosValidados = prepararDados(dados);
    const resposta = await api.put(`/carrinhos/${id}`, dadosValidados);
    return resposta.data;
}

export async function excluirCarrinho(id) {
    const resposta = await api.delete(`/carrinhos/${id}`);
    return resposta.data;
}

export function mensagemDeErro(erro) {
    return erro?.response?.data?.mensagem || erro?.response?.data?.erro || erro?.message || "Não foi possível conectar ao servidor.";
}