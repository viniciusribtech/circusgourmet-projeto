import { useEffect, useState } from "react";
import "./popUpFormulario.css";

// Reutilizado por Cliente, Insumo e Serviço.
// Os novos atributos dos campos são opcionais para preservar os formulários antigos.
function PopUpFormulario({
    aberto, titulo, subtitulo, cliente, campos = [], onSalvar, onFechar,
    erro = "", salvando = false
}) {
    const [dados, setDados] = useState({});

    useEffect(() => {
        const dadosIniciais = {};
        campos.forEach((campo) => {
            dadosIniciais[campo.nome] = cliente?.[campo.nome] ?? campo.valorPadrao ?? "";
        });
        setDados(dadosIniciais);
    }, [cliente, campos, aberto]);

    useEffect(() => {
        if (!aberto) return;
        function aoPressionarTecla(evento) {
            if (evento.key === 'Escape' && !salvando) onFechar();
        }
        window.addEventListener('keydown', aoPressionarTecla);
        return () => window.removeEventListener('keydown', aoPressionarTecla);
    }, [aberto, onFechar, salvando]);

    if (!aberto) return null;

    const formularioServico = false; // Estilo compartilhado dos formulários.

    // Entrada em formato brasileiro de 24 horas, independente do idioma do navegador.
    function formatarHora24(valor) {
        const digitos = String(valor).replace(/\D/g, '').slice(0, 4);
        return digitos.length > 2
            ? `${digitos.slice(0, 2)}:${digitos.slice(2)}`
            : digitos;
    }

    function alterarCampo(nome, valor, campo) {
        // Regra opcional, utilizada somente pelo preco_base de Serviço:
        // DECIMAL(5,2) = até 3 dígitos inteiros e 2 casas decimais.
        if (campo?.limitarPrecoServico) {
            if (!/^\d{0,3}(?:[.,]\d{0,2})?$/.test(valor)) return;
        }
        setDados((anteriores) => ({ ...anteriores, [nome]: valor }));
    }

    function salvar(evento) {
        evento.preventDefault();
        if (!salvando) onSalvar(dados);
    }

    return (
        <div className={`popup-fundo ${formularioServico ? "popup-fundo-servico" : ""}`}>
            <div className={`popup-formulario ${formularioServico ? "popup-formulario-servico" : ""}`} role="dialog" aria-modal="true" aria-label={titulo}>
                <div className="popup-cabecalho">
                    <h2>{titulo}</h2>
                    <button type="button" className="popup-fechar" onClick={onFechar}
                        disabled={salvando} aria-label="Fechar formulário">×</button>
                </div>
                {subtitulo && <p className="popup-subtitulo">{subtitulo}</p>}
                {erro && <p className="popup-erro" role="alert">{erro}</p>}
                <form onSubmit={salvar}>
                    <div className="popup-campos">
                    {campos.map((campo) => {
                        const obrigatorio = campo.obrigatorio !== false;
                        const identificador = `campo-popup-${campo.nome}`;
                        return (
                            <div className={`campo-formulario campo-formulario-${campo.nome === "fk_Categoria_id_categoria" ? "categoria" : campo.nome}${campo.tipo === 'checkbox' ? ' campo-formulario-checkbox' : ''}`} key={campo.nome}>
                                {campo.tipo === 'checkbox' ? (
                                    <label className="campo-checkbox-label" htmlFor={identificador}>
                                        <input id={identificador} type="checkbox" checked={Boolean(dados[campo.nome])}
                                            onChange={(evento) => alterarCampo(campo.nome, evento.target.checked, campo)} disabled={salvando} />
                                        <span>{campo.label}{obrigatorio ? <span className="popup-indicador-obrigatorio"> *</span> : ''}</span>
                                    </label>
                                ) : (
                                    <label htmlFor={identificador}>{campo.label}{obrigatorio ? <span className="popup-indicador-obrigatorio"> *</span> : ''}</label>
                                )}
                                {campo.tipo === 'checkbox' ? null : campo.tipo === 'selecao' ? (
                                    <select id={identificador} value={dados[campo.nome] ?? ''}
                                        onChange={(evento) => alterarCampo(campo.nome, evento.target.value, campo)}
                                        required={obrigatorio} disabled={salvando}>
                                        <option value="">{campo.placeholder || 'Selecione uma opção'}</option>
                                        {(campo.opcoes || []).map((opcao) => (
                                            <option key={opcao.valor} value={opcao.valor}>{opcao.rotulo}</option>
                                        ))}
                                    </select>
                                ) : campo.tipo === 'hora24' ? (
                                    <input id={identificador} type="text"
                                        value={dados[campo.nome] ?? ''} placeholder="HH:MM (00:00–23:59)"
                                        maxLength={5} inputMode="numeric" autoComplete="off"
                                        pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]"
                                        title="Informe um horário entre 00:00 e 23:59 (formato 24 horas)"
                                        required={obrigatorio} disabled={salvando}
                                        onChange={(evento) => alterarCampo(campo.nome, formatarHora24(evento.target.value), campo)} />
                                ) : campo.tipo === 'texto-longo' ? (
                                    <textarea id={identificador} value={dados[campo.nome] ?? ''}
                                        placeholder={campo.placeholder} maxLength={campo.tamanhoMaximo}
                                        rows={campo.linhas || 4} required={obrigatorio} disabled={salvando}
                                        onChange={(evento) => alterarCampo(campo.nome, evento.target.value, campo)} />
                                ) : (
                                    <input id={identificador} type={campo.tipo || 'text'}
                                        value={dados[campo.nome] ?? ''} placeholder={campo.placeholder}
                                        maxLength={campo.tamanhoMaximo} required={obrigatorio}
                                        disabled={salvando} inputMode={campo.modoEntrada}
                                        onChange={(evento) => alterarCampo(campo.nome, evento.target.value, campo)} />
                                )}
                            </div>
                        );
                    })}
                    </div>
                    {formularioServico && <div className="popup-nota-servico"><span aria-hidden="true">ⓘ</span><p>Campos marcados com <strong>*</strong> são obrigatórios para cadastrar o serviço.</p></div>}
                    <div className="popup-acoes">
                        <button type="button" className="botao-cancelar" onClick={onFechar} disabled={salvando}>Cancelar</button>
                        <button type="submit" className="botao-salvar" disabled={salvando}>
                            {salvando ? 'Salvando...' : cliente ? 'Salvar Alterações' : 'Cadastrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PopUpFormulario;
