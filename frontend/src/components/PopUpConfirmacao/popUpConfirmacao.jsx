import "./popUpConfirmacao.css";

function PopUpConfirmacao({
    aberto,
    titulo = "Confirmar exclusão",
    mensagem,
    onConfirmar,
    onFechar
}) {
    if (!aberto) {
        return null;
    }

    return (
        <div className="popup-confirmacao-fundo">
            <div className="popup-confirmacao">

                <div className="popup-confirmacao-cabecalho">
                    <h2>{titulo}</h2>

                    <button
                        type="button"
                        className="popup-confirmacao-fechar"
                        onClick={onFechar}
                    >
                        ×
                    </button>
                </div>

                <p className="popup-confirmacao-mensagem">
                    {mensagem}
                </p>

                <div className="popup-confirmacao-acoes">
                    <button
                        type="button"
                        className="botao-cancelar"
                        onClick={onFechar}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        className="botao-confirmar-exclusao"
                        onClick={onConfirmar}
                    >
                        Excluir
                    </button>
                </div>

            </div>
        </div>
    );
}

export default PopUpConfirmacao;