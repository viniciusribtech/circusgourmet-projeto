import './proximoEvento.css';

function ProximoEvento({ eventos }) {

    return (
        <div className="proximo-evento">

            <h3>PRÓXIMOS EVENTOS</h3>

            {eventos.length === 0 ? (
                <p>Nenhum evento cadastrado.</p>
            ) : (
                eventos.slice(0, 3).map((evento, index) => (
                    <div className="evento" key={index}>
                        <strong>{evento.data_evento}</strong>
                        <span>{evento.horario_inicio} - {evento.local}</span>
                    </div>
                ))
            )}

        </div>
    );
}

export default ProximoEvento;