import { useEffect, useState } from "react";

import "./popUpFormulario.css";

function PopUpFormulario({
    aberto,
    titulo,
    subtitulo,
    cliente,
    campos,
    onSalvar,
    onFechar
}) {
    const [dados, setDados] = useState({});

    // Preenche os campos quando o popup é aberto
    // ou quando um cliente é selecionado para edição.
    useEffect(() => {
        if (cliente) {
            const dadosIniciais = {};

            campos.forEach((campo) => {
                dadosIniciais[campo.nome] = cliente[campo.nome] || "";
            });

            setDados(dadosIniciais);
        } else {
            const dadosIniciais = {};

            campos.forEach((campo) => {
                dadosIniciais[campo.nome] = "";
            });

            setDados(dadosIniciais);
        }
    }, [cliente, campos]);

    if (!aberto) {
        return null;
    }

    const alterarCampo = (nome, valor) => {
        setDados({
            ...dados,
            [nome]: valor
        });
    };

    const salvar = (evento) => {
        evento.preventDefault();

        onSalvar(dados);
    };

    return (
        <div className="popup-fundo">
            <div className="popup-formulario">

                <div className="popup-cabecalho">
                    <h2>{titulo}</h2>

                    <button
                        type="button"
                        className="popup-fechar"
                        onClick={onFechar}
                    >
                        ×
                    </button>
                </div>

                <p className="popup-subtitulo">
                    {subtitulo}
                </p>

                <form onSubmit={salvar}>

                    {campos.map((campo) => (
                        <div
                            className="campo-formulario"
                            key={campo.nome}
                        >
                            <label htmlFor={campo.nome}>
                                {campo.label} *
                            </label>

                            <input
                                id={campo.nome}
                                type="text"
                                value={dados[campo.nome] || ""}
                                onChange={(evento) =>
                                    alterarCampo(
                                        campo.nome,
                                        evento.target.value
                                    )
                                }
                                placeholder={campo.placeholder}
                                required
                            />
                        </div>
                    ))}

                    <div className="popup-acoes">

                        <button
                            type="button"
                            className="botao-cancelar"
                            onClick={onFechar}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="botao-salvar"
                        >
                            {cliente ? "Salvar" : "Cadastrar"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default PopUpFormulario;