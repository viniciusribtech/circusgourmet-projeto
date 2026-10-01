import Navbar from "../../components/BarraNav/navbar.jsx";
import Botao from "../../components/Botao/botao.jsx";

import "./cadastroCliente.css";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const VALORES_INICIAIS = {
  nome: "",
  sobrenome: "",
  telefone: "",
  cpfCnpj: "",
};

// ---------- Máscaras ----------
function mascararTelefone(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascararCpfCnpj(valor) {
  const d = valor.replace(/\D/g, "").slice(0, 14);

  // CPF: 000.000.000-00
  if (d.length <= 11) {
    let r = d.slice(0, 3);
    if (d.length > 3) r += `.${d.slice(3, 6)}`;
    if (d.length > 6) r += `.${d.slice(6, 9)}`;
    if (d.length > 9) r += `-${d.slice(9, 11)}`;
    return r;
  }

  // CNPJ: 00.000.000/0000-00
  let r = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}`;
  r += `/${d.slice(8, 12)}`;
  if (d.length > 12) r += `-${d.slice(12, 14)}`;
  return r;
}

function CadastroCliente() {
  const navigate = useNavigate();

  const [valores, setValores] = useState(VALORES_INICIAIS);
  const [erros, setErros] = useState({});
  const [duplicado, setDuplicado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [toastVisivel, setToastVisivel] = useState(false);

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

    const digitos = valores.cpfCnpj.replace(/\D/g, "");
    if (digitos.length !== 11 && digitos.length !== 14) {
      novosErros.cpfCnpj = "Formato de CPF/CNPJ inválido.";
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
    setDuplicado(false);

    if (!validar()) return;

    setEnviando(true);
    try {
      // TODO (backend): rota POST de cadastro de cliente
      const resposta = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: valores.nome.trim(),
          sobrenome: valores.sobrenome.trim(),
          telefone: valores.telefone,
          cpfCnpj: valores.cpfCnpj.replace(/\D/g, ""),
        }),
      });

      // Backend deve responder 409 quando o CPF/CNPJ já existir
      if (resposta.status === 409) {
        setDuplicado(true);
        return;
      }

      const json = await resposta.json();

      if (json.success) {
        setValores(VALORES_INICIAIS);
        setErros({});
        mostrarToast();
      } else {
        console.error("Erro ao cadastrar cliente:", json);
      }
    } catch (erro) {
      console.error("Erro na conexão com o backend:", erro);
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
              <h1>Novo Cliente</h1>
              <p>Cadastre os detalhes do cliente para iniciar o atendimento gourmet.</p>
            </div>

            <form className="form-cadastro" onSubmit={aoEnviar} noValidate>
              <div className="form-linha">
                {/* Nome */}
                <div className="campo">
                  <label htmlFor="nome">
                    Nome <span className="obrigatorio">*</span>
                  </label>
                  <input
                    id="nome"
                    type="text"
                    placeholder="Ex: Carlos"
                    value={valores.nome}
                    onChange={(e) => atualizarCampo("nome", e.target.value)}
                    className={erros.nome ? "com-erro" : ""}
                  />
                  <span className="mensagem-erro">{erros.nome}</span>
                </div>

                {/* Sobrenome */}
                <div className="campo">
                  <label htmlFor="sobrenome">Sobrenome (Opcional)</label>
                  <input
                    id="sobrenome"
                    type="text"
                    placeholder="Ex: Silva"
                    value={valores.sobrenome}
                    onChange={(e) => atualizarCampo("sobrenome", e.target.value)}
                  />
                  <span className="mensagem-erro" />
                </div>
              </div>

              {/* Telefone */}
              <div className="campo">
                <label htmlFor="telefone">
                  Telefone <span className="obrigatorio">*</span>
                </label>
                <input
                  id="telefone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={valores.telefone}
                  onChange={(e) =>
                    atualizarCampo("telefone", mascararTelefone(e.target.value))
                  }
                  className={erros.telefone ? "com-erro" : ""}
                />
                <span className="mensagem-erro">{erros.telefone}</span>
              </div>

              {/* CPF / CNPJ */}
              <div className="campo">
                <label htmlFor="cpfCnpj">
                  CPF / CNPJ <span className="obrigatorio">*</span>
                </label>
                <input
                  id="cpfCnpj"
                  type="text"
                  placeholder="000.000.000-00"
                  value={valores.cpfCnpj}
                  onChange={(e) =>
                    atualizarCampo("cpfCnpj", mascararCpfCnpj(e.target.value))
                  }
                  className={erros.cpfCnpj ? "com-erro" : ""}
                />
                <span className="mensagem-erro">{erros.cpfCnpj}</span>
              </div>

              {/* Aviso de duplicidade */}
              {duplicado && (
                <div className="aviso-duplicado" role="alert">
                  <span className="aviso-icone">⚠</span>
                  <div>
                    <p className="aviso-titulo">Cliente já existe</p>
                    <p>Um cliente com este CPF/CNPJ já consta no sistema.</p>
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
                  {enviando ? "Cadastrando..." : "Cadastrar"}
                </Botao>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast de sucesso */}
      <div className={`toast-sucesso ${toastVisivel ? "visivel" : ""}`}>
        <span className="toast-icone">✓</span>
        <span>Cliente cadastrado com sucesso!</span>
      </div>
    </>
  );
}

export default CadastroCliente;
