const pool = require('../database/connection');

function criarErro(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function normalizarNumero(valor, padrao = 0) {
    if (valor === '' || valor === null || valor === undefined) return padrao;
    const texto = typeof valor === 'string' ? valor.trim().replace(',', '.') : valor;
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : NaN;
}

function arredondarMoeda(valor) {
    return Math.round((Number(valor) + Number.EPSILON) * 100) / 100;
}

function validarSinalPagamento(sinalInformado, valorFinal) {
    const sinalNum = normalizarNumero(sinalInformado, NaN);
    if (!Number.isFinite(sinalNum) || sinalNum < 0) {
        throw criarErro('Informe um valor de sinal de pagamento válido e não negativo.');
    }

    const sinalArredondado = arredondarMoeda(sinalNum);
    const sinalMinimo = arredondarMoeda(Number(valorFinal) * 0.3);
    const valorMaximo = arredondarMoeda(valorFinal);

    if (sinalArredondado < sinalMinimo) {
        throw criarErro(
            `O sinal deve ser de pelo menos R$ ${sinalMinimo.toFixed(2).replace('.', ',')} (30% do valor final).`
        );
    }

    if (sinalArredondado > valorMaximo) {
        throw criarErro(
            `O sinal não pode ser maior que o valor final (R$ ${valorMaximo.toFixed(2).replace('.', ',')}).`
        );
    }

    return sinalArredondado;
}

async function listarEventosParaOrcamento() {
    const [rows] = await pool.query(`
        SELECT
            E.id_evento,
            E.nome_evento,
            DATE_FORMAT(E.data_evento, '%Y-%m-%d') AS data_evento,
            TIME_FORMAT(E.horario_inicio, '%H:%i') AS horario_inicio,
            TIME_FORMAT(E.horario_fim, '%H:%i') AS horario_fim,
            E.local,
            E.status,
            E.n_convidados,
            E.fk_Cliente_id_cliente,
            E.fk_Cidade_id_cidade,
            C.nome AS nome_cliente,
            CID.nome AS nome_cidade,
            COALESCE(CID.taxa_deslocamento, 0) AS taxa_deslocamento,
            COUNT(ES.FK_Servico_id_servico) AS total_servicos
        FROM Evento E
        LEFT JOIN Cliente C
            ON E.fk_Cliente_id_cliente = C.id_cliente
        LEFT JOIN Cidade CID
            ON E.fk_Cidade_id_cidade = CID.id_cidade
        LEFT JOIN EVENTO_SERVICO ES
            ON ES.FK_Evento_id_evento = E.id_evento
        GROUP BY
            E.id_evento, E.nome_evento, E.data_evento, E.horario_inicio, E.horario_fim,
            E.local, E.status, E.n_convidados, E.fk_Cliente_id_cliente, E.fk_Cidade_id_cidade,
            C.nome, CID.nome, CID.taxa_deslocamento
        ORDER BY E.data_evento DESC, E.id_evento DESC
    `);
    return rows;
}

async function calcularOrcamentoEvento(conexao, eventoId, descontoInformado = 0) {
    const idEvento = Number(eventoId);
    if (!Number.isInteger(idEvento) || idEvento <= 0) {
        throw criarErro('Informe um evento válido para calcular o orçamento.');
    }

    const desconto = normalizarNumero(descontoInformado, 0);
    if (!Number.isFinite(desconto) || desconto < 0) {
        throw criarErro('Informe um valor de desconto válido e não negativo.');
    }

    const [[evento]] = await conexao.query(`
        SELECT
            E.id_evento,
            E.nome_evento,
            E.n_convidados,
            E.fk_Cidade_id_cidade,
            CID.nome AS nome_cidade,
            COALESCE(CID.taxa_deslocamento, 0) AS taxa_deslocamento
        FROM Evento E
        LEFT JOIN Cidade CID
            ON CID.id_cidade = E.fk_Cidade_id_cidade
        WHERE E.id_evento = ?
        LIMIT 1
    `, [idEvento]);

    if (!evento) {
        throw criarErro('O evento informado não está cadastrado!', 404);
    }

    const nConvidados = Number(evento.n_convidados || 0);
    if (!Number.isInteger(nConvidados) || nConvidados <= 0) {
        throw criarErro('O evento precisa ter um número de convidados válido maior que zero.');
    }

    if (!evento.fk_Cidade_id_cidade) {
        throw criarErro('O evento precisa ter uma cidade vinculada para calcular a taxa de deslocamento.');
    }

    const [servicosVinculados] = await conexao.query(`
        SELECT
            ES.FK_Servico_id_servico AS id_servico,
            ES.quantidade,
            ES.preco_praticado,
            S.nome AS nome_servico,
            S.preco_base,
            S.preco_mao_obra,
            S.visivel
        FROM EVENTO_SERVICO ES
        INNER JOIN Servico S
            ON S.id_servico = ES.FK_Servico_id_servico
        WHERE ES.FK_Evento_id_evento = ?
        ORDER BY S.nome ASC, S.id_servico ASC
    `, [idEvento]);

    if (!servicosVinculados.length) {
        throw criarErro('Este evento não possui serviços vinculados para calcular o orçamento.');
    }

    let subtotalServicos = 0;
    const itensCalculados = [];

    for (const item of servicosVinculados) {
        if (!Boolean(Number(item.visivel))) {
            throw criarErro(`O serviço "${item.nome_servico}" está inativo/invisível e não pode compor orçamento.`);
        }

        const quantidade = Math.max(1, Number(item.quantidade || 1));
        const precoBase = Number(item.preco_base || 0);
        const precoPraticado = Number(item.preco_praticado || 0);
        const maoDeObra = Number(item.preco_mao_obra || 0);

        const [[faixaConvidado]] = await conexao.query(`
            SELECT preco_por_pessoa
            FROM Preco_convidado
            WHERE fk_Servico_id_servico = ?
              AND ? BETWEEN qtd_min_Convidados AND qtd_max_convidados
            ORDER BY qtd_min_Convidados DESC
            LIMIT 1
        `, [item.id_servico, nConvidados]);

        let subtotalItem;
        let valorUnitarioItem;
        let tipoCobranca;

        if (faixaConvidado) {
            const totalPorConvidados = arredondarMoeda(Number(faixaConvidado.preco_por_pessoa) * nConvidados);
            valorUnitarioItem = arredondarMoeda(Number(faixaConvidado.preco_por_pessoa));
            subtotalItem = arredondarMoeda(totalPorConvidados + maoDeObra);
            tipoCobranca = `faixa_convidados (${nConvidados} pessoas)`;
        } else {
            valorUnitarioItem = precoPraticado > 0 ? precoPraticado : precoBase;
            tipoCobranca = precoPraticado > 0 ? 'preco_praticado' : 'preco_base';
            subtotalItem = arredondarMoeda((valorUnitarioItem * quantidade) + maoDeObra);
        }

        subtotalServicos = arredondarMoeda(subtotalServicos + subtotalItem);

        itensCalculados.push({
            id_servico: item.id_servico,
            nome_servico: item.nome_servico,
            quantidade,
            valor_unitario: arredondarMoeda(valorUnitarioItem),
            mao_de_obra: arredondarMoeda(maoDeObra),
            subtotal_item: subtotalItem,
            tipo_cobranca: tipoCobranca
        });
    }

    const taxaDeslocamento = arredondarMoeda(evento.taxa_deslocamento);
    const valorTotal = arredondarMoeda(subtotalServicos + taxaDeslocamento);

    if (desconto > valorTotal) {
        throw criarErro('O desconto não pode ser maior que o valor total calculado.');
    }

    const descontoArredondado = arredondarMoeda(desconto);
    const valorFinal = arredondarMoeda(Math.max(0, valorTotal - descontoArredondado));
    const sinalMinimo = arredondarMoeda(valorFinal * 0.3);

    return {
        fk_Evento_id_evento: idEvento,
        nome_evento: evento.nome_evento,
        n_convidados: nConvidados,
        nome_cidade: evento.nome_cidade,
        subtotal_servicos: subtotalServicos,
        taxa_deslocamento: taxaDeslocamento,
        valor_total: valorTotal,
        desconto: descontoArredondado,
        valor_final: valorFinal,
        sinal_minimo: sinalMinimo,
        itens: itensCalculados
    };
}

async function obterPreviaOrcamento(eventoId, descontoInformado = 0) {
    const conexao = await pool.getConnection();
    try {
        return await calcularOrcamentoEvento(conexao, eventoId, descontoInformado);
    } finally {
        conexao.release();
    }
}

async function listarOrcamentos() {
    const [rows] = await pool.query(`
        SELECT
            O.id_orcamento,
            O.valor_total,
            O.desconto,
            O.valor_final,
            O.sinal_pagamento,
            O.fk_Evento_id_evento,
            E.nome_evento,
            E.data_evento,
            E.local,
            E.status,
            E.n_convidados,
            C.nome AS nome_cliente,
            CID.nome AS nome_cidade,
            COALESCE(CID.taxa_deslocamento, 0) AS taxa_deslocamento
        FROM Orcamento O
        INNER JOIN Evento E
            ON O.fk_Evento_id_evento = E.id_evento
        LEFT JOIN Cliente C
            ON E.fk_Cliente_id_cliente = C.id_cliente
        LEFT JOIN Cidade CID
            ON E.fk_Cidade_id_cidade = CID.id_cidade
        ORDER BY O.id_orcamento DESC
    `);
    return rows;
}

async function buscarOrcamentos(termo) {
    const pesquisa = String(termo ?? '').trim();
    if (!pesquisa) return listarOrcamentos();

    const [rows] = await pool.query(`
        SELECT
            O.id_orcamento,
            O.valor_total,
            O.desconto,
            O.valor_final,
            O.sinal_pagamento,
            O.fk_Evento_id_evento,
            E.nome_evento,
            E.data_evento,
            E.local,
            E.status,
            E.n_convidados,
            C.nome AS nome_cliente,
            CID.nome AS nome_cidade,
            COALESCE(CID.taxa_deslocamento, 0) AS taxa_deslocamento
        FROM Orcamento O
        INNER JOIN Evento E
            ON O.fk_Evento_id_evento = E.id_evento
        LEFT JOIN Cliente C
            ON E.fk_Cliente_id_cliente = C.id_cliente
        LEFT JOIN Cidade CID
            ON E.fk_Cidade_id_cidade = CID.id_cidade
        WHERE CAST(O.id_orcamento AS CHAR) LIKE ?
           OR CAST(O.fk_Evento_id_evento AS CHAR) LIKE ?
           OR E.nome_evento LIKE ?
           OR C.nome LIKE ?
           OR E.local LIKE ?
        ORDER BY O.id_orcamento DESC
    `, [`%${pesquisa}%`, `%${pesquisa}%`, `%${pesquisa}%`, `%${pesquisa}%`, `%${pesquisa}%`]);
    return rows;
}

async function cadastrarOrcamento(dados) {
    const { fk_Evento_id_evento, desconto, sinal_pagamento } = dados || {};
    const eventoId = Number(fk_Evento_id_evento);

    if (!Number.isInteger(eventoId) || eventoId <= 0 || sinal_pagamento === '' || sinal_pagamento === undefined || sinal_pagamento === null) {
        throw criarErro('Preencha todos os campos obrigatórios com valores válidos!');
    }

    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();

        const [orcamentoExistente] = await conexao.query(
            'SELECT id_orcamento FROM Orcamento WHERE fk_Evento_id_evento = ? LIMIT 1',
            [eventoId]
        );
        if (orcamentoExistente.length > 0) {
            throw criarErro('Já existe um orçamento cadastrado para este evento!', 409);
        }

        const calculo = await calcularOrcamentoEvento(conexao, eventoId, desconto);
        const sinalArredondado = validarSinalPagamento(sinal_pagamento, calculo.valor_final);

        const [resultado] = await conexao.query(`
            INSERT INTO Orcamento (valor_total, desconto, valor_final, sinal_pagamento, fk_Evento_id_evento)
            VALUES (?, ?, ?, ?, ?)
        `, [
            calculo.valor_total,
            calculo.desconto,
            calculo.valor_final,
            sinalArredondado,
            eventoId
        ]);

        await conexao.commit();

        return {
            id_orcamento: resultado.insertId,
            valor_total: calculo.valor_total,
            desconto: calculo.desconto,
            valor_final: calculo.valor_final,
            sinal_pagamento: sinalArredondado,
            fk_Evento_id_evento: eventoId,
            detalhes_calculo: calculo,
            mensagem: 'Orçamento cadastrado com sucesso!'
        };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_DUP_ENTRY') {
            throw criarErro('Já existe um orçamento cadastrado para este evento!', 409);
        }
        throw erro;
    } finally {
        conexao.release();
    }
}

