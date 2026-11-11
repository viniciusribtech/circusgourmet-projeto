const pool = require('../database/connection');

async function listarOrcamentos() {
    try {
        const query = `
            SELECT *
            FROM Orcamento
            ORDER BY id_orcamento DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    } catch (erro) {
        console.error("Erro ao listar orçamentos:", erro);
        throw erro;
    }
}

async function buscarOrcamentos(termo) {
    try {
        const query = `
            SELECT *
            FROM Orcamento
            WHERE CAST(id_orcamento AS CHAR) LIKE ?
               OR CAST(fk_Evento_id_evento AS CHAR) LIKE ?
            ORDER BY id_orcamento DESC
        `;
        const wildcard = `%${termo}%`;
        const [rows] = await pool.query(query, [wildcard, wildcard]);
        return rows;
    } catch (erro) {
        console.error("Erro ao buscar orçamentos:", erro);
        throw erro;
    }
}

async function cadastrarOrcamento(dados) {
    const { valor_total, desconto, valor_final, sinal_pagamento, fk_Evento_id_evento } = dados;

    const totalNum = Number(valor_total);
    const descNum = Number(desconto || 0);
    const finalNum = Number(valor_final);
    const sinalNum = Number(sinal_pagamento || 0);
    const eventoId = Number(fk_Evento_id_evento);

    if (!Number.isFinite(totalNum) || !Number.isFinite(finalNum) || !Number.isInteger(eventoId)) {
        throw new Error("Preencha todos os campos obrigatórios com valores válidos!");
    }

    try {
        const [eventos] = await pool.query('SELECT id_evento FROM Evento WHERE id_evento = ?', [eventoId]);
        if (eventos.length === 0) {
            throw new Error("O evento informado não está cadastrado!");
        }

        const [orcamentoExistente] = await pool.query('SELECT id_orcamento FROM Orcamento WHERE fk_Evento_id_evento = ?', [eventoId]);
        if (orcamentoExistente.length > 0) {
            throw new Error("Já existe um orçamento cadastrado para este evento!");
        }

        const query = `
            INSERT INTO Orcamento (valor_total, desconto, valor_final, sinal_pagamento, fk_Evento_id_evento)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(query, [
            totalNum,
            descNum,
            finalNum,
            sinalNum,
            eventoId
        ]);

        return {
            id_orcamento: resultado.insertId,
            valor_total: totalNum,
            desconto: descNum,
            valor_final: finalNum,
            sinal_pagamento: sinalNum,
            fk_Evento_id_evento: eventoId
        };

    } catch (erro) {
        console.error("Erro ao cadastrar orçamento:", erro);
        throw erro;
    }
}

async function atualizarOrcamento(id, dados) {
    const idOrcamento = Number(id);
    const { valor_total, desconto, valor_final, sinal_pagamento, fk_Evento_id_evento } = dados;

    if (!Number.isInteger(idOrcamento) || idOrcamento <= 0) {
        throw new Error("ID do orçamento inválido!");
    }

    const totalNum = Number(valor_total);
    const descNum = Number(desconto || 0);
    const finalNum = Number(valor_final);
    const sinalNum = Number(sinal_pagamento || 0);
    const eventoId = Number(fk_Evento_id_evento);

    if (!Number.isFinite(totalNum) || !Number.isFinite(finalNum) || !Number.isInteger(eventoId)) {
        throw new Error("Preencha todos os campos obrigatórios com valores válidos!");
    }

    try {
        const [orcamentos] = await pool.query('SELECT id_orcamento FROM Orcamento WHERE id_orcamento = ?', [idOrcamento]);
        if (orcamentos.length === 0) {
            throw new Error("Orçamento não encontrado!");
        }

        const query = `
            UPDATE Orcamento
            SET valor_total = ?, desconto = ?, valor_final = ?, sinal_pagamento = ?, fk_Evento_id_evento = ?
            WHERE id_orcamento = ?
        `;

        await pool.query(query, [
            totalNum,
            descNum,
            finalNum,
            sinalNum,
            eventoId,
            idOrcamento
        ]);

        return {
            id_orcamento: idOrcamento,
            valor_total: totalNum,
            desconto: descNum,
            valor_final: finalNum,
            sinal_pagamento: sinalNum,
            fk_Evento_id_evento: eventoId
        };

    } catch (erro) {
        console.error("Erro ao atualizar orçamento:", erro);
        throw erro;
    }
}

async function excluirOrcamento(id) {
    const idOrcamento = Number(id);

    if (!Number.isInteger(idOrcamento) || idOrcamento <= 0) {
        throw new Error("ID do orçamento inválido!");
    }

    try {
        const [resultado] = await pool.query('DELETE FROM Orcamento WHERE id_orcamento = ?', [idOrcamento]);

        if (resultado.affectedRows === 0) {
            throw new Error("Orçamento não encontrado!");
        }

        return {
            mensagem: "Orçamento excluído com sucesso!"
        };

    } catch (erro) {
        console.error("Erro ao excluir orçamento:", erro);
        throw erro;
    }
}

module.exports = {
    listarOrcamentos,
    buscarOrcamentos,
    cadastrarOrcamento,
    atualizarOrcamento,
    excluirOrcamento
};