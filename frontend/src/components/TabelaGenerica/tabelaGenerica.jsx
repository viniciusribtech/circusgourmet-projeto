import "./tabelaGenerica.css";

function TabelaGenerica({ colunas, dados, chaveId, onEditar, onExcluir, mensagemVazia = "Nenhum registro encontrado." }) {
    return (
        <div className="tabela-generica">
            <table>
                <thead>
                    <tr>
                        {colunas.map((col, index) => (
                            <th 
                                key={index} 
                                style={{ width: col.largura || "auto", textAlign: col.alinhamento || "left" }}
                            >
                                {col.titulo}
                            </th>
                        ))}
                        {(onEditar || onExcluir) && <th className="coluna-acoes">AÇÕES</th>}
                    </tr>
                </thead>

                <tbody>
                    {dados.length === 0 ? (
                        <tr>
                            <td colSpan={colunas.length + (onEditar || onExcluir ? 1 : 0)} className="mensagem-vazia">
                                {mensagemVazia}
                            </td>
                        </tr>
                    ) : (
                        dados.map((item) => (
                            <tr key={item[chaveId]}>
                                {colunas.map((col, index) => (
                                    <td key={index} style={{ textAlign: col.alinhamento || "left" }}>
                                        {col.render ? col.render(item) : item[col.campo]}
                                    </td>
                                ))}

                                {(onEditar || onExcluir) && (
                                    <td className="acoes">
                                        {onEditar && (
                                            <button
                                                className="botao-acao editar"
                                                onClick={() => onEditar(item)}
                                                title="Editar"
                                            >
                                                ✎
                                            </button>
                                        )}
                                        {onExcluir && (
                                            <button
                                                className="botao-acao excluir"
                                                onClick={() => onExcluir(item)}
                                                title="Excluir"
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TabelaGenerica;