async function atualizarOrcamento(id, dados) {
    const idOrcamento = Number(id);
    if (!Number.isInteger(idOrcamento) || idOrcamento <= 0) {
        throw criarErro('ID do orçamento inválido!');
    }

    const { fk_Evento_id_evento, desconto, sinal_pagamento } = dados || {};
    const eventoId = Number(fk_Evento_id_evento);

    if (!Number.isInteger(eventoId) || eventoId <= 0 || sinal_pagamento === '' || sinal_pagamento === undefined || sinal_pagamento === null) {
        throw criarErro('Preencha todos os campos obrigatórios com valores válidos!');
    }

    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();

        const [orcamentos] = await conexao.query(
            'SELECT id_orcamento FROM Orcamento WHERE id_orcamento = ? FOR UPDATE',
            [idOrcamento]
        );
        if (orcamentos.length === 0) {
            throw criarErro('Orçamento não encontrado!', 404);
        }

        const [conflitoEvento] = await conexao.query(
            'SELECT id_orcamento FROM Orcamento WHERE fk_Evento_id_evento = ? AND id_orcamento <> ? LIMIT 1',
            [eventoId, idOrcamento]
        );
        if (conflitoEvento.length > 0) {
            throw criarErro('Já existe um orçamento cadastrado para este evento!', 409);
        }

        const calculo = await calcularOrcamentoEvento(conexao, eventoId, desconto);
        const sinalArredondado = validarSinalPagamento(sinal_pagamento, calculo.valor_final);

        await conexao.query(`
            UPDATE Orcamento
            SET valor_total = ?, desconto = ?, valor_final = ?, sinal_pagamento = ?, fk_Evento_id_evento = ?
            WHERE id_orcamento = ?
        `, [
            calculo.valor_total,
            calculo.desconto,
            calculo.valor_final,
            sinalArredondado,
            eventoId,
            idOrcamento
        ]);

        await conexao.commit();

        return {
            id_orcamento: idOrcamento,
            valor_total: calculo.valor_total,
            desconto: calculo.desconto,
            valor_final: calculo.valor_final,
            sinal_pagamento: sinalArredondado,
            fk_Evento_id_evento: eventoId,
            detalhes_calculo: calculo,
            mensagem: 'Orçamento atualizado com sucesso!'
        };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_DUP_ENTRY') {
            throw criarErro('Já existe um orçamento cadastrado para este evento!', 409);
        }
        throw erro;
    } finally {
        conexao.release();
    }
}

async function excluirOrcamento(id) {
    const idOrcamento = Number(id);
    if (!Number.isInteger(idOrcamento) || idOrcamento <= 0) {
        throw criarErro('ID do orçamento inválido!');
    }

    const [resultado] = await pool.query(
        'DELETE FROM Orcamento WHERE id_orcamento = ?',
        [idOrcamento]
    );

    if (resultado.affectedRows === 0) {
        throw criarErro('Orçamento não encontrado!', 404);
    }

    return { mensagem: 'Orçamento excluído com sucesso!' };
}

module.exports = {
    listarEventosParaOrcamento,
    obterPreviaOrcamento,
    listarOrcamentos,
    buscarOrcamentos,
    cadastrarOrcamento,
    atualizarOrcamento,
    excluirOrcamento
};