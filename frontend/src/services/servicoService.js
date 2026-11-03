import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
});

export async function listarServicos() {
    const resposta = await api.get('/servicos');
    return resposta.data;
}

export async function buscarServicos(termo) {
    const pesquisa = String(termo ?? '').trim();
    if (!pesquisa) throw new Error('Preencha a barra de pesquisa!');
    const resposta = await api.get('/servicos/buscar', { params: { pesquisa } });
    return resposta.data;
}

export async function listarCategoriasServico() {
    const resposta = await api.get('/servicos/categorias');
    return resposta.data;
}

export async function cadastrarServico(dados) {
    const nome = String(dados.nome ?? '').trim();
    const descricao = String(dados.descricao ?? '').trim();
    const precoBase = String(dados.preco_base ?? '').trim();
    if (!nome || !precoBase) throw new Error('Campos obrigatórios não preenchidos!');
    if (nome.length > 30) throw new Error('O nome do serviço não pode ultrapassar 30 caracteres.');
    if (descricao.length > 300) throw new Error('A descrição não pode ultrapassar 300 caracteres.');
    if (!/^\d{1,3}(?:[.,]\d{1,2})?$/.test(precoBase) || Number(precoBase.replace(',', '.')) > 999.99) {
        throw new Error('Preço base inválido. Informe de R$ 0,00 a R$ 999,99.');
    }
    const resposta = await api.post('/servicos', {
        nome,
        descricao: descricao || null,
        preco_base: precoBase.replace(',', '.'),
        fk_Categoria_id_categoria: dados.fk_Categoria_id_categoria || null
    });
    return resposta.data;
}

export function mensagemErroServico(erro) {
    return erro?.response?.data?.erro || erro?.message || 'Não foi possível realizar a operação.';
}

export async function obterServicoPorId(idServico) {
    const resposta = await api.get(`/servicos/${idServico}`);
    return resposta.data;
}

export async function atualizarServico(idServico, dados) {
    const nome = String(dados.nome ?? '').trim();
    const descricao = String(dados.descricao ?? '').trim();
    const precoBase = String(dados.preco_base ?? '').trim();
    if (!nome || !precoBase) throw new Error('Campos obrigatórios não preenchidos!');
    if (nome.length > 30 || descricao.length > 300) throw new Error('Os dados ultrapassam os limites do banco de dados.');
    if (!/^\d{1,3}(?:[.,]\d{1,2})?$/.test(precoBase) || Number(precoBase.replace(',', '.')) > 999.99) {
        throw new Error('Preço base inválido. Informe de R$ 0,00 a R$ 999,99.');
    }
    const resposta = await api.put(`/servicos/${idServico}`, {
        nome, descricao: descricao || null, preco_base: precoBase.replace(',', '.'),
        fk_Categoria_id_categoria: dados.fk_Categoria_id_categoria || null
    });
    return resposta.data;
}

export async function excluirServico(idServico) {
    const resposta = await api.delete(`/servicos/${idServico}`);
    return resposta.data;
}
