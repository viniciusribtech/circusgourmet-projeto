import { Children } from 'react'
import './botao.css'

function Botao({ children, ...props }){
    return(
        <button className="botao"{...props}>{children}</button>
    );
}

export default Botao;