import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Navbar from '../../components/BarraNav/navbar.jsx';
import CabecalhoPagina from '../../components/CabecalhoPagina/cabecalhoPagina.jsx';
import Botao from '../../components/Botao/botao.jsx';
import CampoPesquisa from '../../components/CampoPesquisa/campoPesquisa.jsx';
import TabelaServico from '../../components/TabelaServico/tabelaServico.jsx';
import Paginacao from '../../components/Paginacao/paginacao.jsx';
import PopUpFormulario from '../../components/PopUpFormulario/popUpFormulario.jsx';
import PopUpConfirmacao from '../../components/PopUpConfirmacao/popUpConfirmacao.jsx';
import {
    listarServicos, buscarServicos, listarCategoriasServico,
    cadastrarServico, obterServicoPorId, atualizarServico, excluirServico, mensagemErroServico
} from '../../services/servicoService.js';
import '../Insumo/insumo.css';
import './servico.css';

const SERVICOS_POR_PAGINA = 4;

export default function Servico() {
    const [servicos, setServicos] = useState([]);
    const [termo, setTermo] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [popupAberto, setPopupAberto] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [carregandoCategorias, setCarregandoCategorias] = useState(false);
    const [erroFormulario, setErroFormulario] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [servicoEditando, setServicoEditando] = useState(null);
    const [servicoExcluindo, setServicoExcluindo] = useState(null);
    const [erroExclusao, setErroExclusao] = useState('');
    const [excluindo, setExcluindo] = useState(false);
    const requisicaoAtual = useRef(0);

    const carregarServicos = useCallback(async (pesquisa = '') => {
        const identificador = ++requisicaoAtual.current;
        setCarregando(true);
        setErro('');
        try {
            const dados = pesquisa ? await buscarServicos(pesquisa) : await listarServicos();
            if (identificador !== requisicaoAtual.current) return;
            if (!Array.isArray(dados)) throw new Error('Resposta inválida do servidor.');
            setServicos(dados);
            setPaginaAtual(1);
        } catch (falha) {
            if (identificador !== requisicaoAtual.current) return;
            setServicos([]);
            setErro(mensagemErroServico(falha));
        } finally {
            if (identificador === requisicaoAtual.current) setCarregando(false);
        }
    }, []);

    useEffect(() => {
        carregarServicos();
        return () => { requisicaoAtual.current += 1; };
    }, [carregarServicos]);

    function pesquisarServicos() {
        setAviso('');
        const pesquisa = termo.trim();
        if (!pesquisa) {
            setErro('Preencha a barra de pesquisa!');
            return;
        }
        if (pesquisa.length > 30) {
            setErro('A pesquisa não pode ultrapassar 30 caracteres.');
            return;
        }
        carregarServicos(pesquisa);
    }

    function limparPesquisa() {
        setErro('');
        setTermo('');
        setAviso('');
        carregarServicos();
    }

    async function abrirEdicao(servico) {
        setErroFormulario('');
        setAviso('');
        setCarregandoCategorias(true);
        try {
            const [dados, registro] = await Promise.all([
                listarCategoriasServico(), obterServicoPorId(servico.id_servico)
            ]);
            if (!Array.isArray(dados)) throw new Error('Resposta inválida ao listar categorias.');
            setCategorias(dados);
            setServicoEditando({ ...registro, preco_base: String(registro.preco_base ?? '').replace('.', ','),
                fk_Categoria_id_categoria: registro.fk_Categoria_id_categoria == null ? '' : String(registro.fk_Categoria_id_categoria) });
            setPopupAberto(true);
        } catch (falha) { setErro(mensagemErroServico(falha)); }
        finally { setCarregandoCategorias(false); }
    }

    function abrirExclusao(servico) {
        setErroExclusao('');
        setServicoExcluindo(servico);
    }

    function fecharExclusao() {
        if (!excluindo) { setServicoExcluindo(null); setErroExclusao(''); }
    }

    async function confirmarExclusao() {
        if (!servicoExcluindo || excluindo) return;
        setExcluindo(true);
        setErroExclusao('');
        try {
            const resultado = await excluirServico(servicoExcluindo.id_servico);
            setServicoExcluindo(null);
            setAviso(resultado.mensagem || 'Serviço excluído com sucesso!');
            setTermo('');
            await carregarServicos();
        } catch (falha) { setErroExclusao(mensagemErroServico(falha)); }
        finally { setExcluindo(false); }
    }

    async function abrirCadastro() {
        setAviso('');
        setErroFormulario('');
        setServicoEditando(null);
        setCarregandoCategorias(true);
        try {
            const dados = await listarCategoriasServico();
            if (!Array.isArray(dados)) throw new Error('Resposta inválida ao listar categorias.');
            setCategorias(dados);
            setPopupAberto(true);
        } catch (falha) {
            setErro(mensagemErroServico(falha));
        } finally {
            setCarregandoCategorias(false);
        }
    }

    const fecharCadastro = useCallback(() => {
        if (salvando) return;
        setPopupAberto(false);
        setServicoEditando(null);
        setErroFormulario('');
    }, [salvando]);

    async function salvarServico(dados) {
        if (salvando) return;
        setErroFormulario('');
        setSalvando(true);
        try {
            const resultado = servicoEditando
                ? await atualizarServico(servicoEditando.id_servico, dados)
                : await cadastrarServico(dados);
            setPopupAberto(false);
            setServicoEditando(null);
            setTermo('');
            setAviso(resultado.mensagem || 'Operação realizada com sucesso!');
            await carregarServicos();
        } catch (falha) {
            setErroFormulario(mensagemErroServico(falha));
        } finally {
            setSalvando(false);
        }
    }

    const camposCadastro = useMemo(() => [
        { nome: 'nome', label: 'Nome do Serviço', placeholder: 'Ex: Buffet de Canapés Premium', tamanhoMaximo: 30 },
        { nome: 'preco_base', label: 'Preço Base (R$)', placeholder: '0,00', modoEntrada: 'decimal', limitarPrecoServico: true },
        { nome: 'fk_Categoria_id_categoria', label: 'Categoria (Opcional)', tipo: 'selecao', obrigatorio: false,
            placeholder: 'Sem categoria', opcoes: categorias.map((categoria) => ({
                valor: String(categoria.id_categoria), rotulo: categoria.nome_categoria
            })) },
        { nome: 'descricao', label: 'Descrição (Opcional)', placeholder: 'Descreva os detalhes, ingredientes e diferenciais deste serviço...',
            tipo: 'texto-longo', obrigatorio: false, tamanhoMaximo: 300 }
    ], [categorias]);

    const totalPaginas = Math.ceil(servicos.length / SERVICOS_POR_PAGINA);
    const indiceInicial = (paginaAtual - 1) * SERVICOS_POR_PAGINA;
    const servicosDaPagina = servicos.slice(indiceInicial, indiceInicial + SERVICOS_POR_PAGINA);

    return (
        <>
            <Navbar />
            <main className="pagina-servicos">
                <div className="cabecalho-servicos">
                    <CabecalhoPagina titulo="Consulta de Serviços"
                        subtitulo="Gerencie os serviços gourmet oferecidos em seus espetáculos e eventos." />
                    <Botao type="button" onClick={abrirCadastro} disabled={carregandoCategorias}>
                        {carregandoCategorias ? 'Carregando...' : 'Novo Serviço'}
                    </Botao>
                </div>

                <div className="area-filtros">
                    <CampoPesquisa valor={termo} onChange={setTermo}
                        onPesquisar={pesquisarServicos} onLimpar={limparPesquisa}
                        placeholder="Pesquisar por nome do serviço..." />
                </div>

                {aviso && <div className="mensagem-tabela aviso-servico" role="status">{aviso}</div>}
                {carregando ? (
                    <div className="mensagem-tabela" role="status">Carregando serviços...</div>
                ) : erro ? (
                    <div className="mensagem-tabela erro" role="alert">{erro}</div>
                ) : (
                    <>
                        <TabelaServico servicos={servicosDaPagina} onEditar={abrirEdicao} onExcluir={abrirExclusao} />
                        <div className="rodape-tabela">
                            <span>Exibindo {servicos.length ? indiceInicial + 1 : 0}–
                                {Math.min(indiceInicial + SERVICOS_POR_PAGINA, servicos.length)} de {servicos.length} serviços</span>
                            <Paginacao paginaAtual={paginaAtual} totalPaginas={totalPaginas}
                                onMudarPagina={setPaginaAtual} />
                        </div>
                    </>
                )}
            </main>
            <PopUpFormulario aberto={popupAberto} titulo={servicoEditando ? "Editar Serviço" : "Cadastrar Novo Serviço"}
                subtitulo={servicoEditando ? "Atualize as informações do serviço." : "Configure os detalhes do serviço gastronômico para o catálogo."}
                cliente={servicoEditando}
                campos={camposCadastro} onSalvar={salvarServico} onFechar={fecharCadastro}
                erro={erroFormulario} salvando={salvando} />
            <PopUpConfirmacao aberto={Boolean(servicoExcluindo)} titulo="Confirmar Exclusão"
                mensagem={`Tem certeza que deseja excluir o serviço "${servicoExcluindo?.nome || ''}" definitivamente? Esta ação não poderá ser desfeita.`}
                onConfirmar={confirmarExclusao} onFechar={fecharExclusao}
                erro={erroExclusao} processando={excluindo} />
        </>
    );
}
