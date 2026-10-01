import { NavLink, Link } from 'react-router-dom';
import './navbar.css';
import logo from '../../assets/Logomarca_CircusGourmet.png';

function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">
                <Link to="/">
                    <img src={logo} alt="Logo Circus Gourmet" />
                </Link>
            </h1>

            <div className="nav-links">
                <NavLink to="/servicos">Serviço</NavLink>
                <NavLink to="/clientes">Cliente</NavLink>
                <NavLink to="/eventos">Evento</NavLink>
                <NavLink to="/orcamentos">Orçamento</NavLink>
                <NavLink to="/insumos">Insumo</NavLink>
                <NavLink to="/carrinhos">Carrinho</NavLink>
            </div>
        </nav>
    )
}

export default Navbar;
