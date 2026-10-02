import Navbar from "../../components/BarraNav/navbar.jsx";
import Botao from "../../components/Botao/botao.jsx";
import {
  cadastrarCliente,
  atualizarCliente,
  listarClientes,
  mensagemDeErro,
} from "../../services/clienteService.js";

import "./cadastroCliente.css";

import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Mesmos campos da tabela Cliente: nome VARCHAR(50), telefone VARCHAR(15)
const VALORES_INICIAIS = {
  nome: "",
  telefone: "",
};

// ---------- Máscara de telefone: (77) 99999-9999 (15 caracteres) ----------
function mascararTelefone(valor) {
  const d = (valor || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

// Esta tela serve para cadastrar (/clientes/novo) e editar (/clientes/:id/editar)
function CadastroCliente() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const modoEdicao = Boolean(id);

  // Na edição, abre já preenchido com o cliente enviado pela lista
  const [valores, setValores] = useState(() =>
    state?.cliente
      ? {
          nome: state.cliente.nome,
          telefone: mascararTelefone(state.cliente.telefone),
        }
      : VALORES_INICIAIS
  );
  const [erros, setErros] = useState({});
  const [erroEnvio, setErroEnvio] = useState(null); // mensagem vinda do backend
  const [enviando, setEnviando] = useState(false);
  const [toastVisivel, setToastVisivel] = useState(false);

  // Edição aberta direto pela URL (ex.: F5): o backend não tem busca por id,
  // então procura o cliente na lista
  useEffect(() => {
    if (!modoEdicao || state?.cliente) return;

    const carregarCliente = async () => {
      try {
        const lista = await listarClientes();
        const cliente = lista.find((c) => String(c.id_cliente) === id);

        if (cliente) {
          setValores({
            nome: cliente.nome,
            telefone: mascararTelefone(cliente.telefone),
          });
        } else {
          setErroEnvio("Cliente não encontrado.");
        }
      } catch (erro) {
        console.error("Erro ao carregar cliente:", erro);
        setErroEnvio(mensagemDeErro(erro));
      }
    };

    carregarCliente();
  }, [id, modoEdicao, state]);

  const atualizarCampo = (campo, valor) => {
    setValores((anterior) => ({ ...anterior, [campo]: valor }));
  };

  // ---------- Validação ----------
  const validar = () => {
    const novosErros = {};

    if (!valores.nome.trim()) {
      novosErros.nome = "Este campo é obrigatório.";
    }
    if (!valores.telefone.trim()) {
      novosErros.telefone = "Telefone é obrigatório para contato.";
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const mostrarToast = () => {
    setToastVisivel(true);
    setTimeout(() => {
      setToastVisivel(false);
      navigate("/clientes");
    }, 2000);
  };

  // ---------- Envio ----------
  const aoEnviar = async (e) => {
    e.preventDefault();
    setErroEnvio(null);

    if (!validar()) return;

    setEnviando(true);
    try {
      const dados = {
        nome: valores.nome.trim(),
        telefone: valores.telefone,
      };

      if (modoEdicao) {
        // PUT /api/clientes/:id  { nome, telefone }
        await atualizarCliente(id, dados);
      } else {
        // POST /api/clientes  { nome, telefone }  -> 201
        await cadastrarCliente(dados);
        setValores(VALORES_INICIAIS);
      }

      setErros({});
      mostrarToast();
    } catch (erro) {
      console.error("Erro ao salvar cliente:", erro);
      setErroEnvio(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="pagina-cadastro">
        <div className="cartao-cadastro">
          <div className="barra-dourada" />

          <div className="cartao-cadastro-corpo">
            <div className="cadastro-cabecalho">
              <h1>{modoEdicao ? "Editar Cliente" : "Novo Cliente"}</h1>
              <p>
                {modoEdicao
                  ? "Atualize os dados do cliente e salve as alterações."
                  : "Cadastre os detalhes do cliente para iniciar o atendimento gourmet."}
              </p>
            </div>

            <form className="form-cadastro" onSubmit={aoEnviar} noValidate>
              {/* Nome */}
              <div className="campo">
                <label htmlFor="nome">
                  Nome <span className="obrigatorio">*</span>
                </label>
                <input
                  id="nome"
                  type="text"
                  maxLength={50}
                  placeholder="Ex: Carlos Silva"
                  value={valores.nome}
                  onChange={(e) => atualizarCampo("nome", e.target.value)}
                  className={erros.nome ? "com-erro" : ""}
                />
                <span className="mensagem-erro">{erros.nome}</span>
              </div>

              {/* Telefone */}
              <div className="campo">
                <label htmlFor="telefone">
                  Telefone <span className="obrigatorio">*</span>
                </label>
                <input
                  id="telefone"
                  type="tel"
                  maxLength={15}
                  placeholder="(77) 99999-9999"
                  value={valores.telefone}
                  onChange={(e) =>
                    atualizarCampo("telefone", mascararTelefone(e.target.value))
                  }
                  className={erros.telefone ? "com-erro" : ""}
                />
                <span className="mensagem-erro">{erros.telefone}</span>
              </div>

              {/* Erro devolvido pelo backend / falha de conexão */}
              {erroEnvio && (
                <div className="aviso-erro" role="alert">
                  <span className="aviso-icone">⚠</span>
                  <div>
                    <p className="aviso-titulo">
                      {modoEdicao ? "Não foi possível salvar" : "Não foi possível cadastrar"}
                    </p>
                    <p>{erroEnvio}</p>
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="form-acoes">
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={() => navigate("/clientes")}
                >
                  Cancelar
                </button>
                <Botao type="submit" disabled={enviando}>
                  {enviando
                    ? "Salvando..."
                    : modoEdicao
                    ? "Salvar alterações"
                    : "Cadastrar"}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast de sucesso */}
      <div className={`toast-sucesso ${toastVisivel ? "visivel" : ""}`}>
        <span className="toast-icone">✓</span>
        <span>
          {modoEdicao
            ? "Cliente atualizado com sucesso!"
            : "Cliente cadastrado com sucesso!"}
        </span>
      </div>
    </>
  );
}

export default CadastroCliente;
