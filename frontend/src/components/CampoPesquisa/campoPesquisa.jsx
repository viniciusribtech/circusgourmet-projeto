import "./campoPesquisa.css";

function CampoPesquisa({
    valor,
    onChange,
    onPesquisar,
    placeholder = "Pesquisar..."
}) {
    return (
        <div className="campo-pesquisa">
            <input
                type="text"
                value={valor}
                onChange={(evento) => onChange(evento.target.value)}
                placeholder={placeholder}
            />

            <button onClick={onPesquisar}>
                Pesquisar
            </button>
        </div>
    );
}

export default CampoPesquisa;