import Navbar from "../../components/BarraNav/navbar.jsx";
import Calendar from "../../components/Calendario/calendar.jsx";
import CabecalhoPagina from "../../components/CabecalhoPagina/cabecalhoPagina.jsx";
import Botao from "../../components/Botao/botao.jsx";
import OcupacaoCarrinhos from "../../components/OcupacaoCarrinhos/ocupacaoCarrinhos.jsx";
import ProximoEvento from "../../components/ProximoEvento/proximoEvento.jsx";
import EstatisticasRapidas from "../../components/EstatisticasRapidas/estatisticasRapidas.jsx"

import "./home.css";





function Home() {
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
            <Calendar eventos={[]} />
          </div>
          <div className="coluna-lateral">
            <OcupacaoCarrinhos carrinhos={[]} />
            <ProximoEvento eventos ={[]} />
            <EstatisticasRapidas orcamentos={[]} ativos={[]} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;