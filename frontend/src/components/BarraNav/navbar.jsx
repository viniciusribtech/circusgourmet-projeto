import './navbar.css';
import logo from '../../assets/Logomarca_CircusGourmet.png';

function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">
                <img src={logo} alt="Logo Circus Gourmet" />
            </h1>

            <div className="nav-links">

                <button>Serviço</button>
                <button>Cliente</button>
                <button>Evento</button>
                <button>Orçamento</button>
                <button>Insumo</button>
                <button>Carrinho</button>
            </div>
        </nav>
    )
}

export default Navbar;