import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
    headers: { "Content-Type": "application/json" }
});

export async function listarInsumos() {
    const resposta = await api.get("/insumos");
    return resposta.data;
}


export async function buscarInsumos(termoPesquisado) {
    const termo = String(termoPesquisado ?? "").trim();
    if (!termo) return listarInsumos();
    const resposta = await api.get("/insumos/buscar", { params: { pesquisa: termo } });
    return resposta.data;
}

function prepararDadosDoInsumo(dadosDoInsumo) {
    const nome = String(dadosDoInsumo.nome ?? "").trim();
    const custoDigitado = String(dadosDoInsumo.custo_unitario ?? "").trim();
    const custoNormalizado = custoDigitado.replace(",", ".");
    const custoUnitario = Number(custoNormalizado);

    if (!nome) throw new Error("O nome do insumo é obrigatório!");
    if (!custoDigitado || !Number.isFinite(custoUnitario) || custoUnitario < 0) {
        throw new Error("Informe um custo unitário válido e não negativo.");
    }
    return { nome, custo_unitario: custoUnitario };
}

export async function cadastrarInsumo(dadosDoInsumo) {
    const dadosValidados = prepararDadosDoInsumo(dadosDoInsumo);
    const resposta = await api.post("/insumos", dadosValidados);
    return resposta.data;
}

export async function atualizarInsumo(idDoInsumo, dadosDoInsumo) {
    const dadosValidados = prepararDadosDoInsumo(dadosDoInsumo);
    const resposta = await api.put(`/insumos/${idDoInsumo}`, dadosValidados);
    return resposta.data;
}

export async function excluirInsumo(idDoInsumo) {
    const resposta = await api.delete(`/insumos/${idDoInsumo}`);
    return resposta.data;
}

export function mensagemDeErro(erro) {
    return erro?.response?.data?.erro ||
        erro?.response?.data?.mensagem ||
        erro?.message ||
        "Não foi possível conectar ao servidor.";
}