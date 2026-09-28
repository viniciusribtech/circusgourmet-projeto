import { useState } from 'react';
import './calendar.css';

function Calendar({ eventos = [], onMudancaMes }) {
    const [dataAtual, setDataAtual] = useState(new Date());

    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

    const dias = [];

    for (let i = 0; i < primeiroDia; i++) {
        dias.push(null);
    }

    for (let dia = 1; dia <= quantidadeDias; dia++) {
        dias.push(dia);
    }

    function mesAnterior() {
        const novaData = new Date(ano, mes - 1, 1);
        setDataAtual(novaData);
        if (onMudancaMes) onMudancaMes(novaData); // Avisa o componente Pai (Home)
    }

    function proximoMes() {
        const novaData = new Date(ano, mes + 1, 1);
        setDataAtual(novaData);
        if (onMudancaMes) onMudancaMes(novaData); // Avisa o componente Pai (Home)
    }

    const nomeMes = dataAtual.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    function eventosDoDia(dia) {
        if (!dia) return [];

        return eventos.filter((evento) => {
            const dataEvento = new Date(evento.data + 'T00:00:00'); // Evita problemas de fuso horário

            return (
                dataEvento.getFullYear() === ano &&
                dataEvento.getMonth() === mes &&
                dataEvento.getDate() === dia
            );
        });
    }

    return (
        <div className="calendar">
            <div className="calendar-header">
               <div className="calendar-header-esquerda">
                    <button onClick={mesAnterior}> &lt; </button>
                    <h2>{nomeMes}</h2>
                    <button onClick={proximoMes}> &gt;</button>
                </div>
            </div>

           <div className="week-days">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
            </div>

            <div className="calendar-days">
                {dias.map((dia, index) => {
                    const eventosDia = eventosDoDia(dia);

                    return (
                        <div key={index} className="calendar-cell">
                            <span className="numero-dia">{dia}</span>

                            {eventosDia.map((evento, i) => (
                                <div
                                    key={i}
                                    className={`pill-evento ${evento.categoria || 'corporativo'}`}
                                    title={evento.titulo}
                                >
                                    {evento.titulo}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Calendar;