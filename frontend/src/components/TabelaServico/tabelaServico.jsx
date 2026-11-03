import './tabelaServico.css';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function TabelaServico({ servicos, onEditar, onExcluir }) {
    return (
        <div className="tabela-servicos">
            <table>
                <thead><tr>
                    <th>NOME DO SERVIÇO</th>
                    <th>PREÇO BASE</th>
                    <th>CATEGORIA</th>
                    <th className="coluna-acoes">AÇÕES</th>
                </tr></thead>
                <tbody>
                    {servicos.length === 0 ? (
                        <tr><td colSpan="4" className="nenhum-servico">Nenhum serviço encontrado.</td></tr>
                    ) : servicos.map((servico) => (
                        <tr key={servico.id_servico}>
                            <td className="nome-servico" title={servico.nome}>{servico.nome}</td>
                            <td>{formatadorMoeda.format(Number(servico.preco_base))}</td>
                            <td>{servico.nome_categoria || 'Sem categoria'}</td>
                            <td className="acoes">
                                <button type="button" className="botao-acao editar" onClick={() => onEditar(servico)} title="Editar serviço" aria-label={`Editar ${servico.nome}`}>✎</button>
                                <button type="button" className="botao-acao excluir" onClick={() => onExcluir(servico)} title="Excluir serviço" aria-label={`Excluir ${servico.nome}`}>🗑</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TabelaServico;
