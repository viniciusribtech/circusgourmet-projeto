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
  const [dadosDashboard, setDadosDashboard] = useState(null);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());

  // Função para buscar os dados da API considerando o ano e o mês ativos
  const carregarDados = async (dataFiltro) => {
      try {
          const ano = dataFiltro.getFullYear();
          const mes = dataFiltro.getMonth() + 1;

          const resposta = await fetch(`http://localhost:3000/api/dashboard?year=${ano}&month=${mes}`);
          const json = await resposta.json();
          
          if (json.success) {
              console.log("Dados recebidos da API:", json.data);
              setDadosDashboard(json.data);
          }
      } catch (erro) {
          console.error("Erro na conexão com o backend:", erro);
      }
  };

  // Carrega os dados sempre que a página monta ou a data selecionada muda
  useEffect(() => {
      carregarDados(dataSelecionada);
  }, [dataSelecionada]);

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
            {/* Passamos a função para atualizar o mês quando o usuário clicar nas setas */}
            <Calendar 
                eventos={dadosDashboard.calendarEvents} 
                onMudancaMes={(novaData) => setDataSelecionada(novaData)}
            />
          </div>
          <div className="coluna-lateral">
            <OcupacaoCarrinhos carrinhos={dadosDashboard.cartOccupancy} />
            <ProximoEvento eventos={dadosDashboard.upcomingEvents} />
            <EstatisticasRapidas 
              orcamentos={dadosDashboard.statistics.budgets} 
              ativos={dadosDashboard.statistics.activeCarts} 
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;