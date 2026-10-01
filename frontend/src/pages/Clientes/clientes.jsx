import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";

// Reaproveita .conteudo-principal e .linha-titulo da Home
import "../Home/home.css";
import "./clientes.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const POR_PAGINA = 4;

function Clientes() {
  const navigate = useNavigate();

  // Lista vinda do backend (MySQL). Formato esperado de cada item:
  // { id, nome, sobrenome, telefone }
  const [clientes, setClientes] = useState([]);

  const [busca, setBusca] = useState("");          // texto digitado
  const [termo, setTermo] = useState("");          // termo aplicado no filtro
  const [alerta, setAlerta] = useState(null);      // null | "vazio" | "invalido"
  const [pagina, setPagina] = useState(1);

  // Chama o backend assim que a página carregar (mesmo padrão da Home)
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        // TODO (backend): rota GET de clientes
        const resposta = await fetch("http://localhost:3000/api/clientes");
        const json = await resposta.json();

        if (json.success) {
          setClientes(json.data);
        }
      } catch (erro) {
        console.error("Erro na conexão com o backend:", erro);
      }
    };

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
    setTermo(consulta.toLowerCase());
    setPagina(1);
  };

  const limparBusca = () => {
    setBusca("");
    setTermo("");
    setAlerta(null);
    setPagina(1);
  };

  const aoPressionarTecla = (e) => {
    if (e.key === "Enter") lidarComBusca();
  };

  // ---------- Filtro + paginação ----------
  const clientesFiltrados = clientes.filter((c) =>
    termo === ""
      ? true
      : `${c.nome} ${c.sobrenome} ${c.telefone}`.toLowerCase().includes(termo)
  );

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / POR_PAGINA));
  const inicio = (pagina - 1) * POR_PAGINA;
  const clientesDaPagina = clientesFiltrados.slice(inicio, inicio + POR_PAGINA);

  const primeiroItem = clientesFiltrados.length === 0 ? 0 : inicio + 1;
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
          {clientesFiltrados.length === 0 ? (
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
                    <th>Sobrenome</th>
                    <th>Telefone</th>
                    <th className="coluna-acoes">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesDaPagina.map((cliente) => (
                    <tr key={cliente.id}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.sobrenome}</td>
                      <td>{cliente.telefone}</td>
                      <td className="coluna-acoes">
                        <div className="grupo-acoes">
                          <button
                            className="botao-icone"
                            title="Editar"
                            onClick={() => alert(`Editar cliente ${cliente.id}`)}
                          >
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            className="botao-icone botao-icone-excluir"
                            title="Excluir"
                            onClick={() => alert(`Excluir cliente ${cliente.id}`)}
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
              Exibindo {primeiroItem}-{ultimoItem} de {clientesFiltrados.length} clientes
            </span>
            <div className="paginacao">
              <button
                className="botao-pagina"
                disabled={pagina === 1}
                onClick={() => setPagina(pagina - 1)}
              >
                ‹
              </button>
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`botao-pagina ${n === pagina ? "ativa" : ""}`}
                  onClick={() => setPagina(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="botao-pagina"
                disabled={pagina === totalPaginas}
                onClick={() => setPagina(pagina + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Clientes;
