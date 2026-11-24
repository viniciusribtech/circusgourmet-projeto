import { useEffect, useState } from "react";

import Navbar from "../../components/BarraNav/navbar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import CampoPesquisa from "../../components/CampoPesquisa/campoPesquisa.jsx";
import TabelaGenerica from "../../components/TabelaGenerica/tabelaGenerica.jsx";
import Paginacao from "../../components/Paginacao/paginacao.jsx";
import PopUpConfirmacao from "../../components/PopUpConfirmacao/popUpConfirmacao.jsx";

import {
    listarOrcamentos,
    buscarOrcamentos,
    listarEventosParaOrcamento,
    calcularPreviaOrcamento,
    cadastrarOrcamento,
    atualizarOrcamento,
    excluirOrcamento,
    mensagemDeErro
} from "../../services/orcamentoService.js";

import "./orcamento.css";

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
    return dataFormatada.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function Orcamento() {
    const [orcamentos, setOrcamentos] = useState([]);
    const [eventosDisponiveis, setEventosDisponiveis] = useState([]);

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
        desconto: "",
        sinal_pagamento: ""
    });

    const [previaCalculo, setPreviaCalculo] = useState(null);
    const [calculandoPrevia, setCalculandoPrevia] = useState(false);
    const [erroFormulario, setErroFormulario] = useState("");
    const [salvando, setSalvando] = useState(false);

    const carregarOrcamentos = async (pesquisa = "") => {
        try {
            setCarregando(true);
            setErro("");
            const dados = pesquisa ? await buscarOrcamentos(pesquisa) : await listarOrcamentos();
            setOrcamentos(Array.isArray(dados) ? dados : []);
            setPaginaAtual(1);
        } catch (err) {
            console.error(err);
            setErro(mensagemDeErro(err));
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarOrcamentos();
    }, []);

    useEffect(() => {
        if (!popupAberto) return;

        const eventoId = Number(dadosFormulario.fk_Evento_id_evento);
        if (!Number.isInteger(eventoId) || eventoId <= 0) {
            setPreviaCalculo(null);
            return;
        }

        let cancelado = false;
        const atualizarPrevia = async () => {
            try {
                setCalculandoPrevia(true);
                setErroFormulario("");
                const descontoNum = Number(String(dadosFormulario.desconto || "0").replace(",", "."));
                const previa = await calcularPreviaOrcamento(
                    eventoId,
                    Number.isFinite(descontoNum) ? descontoNum : 0
                );
                if (!cancelado) {
                    setPreviaCalculo(previa);
                }
            } catch (err) {
                if (!cancelado) {
                    setPreviaCalculo(null);
                    setErroFormulario(mensagemDeErro(err));
                }
            } finally {
                if (!cancelado) setCalculandoPrevia(false);
            }
        };

        atualizarPrevia();
        return () => {
            cancelado = true;
        };
    }, [popupAberto, dadosFormulario.fk_Evento_id_evento, dadosFormulario.desconto]);

    const limparPesquisa = async () => {
        setTermo("");
        setErro("");
        await carregarOrcamentos();
    };

    const abrirCadastro = async () => {
        try {
            const listaEventos = await listarEventosParaOrcamento();
            setEventosDisponiveis(Array.isArray(listaEventos) ? listaEventos : []);
            setOrcamentoEditando(null);
            setPreviaCalculo(null);
            setDadosFormulario({
                fk_Evento_id_evento: "",
                desconto: "",
                sinal_pagamento: ""
            });
            setErroFormulario("");
            setPopupAberto(true);
        } catch (err) {
            setErro(mensagemDeErro(err));
        }
    };

    const abrirEdicao = async (orcamento) => {
        try {
            const listaEventos = await listarEventosParaOrcamento();
            setEventosDisponiveis(Array.isArray(listaEventos) ? listaEventos : []);
            setOrcamentoEditando(orcamento);
            setDadosFormulario({
                fk_Evento_id_evento: String(orcamento.fk_Evento_id_evento),
                desconto: String(orcamento.desconto ?? ""),
                sinal_pagamento: String(orcamento.sinal_pagamento ?? "")
            });
            setErroFormulario("");
            setPopupAberto(true);
        } catch (err) {
            setErro(mensagemDeErro(err));
        }
    };

    const fecharPopup = () => {
        if (salvando) return;
        setPopupAberto(false);
        setOrcamentoEditando(null);
        setPreviaCalculo(null);
        setErroFormulario("");
    };

    const atualizarCampo = (evento) => {
        const { name, value } = evento.target;
        setDadosFormulario((anteriores) => ({
            ...anteriores,
            [name]: value
        }));
    };

    const salvarOrcamento = async (evento) => {
        evento.preventDefault();
        if (salvando) return;
        setErroFormulario("");

        const eventoId = Number(dadosFormulario.fk_Evento_id_evento);
        const desconto = Number(String(dadosFormulario.desconto || "0").replace(",", "."));
        const sinal = Number(String(dadosFormulario.sinal_pagamento || "").replace(",", "."));

        if (!Number.isInteger(eventoId) || eventoId <= 0 || dadosFormulario.sinal_pagamento === "") {
            setErroFormulario("Selecione o evento e informe o sinal de pagamento.");
            return;
        }

        if (!Number.isFinite(desconto) || !Number.isFinite(sinal) || desconto < 0 || sinal < 0) {
            setErroFormulario("Informe valores financeiros válidos.");
            return;
        }

        if (previaCalculo) {
            const sinalMinimo = Number(previaCalculo.sinal_minimo || 0);
            const valorFinal = Number(previaCalculo.valor_final || 0);

            if (sinal < sinalMinimo) {
                setErroFormulario(
                    `O sinal deve ser de pelo menos ${formatarMoeda(sinalMinimo)} (30% do valor final).`
                );
                return;
            }

            if (sinal > valorFinal) {
                setErroFormulario(
                    `O sinal não pode ser maior que o valor final (${formatarMoeda(valorFinal)}).`
                );
                return;
            }
        }

        try {
            setSalvando(true);
            const payload = {
                fk_Evento_id_evento: eventoId,
                desconto,
                sinal_pagamento: sinal
            };

            if (orcamentoEditando) {
                await atualizarOrcamento(orcamentoEditando.id_orcamento, payload);
            } else {
                await cadastrarOrcamento(payload);
            }

            setPopupAberto(false);
            setOrcamentoEditando(null);
            setPreviaCalculo(null);
            await carregarOrcamentos(termo.trim());
        } catch (err) {
            console.error(err);
            setErroFormulario(mensagemDeErro(err));
        } finally {
            setSalvando(false);
        }
    };

    const abrirExclusao = (orcamento) => {
        setOrcamentoExcluindo(orcamento);
        setPopupExclusaoAberto(true);
    };

    const confirmarExclusao = async () => {
        if (!orcamentoExcluindo) return;
        try {
            await excluirOrcamento(orcamentoExcluindo.id_orcamento);
            setPopupExclusaoAberto(false);
            setOrcamentoExcluindo(null);
            await carregarOrcamentos(termo.trim());
        } catch (err) {
            console.error(err);
            alert(mensagemDeErro(err));
        }
    };

    const totalPaginas = Math.ceil(orcamentos.length / orcamentosPorPagina);
    const indiceInicial = (paginaAtual - 1) * orcamentosPorPagina;
    const orcamentosDaPagina = orcamentos.slice(indiceInicial, indiceInicial + orcamentosPorPagina);

    const mudarPagina = (pagina) => {
        if (pagina < 1 || pagina > totalPaginas) return;
        setPaginaAtual(pagina);
    };

    const colunas = [
        {
            titulo: "EVENTO / ID",
            campo: "nome_evento",
            largura: "25%",
            render: (orcamento) => (
                <div className="orcamento-evento">
                    <strong>{orcamento.nome_evento || "Evento sem nome"}</strong>
                    <span>#EVT-{String(orcamento.fk_Evento_id_evento).padStart(3, "0")}</span>
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
                <span className={`status-orcamento ${String(orcamento.status || "").toLowerCase()}`}>
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
                        subtitulo="Gerencie eventos e gere orçamentos calculados automaticamente."
                    />

                    <Botao onClick={abrirCadastro}>
                        + Novo Orçamento
                    </Botao>
                </div>

                <div className="area-filtros-orcamento">
                    <CampoPesquisa
                        valor={termo}
                        onChange={setTermo}
                        onPesquisar={() => carregarOrcamentos(termo)}
                        onLimpar={limparPesquisa}
                        placeholder="Nome do cliente, evento, local ou ID..."
                    />
                </div>

                {carregando ? (
                    <div className="mensagem-tabela">Carregando orçamentos...</div>
                ) : erro ? (
                    <div className="mensagem-tabela erro">{erro}</div>
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
                                Exibindo {orcamentos.length === 0 ? 0 : indiceInicial + 1}-
                                {Math.min(indiceInicial + orcamentosPorPagina, orcamentos.length)} de {orcamentos.length} orçamentos
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

            {popupAberto && (
                <div className="popup-orcamento-fundo">
                    <form className="popup-orcamento" onSubmit={salvarOrcamento}>
                        <div className="popup-orcamento-cabecalho">
                            <h2>
                                {orcamentoEditando ? "Editar Orçamento" : "Cadastro de Orçamento"}
                            </h2>
                            <p>
                                Os valores total e final são calculados automaticamente pelo servidor.
                            </p>
                        </div>

                        <div className="campo-orcamento">
                            <label htmlFor="evento-orcamento">EVENTO *</label>
                            <select
                                id="evento-orcamento"
                                name="fk_Evento_id_evento"
                                value={dadosFormulario.fk_Evento_id_evento}
                                onChange={atualizarCampo}
                                required
                                disabled={Boolean(orcamentoEditando)}
                            >
                                <option value="">Selecione um evento</option>
                                {eventosDisponiveis.map((ev) => (
                                    <option key={ev.id_evento} value={ev.id_evento}>
                                        #{ev.id_evento} — {ev.nome_evento} ({formatarData(ev.data_evento)} • {ev.n_convidados} conv.)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {calculandoPrevia && (
                            <p className="resumo-calculo-info">Calculando valores do evento...</p>
                        )}

                        {previaCalculo && (
                            <div className="resumo-calculo-orcamento">
                                <div>
                                    <span>Convidados:</span>
                                    <strong>{previaCalculo.n_convidados}</strong>
                                </div>
                                <div>
                                    <span>Subtotal dos serviços:</span>
                                    <strong>{formatarMoeda(previaCalculo.subtotal_servicos)}</strong>
                                </div>
                                <div>
                                    <span>Taxa de deslocamento ({previaCalculo.nome_cidade || "Cidade"}):</span>
                                    <strong>{formatarMoeda(previaCalculo.taxa_deslocamento)}</strong>
                                </div>
                                <div className="linha-destaque">
                                    <span>Valor total calculado:</span>
                                    <strong>{formatarMoeda(previaCalculo.valor_total)}</strong>
                                </div>
                            </div>
                        )}

                        <div className="campos-duplos-orcamento">
                            <div className="campo-orcamento">
                                <label htmlFor="desconto">DESCONTO (OPCIONAL)</label>
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
                                <label>VALOR FINAL CALCULADO</label>
                                <div className="input-moeda campo-calculado">
                                    <span>R$</span>
                                    <input
                                        type="text"
                                        value={Number(previaCalculo?.valor_final || 0).toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="campo-orcamento">
                            <label htmlFor="sinal-pagamento">SINAL DE PAGAMENTO *</label>
                            <div className="input-moeda">
                                <span>R$</span>
                                <input
                                    id="sinal-pagamento"
                                    type="number"
                                    name="sinal_pagamento"
                                    min="0"
                                    max={previaCalculo ? Number(previaCalculo.valor_final || 0) : undefined}
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
                                O sinal de pagamento deve corresponder a no mínimo 30% do valor final e não pode ultrapassar o valor final.
                                <br />
                                Valor mínimo: {formatarMoeda(previaCalculo?.sinal_minimo || 0)}
                            </span>
                        </div>

                        {erroFormulario && (
                            <div className="erro-formulario-orcamento">{erroFormulario}</div>
                        )}

                        <div className="acoes-orcamento">
                            <button
                                type="button"
                                className="botao-cancelar-orcamento"
                                onClick={fecharPopup}
                                disabled={salvando}
                            >
                                CANCELAR
                            </button>

                            <button
                                type="submit"
                                className="botao-salvar-orcamento"
                                disabled={salvando || !previaCalculo}
                            >
                                {salvando ? "SALVANDO..." : orcamentoEditando ? "SALVAR" : "CADASTRAR"}
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