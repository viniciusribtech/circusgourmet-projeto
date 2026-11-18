import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api' });

export async function listarEventos() { return (await api.get('/eventos')).data; }
export async function buscarEventos(pesquisa) { return (await api.get('/eventos/buscar', { params: { pesquisa } })).data; }
export async function listarClientesEvento() { return (await api.get('/eventos/clientes')).data; }
export async function listarCidadesEvento() { return (await api.get('/eventos/cidades')).data; }
export async function obterEvento(id) { return (await api.get(`/eventos/${id}`)).data; }
export async function cadastrarEvento(dados) { return (await api.post('/eventos', dados)).data; }
export async function atualizarEvento(id, dados) { return (await api.put(`/eventos/${id}`, dados)).data; }
export async function excluirEvento(id) { return (await api.delete(`/eventos/${id}`)).data; }
export function mensagemErroEvento(erro) { return erro?.response?.data?.erro || erro?.message || 'Não foi possível concluir a operação.'; }
