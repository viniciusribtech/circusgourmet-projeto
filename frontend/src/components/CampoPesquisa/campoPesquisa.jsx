
import "./campoPesquisa.css";

function CampoPesquisa({
    valor,
    onChange,
    onPesquisar,
    onLimpar,
    placeholder = "Pesquisar..."
}) {
    const handleSubmit = (evento) => {
        evento.preventDefault();
        onPesquisar();
    };

    return (
        <form className="campo-pesquisa" onSubmit={handleSubmit}>
            <input
                type="text"
                value={valor}
                onChange={(evento) => onChange(evento.target.value)}
                placeholder={placeholder}
            />

            <button type="submit">
                Pesquisar
            </button>

            {onLimpar && (
                <button
                    type="button"
                    onClick={onLimpar}
                    className="botao-limpar-pesquisa"
                >
                    Limpar pesquisa
                </button>
            )}
        </form>
    );
}

export default CampoPesquisa;
