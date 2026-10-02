import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import {
  listarClientes,
  buscarClientes,
  excluirCliente,
  mensagemDeErro,
} from "../../services/clienteService.js";

// Reaproveita .conteudo-principal e .linha-titulo da Home
import "../Home/home.css";
import "./clientes.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const POR_PAGINA = 4;

function Clientes() {
  const navigate = useNavigate();

  // Lista vinda do backend. Cada item: { id_cliente, nome, telefone }
  const [clientes, setClientes] = useState([]);

  const [busca, setBusca] = useState("");          // texto digitado
  const [termo, setTermo] = useState("");          // termo aplicado no filtro
  const [alerta, setAlerta] = useState(null);      // null | "vazio" | "invalido"
  const [erroServidor, setErroServidor] = useState(null);
  const [pagina, setPagina] = useState(1);

  // Exclusão
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [mensagem, setMensagem] = useState(null);  // { tipo: "sucesso" | "erro", texto }

  // Busca no backend: lista tudo ou filtra pelo termo (/clientes/buscar)
  const carregarClientes = async (termoBusca = "") => {
    try {
      const dados = termoBusca
        ? await buscarClientes(termoBusca)
        : await listarClientes();

      setClientes(dados);
      setErroServidor(null);
    } catch (erro) {
      console.error("Erro ao carregar clientes:", erro);
      setErroServidor(mensagemDeErro(erro));
    }
  };

  // Carrega a lista assim que a página abrir
  useEffect(() => {
    carregarClientes();
  }, []);

  // ---------- Busca ----------
  const lidarComBusca = () => {
    const consulta = busca.trim();

    if (!consulta) {
      setAlerta("vazio");
      return;
    }

    // Apenas letras (com acento), números, espaço e ( ) + -
    const formatoValido = /^[\p{L}0-9\s()+-]+$/u;
    if (!formatoValido.test(consulta)) {
      setAlerta("invalido");
      return;
    }

    setAlerta(null);
    setTermo(consulta);
    setPagina(1);
    carregarClientes(consulta);
  };

  const limparBusca = () => {
    setBusca("");
    setTermo("");
    setAlerta(null);
    setPagina(1);
    carregarClientes();
  };

  const aoPressionarTecla = (e) => {
    if (e.key === "Enter") lidarComBusca();
  };

  // ---------- Edição ----------
  const editarCliente = (cliente) => {
    // Envia o cliente junto para a tela de edição já abrir preenchida
    navigate(`/clientes/${cliente.id_cliente}/editar`, { state: { cliente } });
  };

  // ---------- Exclusão ----------
  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem(null), 5000);
  };

  const confirmarExclusao = async () => {
    setExcluindo(true);
    try {
      // DELETE /api/clientes/:id
      await excluirCliente(clienteParaExcluir.id_cliente);
      setClienteParaExcluir(null);
      mostrarMensagem("sucesso", "Cliente excluído com sucesso!");
      await carregarClientes(termo);
    } catch (erro) {
      console.error("Erro ao excluir cliente:", erro);
      setClienteParaExcluir(null);
      // Ex.: "Não é possível excluir um cliente com eventos vinculados!"
      mostrarMensagem("erro", mensagemDeErro(erro));
    } finally {
      setExcluindo(false);
    }
  };

  // ---------- Paginação ----------
  const totalPaginas = Math.max(1, Math.ceil(clientes.length / POR_PAGINA));
  // Se a última página esvaziar (ex.: após excluir), volta para a anterior
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * POR_PAGINA;
  const clientesDaPagina = clientes.slice(inicio, inicio + POR_PAGINA);

  const primeiroItem = clientes.length === 0 ? 0 : inicio + 1;
  const ultimoItem = inicio + clientesDaPagina.length;

  return (
    <>
      <Navbar />
      <div className="conteudo-principal">
        <div className="linha-titulo">
          <CabecalhoPagina
            titulo="Gestão de Clientes"
            subtitulo="Visualize, edite e gerencie sua base de clientes cadastrados."
          />
          <Botao onClick={() => navigate("/clientes/novo")}>
            + Novo Cliente
          </Botao>
        </div>

        {/* Alertas de feedback */}
        {mensagem && (
          <div
            className={`alerta ${mensagem.tipo === "sucesso" ? "alerta-sucesso" : "alerta-erro"}`}
            role="alert"
          >
            <span className="alerta-icone">{mensagem.tipo === "sucesso" ? "✓" : "⚠"}</span>
            <span>{mensagem.texto}</span>
          </div>
        )}
        {erroServidor && (
          <div className="alerta alerta-erro" role="alert">
            <span className="alerta-icone">⚠</span>
            <span>{erroServidor}</span>
          </div>
        )}
        {alerta === "vazio" && (
          <div className="alerta alerta-erro" role="alert">
            <span className="alerta-icone">⚠</span>
            <span>Preencha a barra de pesquisa!</span>
          </div>
        )}
        {alerta === "invalido" && (
          <div className="alerta alerta-aviso" role="alert">
            <span className="alerta-icone">ℹ</span>
            <span>
              Formato inválido! Certifique-se de usar apenas letras ou números válidos.
            </span>
          </div>
        )}

        {/* Card de pesquisa */}
        <div className="cartao-busca">
          <div className="campo-busca">
            <svg className="icone-busca" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={aoPressionarTecla}
              placeholder="Pesquisar por nome ou telefone..."
            />
          </div>
          <button className="botao-filtrar" onClick={lidarComBusca}>
            Filtrar Resultados
          </button>
        </div>

        {/* Tabela */}
        <div className="cartao-tabela">
          {clientes.length === 0 ? (
            termo !== "" ? (
              <div className="estado-vazio">
                <div className="estado-vazio-icone">👤</div>
                <h3>Nenhum resultado encontrado!</h3>
                <p>Tente ajustar seus filtros ou termos de pesquisa para encontrar o que procura.</p>
                <button className="link-limpar" onClick={limparBusca}>
                  Limpar filtros
                </button>
              </div>
            ) : (
              <p className="mensagem-vazia-tabela">Nenhum cliente cadastrado.</p>
            )
          ) : (
            <div className="tabela-scroll">
              <table className="tabela-clientes">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th className="coluna-acoes">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesDaPagina.map((cliente) => (
                    <tr key={cliente.id_cliente}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.telefone}</td>
                      <td className="coluna-acoes">
                        <div className="grupo-acoes">
                          <button
                            className="botao-icone"
                            title="Editar"
                            onClick={() => editarCliente(cliente)}
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            className="botao-icone botao-icone-excluir"
                            title="Excluir"
                            onClick={() => setClienteParaExcluir(cliente)}
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          <div className="rodape-tabela">
            <span className="info-paginacao">
              Exibindo {primeiroItem}-{ultimoItem} de {clientes.length} clientes
            </span>
            <div className="paginacao">
              <button
                className="botao-pagina"
                disabled={paginaAtual === 1}
                onClick={() => setPagina(paginaAtual - 1)}
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`botao-pagina ${n === paginaAtual ? "ativa" : ""}`}
                  onClick={() => setPagina(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="botao-pagina"
                disabled={paginaAtual === totalPaginas}
                onClick={() => setPagina(paginaAtual + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmação de exclusão */}
      {clienteParaExcluir && (
        <div
          className="modal-fundo"
          onClick={() => !excluindo && setClienteParaExcluir(null)}
        >
          <div
            className="modal-caixa"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Excluir cliente?</h3>
            <p>
              Tem certeza que deseja excluir <strong>{clienteParaExcluir.nome}</strong>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="modal-acoes">
              <button
                className="modal-botao-cancelar"
                disabled={excluindo}
                onClick={() => setClienteParaExcluir(null)}
              >
                Cancelar
              </button>
              <button
                className="modal-botao-excluir"
                disabled={excluindo}
                onClick={confirmarExclusao}
              >
                {excluindo ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Clientes;
