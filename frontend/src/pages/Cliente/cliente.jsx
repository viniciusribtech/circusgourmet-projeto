import { useEffect, useState } from "react";

import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import CampoPesquisa from "../../components/CampoPesquisa/campoPesquisa.jsx";
import TabelaCliente from "../../components/TabelaCliente/tabelaCliente.jsx";
import Paginacao from "../../components/Paginacao/paginacao.jsx";
import PopUpFormulario from "../../components/PopUpFormulario/popUpFormulario.jsx";
import PopUpConfirmacao from "../../components/PopUpConfirmacao/popUpConfirmacao.jsx";

import "./cliente.css";

function Clientes() {
    const [clientes, setClientes] = useState([]);

    const [termo, setTermo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);

    const [popupAberto, setPopupAberto] = useState(false);
    const [clienteEditando, setClienteEditando] = useState(null);

    const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);
    const [clienteExcluindo, setClienteExcluindo] = useState(null);

    const clientesPorPagina = 4;

    /*
     * BUSCAR TODOS OS CLIENTES
     */
    const carregarClientes = async () => {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await fetch(
                "http://localhost:3000/api/clientes"
            );

            if (!resposta.ok) {
                throw new Error("Erro ao buscar clientes.");
            }

            const dados = await resposta.json();

            setClientes(dados);
            setPaginaAtual(1);

        } catch (erro) {
            console.error(erro);
            setErro("Não foi possível carregar os clientes.");
        } finally {
            setCarregando(false);
        }
    };

    /*
     * CARREGAR CLIENTES QUANDO A PÁGINA ABRIR
     */
    useEffect(() => {
        carregarClientes();
    }, []);

    /*
     * PESQUISAR CLIENTES
     */
    const pesquisarClientes = async () => {
        try {
            setCarregando(true);
            setErro("");

            if (termo.trim() === "") {
                await carregarClientes();
                return;
            }

            const resposta = await fetch(
                `http://localhost:3000/api/clientes/buscar?termo=${encodeURIComponent(termo)}`
            );

            if (!resposta.ok) {
                throw new Error("Erro ao pesquisar clientes.");
            }

            const dados = await resposta.json();

            setClientes(dados);
            setPaginaAtual(1);

        } catch (erro) {
            console.error(erro);
            setErro("Não foi possível realizar a pesquisa.");
        } finally {
            setCarregando(false);
        }
    };

    /*
     * ABRIR POP-UP PARA NOVO CLIENTE
     */
    const abrirCadastro = () => {
        setClienteEditando(null);
        setPopupAberto(true);
    };

    /*
     * ABRIR POP-UP PARA EDITAR CLIENTE
     */
    const abrirEdicao = (cliente) => {
        setClienteEditando(cliente);
        setPopupAberto(true);
    };

    /*
     * FECHAR POP-UP
     */
    const fecharPopup = () => {
        setPopupAberto(false);
        setClienteEditando(null);
    };

    /*
     * CADASTRAR OU EDITAR CLIENTE
     */
    const salvarCliente = async (dados) => {
        try {
            let resposta;

            if (clienteEditando) {
                resposta = await fetch(
                    `http://localhost:3000/api/clientes/${clienteEditando.id_cliente}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(dados)
                    }
                );
            } else {
                resposta = await fetch(
                    "http://localhost:3000/api/clientes",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(dados)
                    }
                );
            }

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Erro ao salvar cliente."
                );
            }

            fecharPopup();
            await carregarClientes();

        } catch (erro) {
            console.error(erro);

            alert(
                erro.message || "Não foi possível salvar o cliente."
            );
        }
    };

    /*
     * EXCLUIR CLIENTE
     *
     * ADICIONADO:
     * Agora apenas abre o popup de confirmação.
     */
    const excluirCliente = (cliente) => {
        setClienteExcluindo(cliente);
        setPopupExclusaoAberto(true);
    };

    /*
     * ADICIONADO:
     * EXCLUIR CLIENTE APÓS CONFIRMAÇÃO
     */
    const confirmarExclusao = async () => {
        try {
            const resposta = await fetch(
                `http://localhost:3000/api/clientes/${clienteExcluindo.id_cliente}`,
                {
                    method: "DELETE"
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem || "Erro ao excluir cliente."
                );
            }

            setPopupExclusaoAberto(false);
            setClienteExcluindo(null);

            await carregarClientes();

        } catch (erro) {
            console.error(erro);

            alert(
                erro.message || "Não foi possível excluir o cliente."
            );
        }
    };

    /*
     * PAGINAÇÃO
     */
    const totalPaginas = Math.ceil(
        clientes.length / clientesPorPagina
    );

    const indiceInicial =
        (paginaAtual - 1) * clientesPorPagina;

    const clientesDaPagina = clientes.slice(
        indiceInicial,
        indiceInicial + clientesPorPagina
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

            <main className="pagina-clientes">

                <div className="cabecalho-clientes">

                    <CabecalhoPagina
                        titulo="Gestão de Clientes"
                        subtitulo="Visualize, edite e gerencie sua base de clientes cadastrados."
                    />

                    <Botao onClick={abrirCadastro}>
                        Novo Cliente
                    </Botao>

                </div>


                <div className="area-filtros">

                    <CampoPesquisa
                        valor={termo}
                        onChange={setTermo}
                        onPesquisar={pesquisarClientes}
                        placeholder="Pesquisar por nome ou telefone..."
                    />

                </div>


                {carregando ? (

                    <div className="mensagem-tabela">
                        Carregando clientes...
                    </div>

                ) : erro ? (

                    <div className="mensagem-tabela erro">
                        {erro}
                    </div>

                ) : (

                    <>
                        <TabelaCliente
                            clientes={clientesDaPagina}
                            onEditar={abrirEdicao}
                            onExcluir={excluirCliente}
                        />

                        <div className="rodape-tabela">

                            <span>
                                Exibindo{" "}
                                {clientes.length === 0
                                    ? 0
                                    : indiceInicial + 1}
                                -
                                {Math.min(
                                    indiceInicial + clientesPorPagina,
                                    clientes.length
                                )}{" "}
                                de {clientes.length} clientes
                            </span>

                            <Paginacao
                                paginaAtual={paginaAtual}
                                totalPaginas={totalPaginas}
                                onMudarPagina={mudarPagina}
                            />

                        </div>
                    </>

                )}


                <footer className="rodape-clientes">
                    © 2024 Circus Gourmet - Premium Catering Solutions
                </footer>

            </main>


            <PopUpFormulario
                aberto={popupAberto}
                titulo={
                    clienteEditando
                        ? "Editar Cliente"
                        : "Novo Cliente"
                }
                subtitulo={
                    clienteEditando
                        ? "Edite os dados do cliente."
                        : "Cadastre os detalhes do cliente para iniciar o atendimento gourmet."
                }
                cliente={clienteEditando}
                campos={[
                    {
                        nome: "nome",
                        label: "Nome",
                        placeholder: "Ex: Carlos"
                    },
                    {
                        nome: "telefone",
                        label: "Telefone",
                        placeholder: "(11) 99999-9999"
                    }
                ]}
                onSalvar={salvarCliente}
                onFechar={fecharPopup}
            />

    
            <PopUpConfirmacao
                aberto={popupExclusaoAberto}
                titulo="Excluir cliente"
                mensagem={
                    clienteExcluindo
                        ? `Deseja realmente excluir o cliente "${clienteExcluindo.nome}"?`
                        : ""
                }
                onConfirmar={confirmarExclusao}
                onFechar={() => {
                    setPopupExclusaoAberto(false);
                    setClienteExcluindo(null);
                }}
            />

        </>
    );
}

export default Clientes;