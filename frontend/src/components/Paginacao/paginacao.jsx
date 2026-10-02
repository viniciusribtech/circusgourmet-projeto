import "./paginacao.css";

function Paginacao({ paginaAtual, totalPaginas, onMudarPagina }) {
    return (
        <div className="paginacao">

            <button
                onClick={() => onMudarPagina(paginaAtual - 1)}
                disabled={paginaAtual === 1}
                aria-label="Página anterior"
            >
                ‹
            </button>

            {Array.from(
                { length: totalPaginas },
                (_, indice) => indice + 1
            ).map((pagina) => (
                <button
                    key={pagina}
                    className={pagina === paginaAtual ? "pagina-atual" : ""}
                    onClick={() => onMudarPagina(pagina)}
                >
                    {pagina}
                </button>
            ))}

            <button
                onClick={() => onMudarPagina(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
                aria-label="Próxima página"
            >
                ›
            </button>

        </div>
    );
}

export default Paginacao;