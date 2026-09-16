import { useState } from 'react';
import './calendar.css';

function Calendar() {
    const [dataAtual, setDataAtual] = useState(new Date());

    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay(); // qual dia da semana é o primeiro dia do mês (0 = domingo, 1 = segunda, ..., 6 = sábado)
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate(); // quantos dias tem o mês (0 = último dia do mês anterior, então usamos mes + 1 e dia 0)

    const dias = [];

    // Espaços antes do primeiro dia do mês
    for (let i = 0; i < primeiroDia; i++) {
        dias.push(null);
    }

    // Dias do mês
    for (let dia = 1; dia <= quantidadeDias; dia++) {
        dias.push(dia);
    }

    function mesAnterior() {
        setDataAtual(new Date(ano, mes - 1, 1));
    }

    function proximoMes() {
        setDataAtual(new Date(ano, mes + 1, 1));
    }

    const nomeMes = dataAtual.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="calendar">

            <div className="calendar-header">

                <button onClick={mesAnterior}>
                    &lt;
                </button>

                <h2>{nomeMes}</h2>

                <button onClick={proximoMes}>
                    &gt;
                </button>

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

                {dias.map((dia, index) => (
                    <span key={index}>
                        {dia}
                    </span>
                ))}

            </div>

        </div>
    );
}

export default Calendar;