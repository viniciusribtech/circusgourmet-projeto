// frontend/src/services/insumoService.js
//
// MOCK do serviço de insumos — apenas para testar a página de Insumos
// enquanto o back-end real não está pronto.

// "Banco de dados" em memória
let insumosMock = [
  { id_insumo: 1, nome: "Leite Condensado", custo_unitario: 40.00 },
  { id_insumo: 2, nome: "Granola", custo_unitario: 3.50 },
  { id_insumo: 3, nome: "Morango", custo_unitario: 1.50 },
  { id_insumo: 4, nome: "Vodka", custo_unitario: 2.00 },
  { id_insumo: 5, nome: "Leite", custo_unitario: 1.50 },
  { id_insumo: 6, nome: "Chocolate", custo_unitario: 2.50 },
  { id_insumo: 7, nome: "Refrigerante", custo_unitario: 4.00 },
  { id_insumo: 8, nome: "Queijo", custo_unitario: 5.00 },
  { id_insumo: 9, nome: "Presunto", custo_unitario: 3.00 },
  { id_insumo: 10, nome: "Café", custo_unitario: 6.00 },
];

let proximoId = 11;

// Simula o tempo de resposta de uma requisição HTTP
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// Simula erros ocasionais (opcional - remova se quiser)
const simularErro = false; // coloque true para testar mensagens de erro

// GET /api/insumos
export async function listarInsumos() {
  await delay();
  if (simularErro) throw new Error("Erro simulado");
  // Retorna em ordem decrescente (como o backend real faria)
  return [...insumosMock].sort((a, b) => b.id_insumo - a.id_insumo);
}

// GET /api/insumos/buscar?termo=...
export async function buscarInsumos(termo) {
  await delay();
  if (simularErro) throw new Error("Erro simulado");
  const termoLower = String(termo || "").toLowerCase();
  return insumosMock
    .filter((i) => i.nome.toLowerCase().includes(termoLower))
    .sort((a, b) => b.id_insumo - a.id_insumo);
}

// POST /api/insumos
export async function cadastrarInsumo(dados) {
  await delay();
  if (!dados.nome || !dados.custo_unitario) {
    throw new Error("Campos obrigatórios não preenchidos!");
  }

  const novo = {
    id_insumo: proximoId++,
    nome: dados.nome,
    custo_unitario: Number(dados.custo_unitario),
  };

  insumosMock.push(novo);
  return novo;
}

// PUT /api/insumos/:id
export async function atualizarInsumo(id, dados) {
  await delay();
  if (!dados.nome || !dados.custo_unitario) {
    throw new Error("Campos obrigatórios não preenchidos!");
  }

  const index = insumosMock.findIndex(
    (i) => i.id_insumo === Number(id)
  );

  if (index === -1) {
    throw new Error("Insumo não encontrado!");
  }

  insumosMock[index] = {
    id_insumo: Number(id),
    nome: dados.nome,
    custo_unitario: Number(dados.custo_unitario),
  };

  return insumosMock[index];
}

// DELETE /api/insumos/:id
export async function excluirInsumo(id) {
  await delay();
  const index = insumosMock.findIndex(
    (i) => i.id_insumo === Number(id)
  );

  if (index === -1) {
    throw new Error("Item já excluído ou não encontrado!");
  }

  insumosMock.splice(index, 1);
  return { mensagem: "Insumo excluído com sucesso!" };
}

// Mensagem de erro (mesma assinatura do clienteService real)
export function mensagemDeErro(erro) {
  return (
    erro?.response?.data?.mensagem ||
    erro?.message ||
    "Não foi possível conectar ao servidor."
  );
}