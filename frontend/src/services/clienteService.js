import axios from "axios";

// Comunicação com a API do backend (rotas de cliente)
const api = axios.create({
  baseURL: "http://localhost:3000/api",
});

// GET /api/clientes  -> [ { id_cliente, nome, telefone }, ... ]
export async function listarClientes() {
  const resposta = await api.get("/clientes");
  return resposta.data;
}

// GET /api/clientes/buscar?termo=...  -> [ { id_cliente, nome, telefone }, ... ]
export async function buscarClientes(termo) {
  const resposta = await api.get("/clientes/buscar", { params: { termo } });
  return resposta.data;
}

// POST /api/clientes  { nome, telefone }  -> 201 { id_cliente, nome, telefone }
export async function cadastrarCliente(dados) {
  const resposta = await api.post("/clientes", dados);
  return resposta.data;
}

// PUT /api/clientes/:id  { nome, telefone }  -> { id_cliente, nome, telefone }
export async function atualizarCliente(id, dados) {
  const resposta = await api.put(`/clientes/${id}`, dados);
  return resposta.data;
}

// DELETE /api/clientes/:id  -> { mensagem }
export async function excluirCliente(id) {
  const resposta = await api.delete(`/clientes/${id}`);
  return resposta.data;
}

// Os erros do backend vêm como { mensagem } com status 400/500.
// Sem resposta (servidor desligado, CORS etc.), mostra mensagem genérica.
export function mensagemDeErro(erro) {
  return (
    erro?.response?.data?.mensagem ||
    "Não foi possível conectar ao servidor."
  );
}