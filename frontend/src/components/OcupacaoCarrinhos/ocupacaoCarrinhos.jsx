import './ocupacaoCarrinhos.css';

function OcupacaoCarrinhos({ carrinhos = [] }) {
    return (
        <div className="cartao-ocupacao">
            <h3 className="titulo-secao">Ocupação de Carrinhos</h3>

            {carrinhos.length === 0 ? (
                <p className="mensagem-vazia">Nenhum carrinho cadastrado.</p>
            ) : (
                <div className="lista-ocupacao">
                    {carrinhos.map((carrinho) => {
                        const porcentagem = (carrinho.usado / carrinho.total) * 100;

                        return (
                            <div key={carrinho.id} className="item-ocupacao">
                                <div className="linha-ocupacao">
                                    <span className="nome-carrinho">{carrinho.nome}</span>
                                    <span className={`contador ${carrinho.cor}`}>
                                        {carrinho.usado}/{carrinho.total}
                                    </span>
                                </div>

                                <div className="barra-fundo">
                                    <div
                                        className={`barra-preenchida ${carrinho.cor}`}
                                        style={{ width: `${porcentagem}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default OcupacaoCarrinhos;