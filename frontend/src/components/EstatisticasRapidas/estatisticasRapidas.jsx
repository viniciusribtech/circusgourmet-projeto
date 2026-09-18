import './estatisticasRapidas.css';

function EstatisticasRapidas({ orcamentos = 0, ativos = 0 }) {
    return (
        <div className="estatisticas-rapidas">
            <div className="card-estatistica primaria">
                <p className="rotulo">Orçamentos</p>
                <p className="valor">{String(orcamentos).padStart(2, '0')}</p>
            </div>

            <div className="card-estatistica secundaria">
                <p className="rotulo">Ativos</p>
                <p className="valor">{String(ativos).padStart(2, '0')}</p>
            </div>
        </div>
    );
}

export default EstatisticasRapidas;