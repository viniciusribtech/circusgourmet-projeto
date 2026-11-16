import './tabelaEvento.css';

function dataBrasileira(data) {
    if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) return '—';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
}

export default function TabelaEvento({ eventos, onEditar, onExcluir }) {
    return (
        <div className="tabela-eventos">
            <table>
                <thead><tr>
                    <th>EVENTO</th><th>DATA</th><th>HORÁRIO</th><th>LOCAL / CIDADE</th>
                    <th>CLIENTE</th><th>STATUS</th><th className="coluna-acoes">AÇÕES</th>
                </tr></thead>
                <tbody>
                    {eventos.length === 0 ? (
                        <tr><td className="nenhum-evento" colSpan="7">Nenhum evento encontrado.</td></tr>
                    ) : eventos.map((evento) => (
                        <tr key={evento.id_evento}>
                            <td className="celula-cortada" title={evento.nome_evento}>{evento.nome_evento}</td>
                            <td>{dataBrasileira(evento.data_evento)}</td>
                            <td>{evento.horario_inicio}–{evento.horario_fim}</td>
                            <td className="celula-cortada" title={`${evento.local} / ${evento.nome_cidade || ''}`}>
                                {evento.local}{evento.nome_cidade ? ` / ${evento.nome_cidade}` : ''}
                            </td>
                            <td className="celula-cortada" title={evento.nome_cliente || ''}>{evento.nome_cliente || 'Não vinculado'}</td>
                            <td>{evento.status}</td>
                            <td className="acoes">
                                <button type="button" className="botao-acao editar" onClick={() => onEditar(evento)} title="Editar evento" aria-label={`Editar ${evento.nome_evento}`}>✎</button>
                                <button type="button" className="botao-acao excluir" onClick={() => onExcluir(evento)} title="Excluir evento" aria-label={`Excluir ${evento.nome_evento}`}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
