import Navbar from "../../components/BarraNav/navbar.jsx";
import Calendar from "../../components/Calendario/calendar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import OcupacaoCarrinhos from "../../components/OcupacaoCarrinhos/ocupacaoCarrinhos.jsx";
import ProximoEvento from "../../components/ProximoEvento/proximoEvento.jsx";
import EstatisticasRapidas from "../../components/EstatisticasRapidas/estatisticasRapidas.jsx"

import "./home.css";

import { useState, useEffect } from 'react';




function Home() {
  // 1. Cria a variável que vai guardar os dados do MySQL
  const [dadosDashboard, setDadosDashboard] = useState(null);

    // 2. Chama o teu backend assim que a página Home carregar
    useEffect(() => {
        const carregarDados = async () => {
            try {
                // Bate na rota GET que tu e o Osmir criaram
                const resposta = await fetch('http://localhost:3000/api/dashboard');
                const json = await resposta.json();
                
                if (json.success) {
                    console.log("Dados recebidos da API:", json.data);
                    setDadosDashboard(json.data); // Guarda os dados no React
                }
            } catch (erro) {
                console.error("Erro na conexão com o backend:", erro);
            }
        };

        carregarDados();
    }, []);

    // 3. Mostra um "Carregando" rápido enquanto o Node.js não responde
    if (!dadosDashboard) {
        return <div style={{ padding: '20px' }}>A carregar dados do servidor...</div>;
    }
  return (
    <>
      <Navbar />
      <div className="conteudo-principal">
        <div className="linha-titulo">
          <CabecalhoPagina
            titulo="Calendário Operacional"
            subtitulo="Gestão centralizada de eventos e logística de carrinhos gourmet."
          />
          <Botao onClick={() => alert("Abrir modal de novo evento")}>
            Novo Evento
          </Botao>
        </div>

        <div className="grid-principal">
          <div className="coluna-calendario">
            <Calendar eventos={dadosDashboard.calendarEvents} />
          </div>
          <div className="coluna-lateral">
            <OcupacaoCarrinhos carrinhos={dadosDashboard.cartOccupancy} />
            <ProximoEvento eventos ={dadosDashboard.upcomingEvents} />
            <EstatisticasRapidas orcamentos={dadosDashboard.statistics.budgets} 
            ativos={dadosDashboard.statistics.activeCarts} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;