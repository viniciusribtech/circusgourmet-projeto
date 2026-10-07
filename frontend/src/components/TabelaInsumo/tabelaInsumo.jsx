import "./tabelaInsumo.css";

function TabelaInsumo({ insumos, onEditar, onExcluir }) {
    return (
        <div className="tabela-insumos">

            <table>

                <thead>
                    <tr>
                        <th>NOME</th>
                        <th>CUSTO UNITÁRIO</th>
                        <th className="coluna-acoes">AÇÕES</th>
                    </tr>
                </thead>

                <tbody>

                    {insumos.length === 0 ? (

                        <tr>
                            <td colSpan="3" className="nenhum-insumo">
                                Nenhum insumo encontrado.
                            </td>
                        </tr>

                    ) : (

                        insumos.map((insumo) => (

                            <tr key={insumo.id_insumo}>

                                <td>
                                    {insumo.nome}
                                </td>

                                <td>
                                    R$ {Number(insumo.custo_unitario).toFixed(2)}
                                </td>

                                <td className="acoes">

                                    <button
                                        className="botao-acao editar"
                                        onClick={() => onEditar(insumo)}
                                        title="Editar insumo"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        className="botao-acao excluir"
                                        onClick={() => onExcluir(insumo)}
                                        title="Excluir insumo"
                                    >
                                        🗑
                                    </button>

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>
    );
}

export default TabelaInsumo;