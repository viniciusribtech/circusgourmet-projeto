import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

export async function listarOrcamentos() {
    const resposta = await api.get("/orcamentos");
    return resposta.data;
}

export async function buscarOrcamentos(termo) {
    const pesquisa = String(termo ?? "").trim();
    if (!pesquisa) return listarOrcamentos();
    const resposta = await api.get("/orcamentos/buscar", { params: { termo: pesquisa } });
    return resposta.data;
}

export async function listarEventosParaOrcamento() {
    const resposta = await api.get("/orcamentos/eventos-disponiveis");
    return resposta.data;
}

export async function calcularPreviaOrcamento(eventoId, desconto = 0) {
    const resposta = await api.get("/orcamentos/calcular", {
        params: { eventoId, desconto }
    });
    return resposta.data;
}

export async function cadastrarOrcamento(dados) {
    const resposta = await api.post("/orcamentos", dados);
    return resposta.data;
}

export async function atualizarOrcamento(id, dados) {
    const resposta = await api.put(`/orcamentos/${id}`, dados);
    return resposta.data;
}

export async function excluirOrcamento(id) {
    const resposta = await api.delete(`/orcamentos/${id}`);
    return resposta.data;
}

export function mensagemDeErro(erro) {
    return (
        erro?.response?.data?.mensagem ||
        erro?.response?.data?.erro ||
        erro?.message ||
        "Não foi possível conectar ao servidor."
    );
}