import "./tabelaCliente.css";

function TabelaClientes({ clientes, onEditar, onExcluir }) {
    return (
        <div className="tabela-clientes">
            <table>
                <thead>
                    <tr>
                        <th>NOME</th>
                        <th>TELEFONE</th>
                        <th className="coluna-acoes">AÇÕES</th>
                    </tr>
                </thead>

                <tbody>
                    {clientes.length === 0 ? (
                        <tr>
                            <td
                                colSpan="3"
                                className="nenhum-cliente"
                            >
                                Nenhum cliente encontrado.
                            </td>
                        </tr>
                    ) : (
                        clientes.map((cliente) => (
                            <tr key={cliente.id_cliente}>
                                <td>{cliente.nome}</td>

                                <td>{cliente.telefone}</td>

                                <td className="acoes">
                                    <button
                                        className="botao-acao editar"
                                        onClick={() => onEditar(cliente)}
                                        title="Editar cliente"
                                    >
                                        ✎
                                    </button>

                                    <button
                                        className="botao-acao excluir"
                                        onClick={() =>
                                            onExcluir(cliente.id_cliente)
                                        }
                                        title="Excluir cliente"
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

export default TabelaClientes;