import { useEffect, useState } from "react";

import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import CampoPesquisa from "../../components/CampoPesquisa/campoPesquisa.jsx";
import TabelaInsumo from "../../components/TabelaInsumo/tabelaInsumo.jsx";
import Paginacao from "../../components/Paginacao/paginacao.jsx";
import PopUpFormulario from "../../components/PopUpFormulario/popUpFormulario.jsx";
import PopUpConfirmacao from "../../components/PopUpConfirmacao/popUpConfirmacao.jsx";

import {
    listarInsumos,
    buscarInsumos,
    cadastrarInsumo,
    atualizarInsumo,
    excluirInsumo,
    mensagemDeErro
} from "../../services/insumoService.js";

import "./insumo.css";

function Insumos() {
    const [insumos, setInsumos] = useState([]);

    const [termo, setTermo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [popupAberto, setPopupAberto] = useState(false);
    const [insumoEditando, setInsumoEditando] = useState(null);

    const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);
    const [insumoExcluindo, setInsumoExcluindo] = useState(null);

    const insumosPorPagina = 4;

    /*
     * BUSCAR TODOS OS INSUMOS
     */
    const carregarInsumos = async () => {
        try {
            setCarregando(true);
            setErro("");

            const dados = await listarInsumos();

            setInsumos(dados);
            setPaginaAtual(1);

        } catch (erro) {
            console.error(erro);
            setErro(mensagemDeErro(erro));
        } finally {
            setCarregando(false);
        }
    };

    /*
     * CARREGAR INSUMOS QUANDO A PÁGINA ABRIR
     */
    useEffect(() => {
        carregarInsumos();
    }, []);

    /*
     * PESQUISAR INSUMOS
     */
    const pesquisarInsumos = async () => {
        try {
            setCarregando(true);
            setErro("");

            if (termo.trim() === "") {
                await carregarInsumos();
                return;
            }

            const dados = await buscarInsumos(termo);

            setInsumos(dados);
            setPaginaAtual(1);

        } catch (erro) {
            console.error(erro);
            setErro(mensagemDeErro(erro));
        } finally {
            setCarregando(false);
        }
    };

    /*
     * ABRIR POP-UP PARA NOVO INSUMO
     */
    const abrirCadastro = () => {
        setInsumoEditando(null);
        setPopupAberto(true);
    };

    /*
     * ABRIR POP-UP PARA EDITAR INSUMO
     */
    const abrirEdicao = (insumo) => {
        setInsumoEditando(insumo);
        setPopupAberto(true);
    };

    /*
     * FECHAR POP-UP
     */
    const fecharPopup = () => {
        setPopupAberto(false);
        setInsumoEditando(null);
    };

    /*
     * CADASTRAR OU EDITAR INSUMO
     */
    const salvarInsumo = async (dados) => {
        try {

            if (insumoEditando) {
                await atualizarInsumo(
                    insumoEditando.id_insumo,
                    dados
                );
            } else {
                await cadastrarInsumo(dados);
            }

            fecharPopup();
            await carregarInsumos();

        } catch (erro) {
            console.error(erro);

            alert(
                mensagemDeErro(erro)
            );
        }
    };

    /*
     * EXCLUIR INSUMO
     *
     * Apenas abre o popup de confirmação.
     */
    const excluirInsumoSelecionado = (insumo) => {
        setInsumoExcluindo(insumo);
        setPopupExclusaoAberto(true);
    };

    /*
     * EXCLUIR INSUMO APÓS CONFIRMAÇÃO
     */
    const confirmarExclusao = async () => {
        try {

            await excluirInsumo(
                insumoExcluindo.id_insumo
            );

            setPopupExclusaoAberto(false);
            setInsumoExcluindo(null);

            await carregarInsumos();

        } catch (erro) {
            console.error(erro);

            alert(
                mensagemDeErro(erro)
            );
        }
    };

    /*
     * PAGINAÇÃO
     */
    const totalPaginas = Math.ceil(
        insumos.length / insumosPorPagina
    );

    const indiceInicial =
        (paginaAtual - 1) * insumosPorPagina;

    const insumosDaPagina = insumos.slice(
        indiceInicial,
        indiceInicial + insumosPorPagina
    );

    const mudarPagina = (pagina) => {
        if (pagina < 1 || pagina > totalPaginas) {
            return;
        }

        setPaginaAtual(pagina);
    };

    return (
        <>
            <Navbar />

            <main className="pagina-insumos">

                <div className="cabecalho-insumos">

                    <CabecalhoPagina
                        titulo="Controle de Insumos"
                        subtitulo="Gerencie seus insumos e custos."
                    />

                    <Botao onClick={abrirCadastro}>
                        Novo Insumo
                    </Botao>

                </div>


                <div className="area-filtros">

                    <CampoPesquisa
                        valor={termo}
                        onChange={setTermo}
                        onPesquisar={pesquisarInsumos}
                        placeholder="Pesquisar por nome..."
                    />

                </div>


                {carregando ? (

                    <div className="mensagem-tabela">
                        Carregando insumos...
                    </div>

                ) : erro ? (

                    <div className="mensagem-tabela erro">
                        {erro}
                    </div>

                ) : (

                    <>
                        <TabelaInsumo
                            insumos={insumosDaPagina}
                            onEditar={abrirEdicao}
                            onExcluir={excluirInsumoSelecionado}
                        />

                        <div className="rodape-tabela">

                            <span>
                                Exibindo{" "}
                                {insumos.length === 0
                                    ? 0
                                    : indiceInicial + 1}
                                -
                                {Math.min(
                                    indiceInicial + insumosPorPagina,
                                    insumos.length
                                )}{" "}
                                de {insumos.length} insumos
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
                titulo={
                    insumoEditando
                        ? "Editar Insumo"
                        : "Cadastro de Insumo"
                }
                subtitulo={
                    insumoEditando
                        ? "Edite os dados do insumo."
                        : "Preencha as informações técnicas do novo insumo gourmet para o seu inventário."
                }
                cliente={insumoEditando}
                campos={[
                    {
                        nome: "nome",
                        label: "Nome do insumo",
                        placeholder: "Nome do insumo"
                    },
                    {
                        nome: "custo_unitario",
                        label: "Custo unitário (R$)",
                        placeholder: "0,00"
                    }
                ]}
                onSalvar={salvarInsumo}
                onFechar={fecharPopup}
            />


            <PopUpConfirmacao
                aberto={popupExclusaoAberto}
                titulo="Excluir insumo"
                mensagem={
                    insumoExcluindo
                        ? `Deseja realmente excluir o insumo "${insumoExcluindo.nome}"?`
                        : ""
                }
                onConfirmar={confirmarExclusao}
                onFechar={() => {
                    setPopupExclusaoAberto(false);
                    setInsumoExcluindo(null);
                }}
            />

        </>
    );
}

export default Insumos;