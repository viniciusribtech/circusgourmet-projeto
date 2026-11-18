import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../../components/BarraNav/navbar.jsx';
import CabecalhoPagina from '../../components/CabecalhoPagina/cabecalhoPagina.jsx';
import Botao from '../../components/Botao/botao.jsx';
import CampoPesquisa from '../../components/CampoPesquisa/campoPesquisa.jsx';
import TabelaGenerica from '../../components/TabelaGenerica/tabelaGenerica.jsx';
import Paginacao from '../../components/Paginacao/paginacao.jsx';
import PopUpFormulario from '../../components/PopUpFormulario/popUpFormulario.jsx';
import PopUpConfirmacao from '../../components/PopUpConfirmacao/popUpConfirmacao.jsx';
import {
    listarEventos, buscarEventos, listarClientesEvento, listarCidadesEvento,
    obterEvento, cadastrarEvento, atualizarEvento, excluirEvento, mensagemErroEvento
} from '../../services/eventoService.js';
import '../Insumo/Insumo.css';
import './evento.css';

const EVENTOS_POR_PAGINA = 4;

function dataBrasileira(data) {
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return '—';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

function textoCortado(texto, substituto = '—') {
    const valor = texto || substituto;
    return <span className="texto-tabela-truncado" title={valor}>{valor}</span>;
}

// Preserva as colunas e a formatação da tabela original de Eventos.
const COLUNAS_EVENTOS = [
    { titulo: 'ID', campo: 'id_evento', largura: '5%' },
    { titulo: 'EVENTO', campo: 'nome_evento', largura: '17%', render: (evento) => textoCortado(evento.nome_evento) },
    { titulo: 'DATA', campo: 'data_evento', largura: '11%', render: (evento) => dataBrasileira(evento.data_evento) },
    { titulo: 'HORÁRIO', largura: '12%', render: (evento) => `${evento.horario_inicio}–${evento.horario_fim}` },
    {
        titulo: 'LOCAL / CIDADE', largura: '20%',
        render: (evento) => textoCortado(`${evento.local}${evento.nome_cidade ? ` / ${evento.nome_cidade}` : ''}`)
    },
    { titulo: 'CLIENTE', campo: 'nome_cliente', largura: '16%', render: (evento) => textoCortado(evento.nome_cliente, 'Não vinculado') },
    { titulo: 'STATUS', campo: 'status', largura: '12%' }
];

export default function Evento() {
    const [parametros, setParametros] = useSearchParams();
    const aberturaAutomatica = useRef(false);
    const [eventos, setEventos] = useState([]);
    const [termo, setTermo] = useState('');
    const [pagina, setPagina] = useState(1);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [aviso, setAviso] = useState('');
    const [formAberto, setFormAberto] = useState(false);
    const [eventoEditando, setEventoEditando] = useState(null);
    const [erroFormulario, setErroFormulario] = useState('');
    const [salvando, setSalvando] = useState(false);
    const [abrindo, setAbrindo] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [eventoExcluindo, setEventoExcluindo] = useState(null);
    const [erroExclusao, setErroExclusao] = useState('');
    const [excluindo, setExcluindo] = useState(false);
    const requisicao = useRef(0);

    const carregar = useCallback(async (pesquisa = '') => {
        const atual = ++requisicao.current;
        setCarregando(true); setErro('');
        try {
            const dados = pesquisa ? await buscarEventos(pesquisa) : await listarEventos();
            if (atual !== requisicao.current) return;
            if (!Array.isArray(dados)) throw new Error('Resposta inválida do servidor.');
            setEventos(dados);
            setPagina(1);
            if (pesquisa && !dados.length) setErro('Resultados não encontrados!');
        } catch (falha) {
            if (atual !== requisicao.current) return;
            setErro(mensagemErroEvento(falha));
            setEventos([]);
        } finally { if (atual === requisicao.current) setCarregando(false); }
    }, []);

    useEffect(() => {
        carregar();
        return () => { requisicao.current += 1; };
    }, [carregar]);

    function pesquisar() {
        const pesquisa = termo.trim();
        setAviso('');
        if (!pesquisa) { setErro('Preencha a barra de pesquisa!'); return; }
        if (pesquisa.length > 50) { setErro('A pesquisa não pode ultrapassar 50 caracteres.'); return; }
        carregar(pesquisa);
    }
    function limpar() { setTermo(''); setAviso(''); setErro(''); carregar(); }

    async function abrirFormulario(evento = null) {
        if (abrindo) return;
        setAbrindo(true); setErroFormulario(''); setAviso('');
        try {
            const [listaClientes, listaCidades, dados] = await Promise.all([
                listarClientesEvento(), listarCidadesEvento(),
                evento ? obterEvento(evento.id_evento) : Promise.resolve(null)
            ]);
            if (!Array.isArray(listaClientes) || !Array.isArray(listaCidades)) throw new Error('Dados de seleção inválidos.');
            setClientes(listaClientes); setCidades(listaCidades);
            setEventoEditando(dados ? {
                ...dados,
                fk_Cliente_id_cliente: dados.fk_Cliente_id_cliente == null ? '' : String(dados.fk_Cliente_id_cliente),
                fk_Cidade_id_cidade: dados.fk_Cidade_id_cidade == null ? '' : String(dados.fk_Cidade_id_cidade)
            } : null);
            setFormAberto(true);
        } catch (falha) { setErro(mensagemErroEvento(falha)); }
        finally { setAbrindo(false); }
    }

    // A Dashboard pode acessar /eventos?acao=novo para abrir o cadastro.
    useEffect(() => {
        if (parametros.get('acao') !== 'novo') {
            aberturaAutomatica.current = false;
            return;
        }
        if (aberturaAutomatica.current) return;
        aberturaAutomatica.current = true;

        // Consome o parâmetro para o modal não reabrir ao atualizar a página.
        setParametros(anteriores => {
            const novos = new URLSearchParams(anteriores);
            novos.delete('acao');
            return novos;
        }, { replace: true });

        void abrirFormulario();
    }, [parametros, setParametros]);

    function fecharFormulario() {
        if (salvando) return;
        setFormAberto(false); setEventoEditando(null); setErroFormulario('');
    }

    async function salvar(dados) {
        if (salvando) return;
        setSalvando(true); setErroFormulario('');
        try {
            const resposta = eventoEditando
                ? await atualizarEvento(eventoEditando.id_evento, dados)
                : await cadastrarEvento(dados);
            setFormAberto(false); setEventoEditando(null);
            setTermo(''); setAviso(resposta.mensagem || 'Evento salvo com sucesso!');
            await carregar();
        } catch (falha) { setErroFormulario(mensagemErroEvento(falha)); }
        finally { setSalvando(false); }
    }

    function abrirExclusao(evento) { setEventoExcluindo(evento); setErroExclusao(''); }
    function fecharExclusao() { if (!excluindo) { setEventoExcluindo(null); setErroExclusao(''); } }
    async function confirmarExclusao() {
        if (!eventoExcluindo || excluindo) return;
        setExcluindo(true); setErroExclusao('');
        try {
            const resposta = await excluirEvento(eventoExcluindo.id_evento);
            setEventoExcluindo(null); setTermo('');
            setAviso(resposta.mensagem || 'Evento excluído com sucesso!');
            await carregar();
        } catch (falha) { setErroExclusao(mensagemErroEvento(falha)); }
        finally { setExcluindo(false); }
    }

    const campos = useMemo(() => [
        { nome: 'nome_evento', label: 'Nome do Evento', placeholder: 'Ex: Casamento', tamanhoMaximo: 50 },
        { nome: 'data_evento', label: 'Data do Evento', tipo: 'dataBR', placeholder: 'DD/MM/AAAA' },
        { nome: 'horario_inicio', label: 'Horário de Início', tipo: 'hora24' },
        { nome: 'horario_fim', label: 'Horário de Encerramento', tipo: 'hora24' },
        { nome: 'local', label: 'Local', placeholder: 'Local do evento', tamanhoMaximo: 50 },
        { nome: 'n_convidados', label: 'Número de Convidados', tipo: 'number', modoEntrada: 'numeric' },
        { nome: 'status', label: 'Status', tipo: 'selecao', placeholder: 'Selecione o status',
            opcoes: ['Pendente', 'Confirmado', 'Cancelado'].map((valor) => ({ valor, rotulo: valor })) },
        { nome: 'fk_Cliente_id_cliente', label: 'Cliente (Opcional)', tipo: 'selecao', obrigatorio: false,
            placeholder: 'Sem cliente vinculado', opcoes: clientes.map((cliente) => ({ valor: String(cliente.id_cliente), rotulo: cliente.nome })) },
        { nome: 'fk_Cidade_id_cidade', label: 'Cidade / Taxa de Deslocamento', tipo: 'selecao',
            placeholder: 'Selecione uma cidade', opcoes: cidades.map((cidade) => ({ valor: String(cidade.id_cidade), rotulo: `${cidade.nome || 'Sem nome'} — Taxa R$ ${Number(cidade.taxa_deslocamento).toFixed(2).replace('.', ',')}` })) }
    ], [clientes, cidades]);

    const totalPaginas = Math.ceil(eventos.length / EVENTOS_POR_PAGINA);
    const inicio = (pagina - 1) * EVENTOS_POR_PAGINA;
    const eventosPagina = eventos.slice(inicio, inicio + EVENTOS_POR_PAGINA);

    return (
        <>
            <Navbar />
            <main className="pagina-eventos">
                <div className="cabecalho-eventos">
                    <CabecalhoPagina titulo="Controle de Eventos" subtitulo="Gerencie seus eventos e agendamentos." />
                    <Botao type="button" onClick={() => abrirFormulario()} disabled={abrindo}>
                        {abrindo ? 'Carregando...' : 'Novo Evento'}
                    </Botao>
                </div>
                <div className="area-filtros">
                    <CampoPesquisa valor={termo} onChange={setTermo} onPesquisar={pesquisar}
                        onLimpar={limpar} placeholder="Pesquisar evento, cliente, local, cidade, data ou ID..." />
                </div>
                {aviso && <div className="mensagem-tabela aviso-evento" role="status">{aviso}</div>}
                {carregando ? <div className="mensagem-tabela" role="status">Carregando eventos...</div>
                    : erro ? <div className="mensagem-tabela erro" role="alert">{erro}</div>
                    : <>
                        <TabelaGenerica
                            colunas={COLUNAS_EVENTOS}
                            dados={eventosPagina}
                            chaveId="id_evento"
                            onEditar={abrirFormulario}
                            onExcluir={abrirExclusao}
                            mensagemVazia="Nenhum evento encontrado."
                        />
                        <div className="rodape-tabela">
                            <span>Exibindo {eventos.length ? inicio + 1 : 0}–{Math.min(inicio + EVENTOS_POR_PAGINA, eventos.length)} de {eventos.length} eventos</span>
                            <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onMudarPagina={setPagina} />
                        </div>
                    </>}
            </main>
            <PopUpFormulario aberto={formAberto} titulo={eventoEditando ? 'Editar Evento' : 'Cadastrar Novo Evento'}
                subtitulo={eventoEditando ? 'Atualize as informações do evento.' : 'Preencha os dados do evento.'}
                cliente={eventoEditando} campos={campos} onSalvar={salvar}
                onFechar={fecharFormulario} erro={erroFormulario} salvando={salvando} />
            <PopUpConfirmacao aberto={Boolean(eventoExcluindo)} titulo="Confirmar Exclusão"
                mensagem={eventoExcluindo ? `Tem certeza que deseja excluir o evento "${eventoExcluindo.nome_evento}"? Esta ação não poderá ser desfeita.` : ''}
                erro={erroExclusao} processando={excluindo} onConfirmar={confirmarExclusao} onFechar={fecharExclusao} />
        </>
    );
}
