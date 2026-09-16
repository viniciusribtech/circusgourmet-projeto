import './navbar.css';

function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">Circus Gourmet</h1>

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