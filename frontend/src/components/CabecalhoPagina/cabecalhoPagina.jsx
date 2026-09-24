import "./cabecalhoPagina.css";

function CabecalhoPagina({titulo, subtitulo}){
    return(
        <div className="cabecalho-pagina">
            <h1>{titulo}</h1>
            {subtitulo && <p>{subtitulo}</p>}
        </div>
    );
}

export default CabecalhoPagina;

