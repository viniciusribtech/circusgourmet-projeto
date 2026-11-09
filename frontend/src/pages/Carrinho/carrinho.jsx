import { useEffect, useState } from "react";
import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import CampoPesquisa from "../../components/CampoPesquisa/campoPesquisa.jsx";
import TabelaGenerica from "../../components/TabelaGenerica/tabelaGenerica.jsx";
import Paginacao from "../../components/Paginacao/paginacao.jsx";
import PopUpFormulario from "../../components/PopUpFormulario/popUpFormulario.jsx";
import PopUpConfirmacao from "../../components/PopUpConfirmacao/popUpConfirmacao.jsx";

import {
  listarCarrinhos,
  buscarCarrinhos,
  cadastrarCarrinho,
  atualizarCarrinho,
  excluirCarrinho,
  mensagemDeErro
} from "../../services/carrinhoService.js";

import "./carrinho.css";

function Carrinhos() {
  const [carrinhos, setCarrinhos] = useState([]);
  const [termo, setTermo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const carrinhosPorPagina = 4;

  const [popupAberto, setPopupAberto] = useState(false);
  const [carrinhoEditando, setCarrinhoEditando] = useState(null);

  const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);
  const [carrinhoExcluindo, setCarrinhoExcluindo] = useState(null);

  const colunas = [
    { titulo: "ID", campo: "id_carrinho", largura: "80px" },
    { titulo: "TIPO BASE", campo: "tipo_base" },
    { 
      titulo: "CAPACIDADE", 
      campo: "capacidade", 
      render: (item) => `${item.capacidade} pessoas` 
    },
    {
      titulo: "STATUS",
      campo: "ativo",
      render: (item) => (
        <span className={`badge-status ${item.ativo ? "ativo" : "inativo"}`}>
          {item.ativo ? "Ativo" : "Inativo"}
        </span>
      )
    }
  ];

  const carregarCarrinhos = async () => {
    try {
      setCarregando(true);
      setErro("");
      const dados = await listarCarrinhos();
      setCarrinhos(dados);
      setPaginaAtual(1);
    } catch (err) {
      console.error(err);
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarCarrinhos();
  }, []);

  const pesquisarCarrinhos = async () => {
    const pesquisa = termo.trim();
    if (!pesquisa) {
      setErro("Preencha a barra de pesquisa!");
      return;
    }

    try {
      setCarregando(true);
      setErro("");
      const dados = await buscarCarrinhos(pesquisa);
      setCarrinhos(dados);
      setPaginaAtual(1);
      if (dados.length === 0) setErro("Resultados não encontrados!");
    } catch (err) {
      console.error(err);
      setErro(mensagemDeErro(err));
    } finally {
      setCarregando(false);
    }
  };

  const limparPesquisa = async () => {
    setTermo("");
    setErro("");
    await carregarCarrinhos();
  };

  const abrirCadastro = () => {
    setCarrinhoEditando(null);
    setPopupAberto(true);
  };

  const abrirEdicao = (carrinho) => {
    setCarrinhoEditando(carrinho);
    setPopupAberto(true);
  };

  const fecharPopup = () => {
    setPopupAberto(false);
    setCarrinhoEditando(null);
  };

  const salvarCarrinho = async (dados) => {
    try {
      if (carrinhoEditando) {
        await atualizarCarrinho(carrinhoEditando.id_carrinho, dados);
      } else {
        await cadastrarCarrinho(dados);
      }
      fecharPopup();
      await carregarCarrinhos();
    } catch (err) {
      console.error(err);
      alert(mensagemDeErro(err));
    }
  };

  const excluirCarrinhoSelecionado = (carrinho) => {
    setCarrinhoExcluindo(carrinho);
    setPopupExclusaoAberto(true);
  };

  const confirmarExclusao = async () => {
    try {
      await excluirCarrinho(carrinhoExcluindo.id_carrinho);
      setPopupExclusaoAberto(false);
      setCarrinhoExcluindo(null);
      await carregarCarrinhos();
    } catch (err) {
      console.error(err);
      alert(mensagemDeErro(err));
    }
  };

  const totalPaginas = Math.ceil(carrinhos.length / carrinhosPorPagina);
  const indiceInicial = (paginaAtual - 1) * carrinhosPorPagina;
  const carrinhosDaPagina = carrinhos.slice(indiceInicial, indiceInicial + carrinhosPorPagina);

  const mudarPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) setPaginaAtual(pagina);
  };

  return (
    <>
      <Navbar />

      <main className="pagina-carrinhos">
        <div className="cabecalho-carrinhos">
          <CabecalhoPagina
            titulo="Gestão de Carrinhos"
            subtitulo="Gerencie os carrinhos gourmet e suas capacidades de atendimento."
          />
          <Botao onClick={abrirCadastro}>Novo Carrinho</Botao>
        </div>

        <div className="area-filtros">
          <CampoPesquisa
            valor={termo}
            onChange={setTermo}
            onPesquisar={pesquisarCarrinhos}
            onLimpar={limparPesquisa}
            placeholder="Pesquisar por tipo de base ou ID..."
          />
        </div>

        {carregando ? (
          <div className="mensagem-tabela">Carregando carrinhos...</div>
        ) : erro ? (
          <div className="mensagem-tabela erro">{erro}</div>
        ) : (
          <>
            <TabelaGenerica
              colunas={colunas}
              dados={carrinhosDaPagina}
              chaveId="id_carrinho"
              onEditar={abrirEdicao}
              onExcluir={excluirCarrinhoSelecionado}
              mensagemVazia="Nenhum carrinho encontrado."
            />

            <div className="rodape-tabela">
              <span>
                Exibindo {carrinhos.length === 0 ? 0 : indiceInicial + 1}-
                {Math.min(indiceInicial + carrinhosPorPagina, carrinhos.length)} de{" "}
                {carrinhos.length} carrinhos
              </span>

              <Paginacao
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                onMudarPagina={mudarPagina}
              />
            </div>
          </>
        )}
      </main>

      <PopUpFormulario
        aberto={popupAberto}
        titulo={carrinhoEditando ? "Editar Carrinho" : "Novo Carrinho"}
        subtitulo={
          carrinhoEditando
            ? "Edite os dados técnicos do carrinho."
            : "Cadastre as informações técnicas do novo carrinho para a frota."
        }
        cliente={carrinhoEditando}
        campos={[
          {
            nome: "tipo_base",
            label: "Tipo de Base",
            placeholder: "Ex: Pequeno, Medio, Grande"
          },
          {
            nome: "capacidade",
            label: "Capacidade (pessoas)",
            placeholder: "Ex: 50"
          },
          {
            nome: "ativo",
            label: "Status (1 para Ativo, 0 para Inativo)",
            placeholder: "1"
          }
        ]}
        onSalvar={salvarCarrinho}
        onFechar={fecharPopup}
      />

      <PopUpConfirmacao
        aberto={popupExclusaoAberto}
        titulo="Excluir carrinho"
        mensagem={
          carrinhoExcluindo
            ? `Deseja realmente excluir o carrinho #${carrinhoExcluindo.id_carrinho} (${carrinhoExcluindo.tipo_base})?`
            : ""
        }
        onConfirmar={confirmarExclusao}
        onFechar={() => {
          setPopupExclusaoAberto(false);
          setCarrinhoExcluindo(null);
        }}
      />
    </>
  );
}

export default Carrinhos;