
import { useEffect, useState } from "react";
import axios from "axios";

import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import CampoPesquisa from "../../components/CampoPesquisa/campoPesquisa.jsx";
import TabelaGenerica from "../../components/TabelaGenerica/tabelaGenerica.jsx";
import Paginacao from "../../components/Paginacao/paginacao.jsx";
import PopUpConfirmacao from "../../components/PopUpConfirmacao/popUpConfirmacao.jsx";

import "./orcamento.css";

const api = axios.create({
    baseURL: "http://localhost:3000/api"
});

function mensagemDeErro(erro) {
    return (
        erro?.response?.data?.mensagem ||
        "Não foi possível conectar ao servidor."
    );
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    if (!data) return "-";

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) return "-";

    return dataFormatada.toLocaleDateString("pt-BR", {
        timeZone: "UTC"
    });
}

function Orcamento() {
    const [orcamentos, setOrcamentos] = useState([]);

    const [termo, setTermo] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    const [paginaAtual, setPaginaAtual] = useState(1);
    const orcamentosPorPagina = 5;

    const [popupAberto, setPopupAberto] = useState(false);
    const [orcamentoEditando, setOrcamentoEditando] = useState(null);

    const [popupExclusaoAberto, setPopupExclusaoAberto] = useState(false);
    const [orcamentoExcluindo, setOrcamentoExcluindo] = useState(null);

    const [dadosFormulario, setDadosFormulario] = useState({
        fk_Evento_id_evento: "",
        valor_total: "",
        desconto: "",
        sinal_pagamento: ""
    });

    const [erroFormulario, setErroFormulario] = useState("");

    // Calcula o valor final considerando o desconto.
    const valorFinal =
        Math.max(
            0,
            Number(dadosFormulario.valor_total || 0) -
            Number(dadosFormulario.desconto || 0)
        );

    // O sinal precisa corresponder a pelo menos 30% do valor final.
    const sinalMinimo = valorFinal * 0.3;

    // Carrega os orçamentos
    const carregarOrcamentos = async () => {
        try {
            setCarregando(true);
            setErro("");

            const resposta = await api.get("/orcamentos");

            setOrcamentos(resposta.data);
            setPaginaAtual(1);
        } catch (erro) {
            console.error(erro);
            setErro(mensagemDeErro(erro));
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarOrcamentos();
    }, []);

    // Pesquisa localmente pelos dados do orçamento e do evento.
    const orcamentosFiltrados = orcamentos.filter((orcamento) => {
        const pesquisa = termo.trim().toLocaleLowerCase("pt-BR");

        if (!pesquisa) return true;

        const campos = [
            orcamento.id_orcamento,
            orcamento.fk_Evento_id_evento,
            orcamento.nome_evento,
            orcamento.nome_cliente,
            orcamento.local,
            orcamento.status
        ];

        return campos.some((campo) =>
            String(campo ?? "")
                .toLocaleLowerCase("pt-BR")
                .includes(pesquisa)
        );
    });

    // Limpa a pesquisa
    const limparPesquisa = () => {
        setTermo("");
        setPaginaAtual(1);
        setErro("");
    };

    // Abre o formulário para cadastrar
    const abrirCadastro = () => {
        setOrcamentoEditando(null);

        setDadosFormulario({
            fk_Evento_id_evento: "",
            valor_total: "",
            desconto: "",
            sinal_pagamento: ""
        });

        setErroFormulario("");
        setPopupAberto(true);
    };

    // Abre o formulário para editar
    const abrirEdicao = (orcamento) => {
        setOrcamentoEditando(orcamento);

        setDadosFormulario({
            fk_Evento_id_evento: String(orcamento.fk_Evento_id_evento),
            valor_total: String(orcamento.valor_total),
            desconto: String(orcamento.desconto),
            sinal_pagamento: String(orcamento.sinal_pagamento)
        });

        setErroFormulario("");
        setPopupAberto(true);
    };

    // Fecha o formulário
    const fecharPopup = () => {
        setPopupAberto(false);
        setOrcamentoEditando(null);
        setErroFormulario("");
    };

    // Atualiza os campos do formulário
    const atualizarCampo = (evento) => {
        const { name, value } = evento.target;

        setDadosFormulario((dadosAnteriores) => ({
            ...dadosAnteriores,
            [name]: value
        }));
    };

    // Salva um orçamento novo ou atualizado
    const salvarOrcamento = async (evento) => {
        evento.preventDefault();
        setErroFormulario("");

        const eventoId = Number(dadosFormulario.fk_Evento_id_evento);
        const total = Number(dadosFormulario.valor_total);
        const desconto = Number(dadosFormulario.desconto || 0);
        const sinal = Number(dadosFormulario.sinal_pagamento);

        if (
            !Number.isInteger(eventoId) ||
            eventoId <= 0 ||
            dadosFormulario.valor_total === "" ||
            dadosFormulario.sinal_pagamento === ""
        ) {
            setErroFormulario("Preencha todos os campos obrigatórios.");
            return;
        }

        if (
            !Number.isFinite(total) ||
            !Number.isFinite(desconto) ||
            !Number.isFinite(sinal) ||
            total <= 0 ||
            desconto < 0 ||
            desconto > total ||
            sinal < 0
        ) {
            setErroFormulario("Informe valores financeiros válidos.");
            return;
        }

        if (sinal < sinalMinimo) {
            setErroFormulario(
                `O sinal deve ser de pelo menos ${formatarMoeda(sinalMinimo)} (30% do valor final).`
            );
            return;
        }

        const dados = {
            fk_Evento_id_evento: eventoId,
            valor_total: total,
            desconto,
            valor_final: valorFinal,
            sinal_pagamento: sinal
        };

        try {
            if (orcamentoEditando) {
                await api.put(
                    `/orcamentos/${orcamentoEditando.id_orcamento}`,
                    dados
                );
            } else {
                await api.post("/orcamentos", dados);
            }

            fecharPopup();
            await carregarOrcamentos();
        } catch (erro) {
            console.error(erro);
            setErroFormulario(mensagemDeErro(erro));
        }
    };

    // Abre a confirmação de exclusão
    const abrirExclusao = (orcamento) => {
        setOrcamentoExcluindo(orcamento);
        setPopupExclusaoAberto(true);
    };

    // Exclui o orçamento após confirmação
    const confirmarExclusao = async () => {
        try {
            await api.delete(
                `/orcamentos/${orcamentoExcluindo.id_orcamento}`
            );

            setPopupExclusaoAberto(false);
            setOrcamentoExcluindo(null);

            await carregarOrcamentos();
        } catch (erro) {
            console.error(erro);
            alert(mensagemDeErro(erro));
        }
    };

    // Paginação
    const totalPaginas = Math.ceil(
        orcamentosFiltrados.length / orcamentosPorPagina
    );

    const indiceInicial = (paginaAtual - 1) * orcamentosPorPagina;

    const orcamentosDaPagina = orcamentosFiltrados.slice(
        indiceInicial,
        indiceInicial + orcamentosPorPagina
    );

    const mudarPagina = (pagina) => {
        if (pagina < 1 || pagina > totalPaginas) return;
        setPaginaAtual(pagina);
    };

    // Colunas da tabela
    const colunas = [
        {
            titulo: "EVENTO / ID",
            campo: "nome_evento",
            largura: "25%",
            render: (orcamento) => (
                <div className="orcamento-evento">
                    <strong>
                        {orcamento.nome_evento || "Evento sem nome"}
                    </strong>
                    <span>
                        #EVT-{String(orcamento.fk_Evento_id_evento).padStart(3, "0")}
                    </span>
                </div>
            )
        },
        {
            titulo: "CLIENTE",
            campo: "nome_cliente",
            largura: "18%"
        },
        {
            titulo: "DATA DO EVENTO",
            campo: "data_evento",
            largura: "15%",
            render: (orcamento) => formatarData(orcamento.data_evento)
        },
        {
            titulo: "LOCAL",
            campo: "local",
            largura: "15%"
        },
        {
            titulo: "VALOR FINAL",
            campo: "valor_final",
            largura: "13%",
            render: (orcamento) => (
                <strong className="valor-orcamento">
                    {formatarMoeda(orcamento.valor_final)}
                </strong>
            )
        },
        {
            titulo: "STATUS",
            campo: "status",
            largura: "12%",
            render: (orcamento) => (
                <span
                    className={`status-orcamento ${
                        String(orcamento.status || "").toLowerCase()
                    }`}
                >
                    {orcamento.status || "Não informado"}
                </span>
            )
        }
    ];

    return (
        <>
            <Navbar />

            <main className="pagina-orcamentos">

                <div className="cabecalho-orcamentos">
                    <CabecalhoPagina
                        titulo="Consulta de Orçamentos"
                        subtitulo="Gerencie eventos e gere orçamentos personalizados para seus clientes."
                    />

                    <Botao onClick={abrirCadastro}>
                        + Novo Orçamento
                    </Botao>
                </div>

                <div className="area-filtros-orcamento">
                    <CampoPesquisa
                        valor={termo}
                        onChange={(valor) => {
                            setTermo(valor);
                            setPaginaAtual(1);
                        }}
                        onPesquisar={() => setPaginaAtual(1)}
                        onLimpar={limparPesquisa}
                        placeholder="Nome do cliente, evento ou ID..."
                    />
                </div>

                {carregando ? (
                    <div className="mensagem-tabela">
                        Carregando orçamentos...
                    </div>
                ) : erro ? (
                    <div className="mensagem-tabela erro">
                        {erro}
                    </div>
                ) : (
                    <>
                        <TabelaGenerica
                            colunas={colunas}
                            dados={orcamentosDaPagina}
                            chaveId="id_orcamento"
                            onEditar={abrirEdicao}
                            onExcluir={abrirExclusao}
                            mensagemVazia="Nenhum orçamento encontrado."
                        />

                        <div className="rodape-tabela">
                            <span>
                                Exibindo{" "}
                                {orcamentosFiltrados.length === 0
                                    ? 0
                                    : indiceInicial + 1}
                                -
                                {Math.min(
                                    indiceInicial + orcamentosPorPagina,
                                    orcamentosFiltrados.length
                                )}{" "}
                                de {orcamentosFiltrados.length} orçamentos
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

            {/* Formulário próprio de orçamento */}
            {popupAberto && (
                <div className="popup-orcamento-fundo">
                    <form
                        className="popup-orcamento"
                        onSubmit={salvarOrcamento}
                    >
                        <div className="popup-orcamento-cabecalho">
                            <h2>
                                {orcamentoEditando
                                    ? "Editar Orçamento"
                                    : "Cadastro de Orçamento"}
                            </h2>

                            <p>
                                Preencha os dados financeiros do evento.
                            </p>
                        </div>

                        <div className="campo-orcamento">
                            <label htmlFor="evento-orcamento">
                                ID DO EVENTO *
                            </label>

                            <input
                                id="evento-orcamento"
                                type="number"
                                name="fk_Evento_id_evento"
                                min="1"
                                value={dadosFormulario.fk_Evento_id_evento}
                                onChange={atualizarCampo}
                                placeholder="Informe o ID do evento"
                                required
                            />

                            <small>
                                Informe o ID de um evento já cadastrado.
                            </small>
                        </div>

                        <div className="campo-orcamento">
                            <label htmlFor="valor-total">
                                VALOR TOTAL *
                            </label>

                            <div className="input-moeda">
                                <span>R$</span>
                                <input
                                    id="valor-total"
                                    type="number"
                                    name="valor_total"
                                    min="0.01"
                                    step="0.01"
                                    value={dadosFormulario.valor_total}
                                    onChange={atualizarCampo}
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="campos-duplos-orcamento">
                            <div className="campo-orcamento">
                                <label htmlFor="desconto">
                                    DESCONTO (OPCIONAL)
                                </label>

                                <div className="input-moeda">
                                    <span>R$</span>
                                    <input
                                        id="desconto"
                                        type="number"
                                        name="desconto"
                                        min="0"
                                        step="0.01"
                                        value={dadosFormulario.desconto}
                                        onChange={atualizarCampo}
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            <div className="campo-orcamento">
                                <label>VALOR FINAL *</label>

                                <div className="input-moeda campo-calculado">
                                    <span>R$</span>
                                    <input
                                        type="text"
                                        value={valorFinal.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="campo-orcamento">
                            <label htmlFor="sinal-pagamento">
                                SINAL DE PAGAMENTO *
                            </label>

                            <div className="input-moeda">
                                <span>R$</span>
                                <input
                                    id="sinal-pagamento"
                                    type="number"
                                    name="sinal_pagamento"
                                    min="0"
                                    step="0.01"
                                    value={dadosFormulario.sinal_pagamento}
                                    onChange={atualizarCampo}
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                        </div>

                        <div className="aviso-sinal">
                            <strong>ⓘ</strong>
                            <span>
                                O sinal de pagamento deve corresponder a no
                                mínimo 30% do valor final para reserva da data
                                no calendário do Circus Gourmet.
                                <br />
                                Valor mínimo: {formatarMoeda(sinalMinimo)}
                            </span>
                        </div>

                        {erroFormulario && (
                            <div className="erro-formulario-orcamento">
                                {erroFormulario}
                            </div>
                        )}

                        <div className="acoes-orcamento">
                            <button
                                type="button"
                                className="botao-cancelar-orcamento"
                                onClick={fecharPopup}
                            >
                                CANCELAR
                            </button>

                            <button
                                type="submit"
                                className="botao-salvar-orcamento"
                            >
                                {orcamentoEditando ? "SALVAR" : "CADASTRAR"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <PopUpConfirmacao
                aberto={popupExclusaoAberto}
                titulo="Excluir orçamento"
                mensagem={
                    orcamentoExcluindo
                        ? `Deseja realmente excluir o orçamento do evento "${orcamentoExcluindo.nome_evento || orcamentoExcluindo.fk_Evento_id_evento}"?`
                        : ""
                }
                onConfirmar={confirmarExclusao}
                onFechar={() => {
                    setPopupExclusaoAberto(false);
                    setOrcamentoExcluindo(null);
                }}
            />
        </>
    );
}

export default Orcamento;
