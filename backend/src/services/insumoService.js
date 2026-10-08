const pool = require('../database/connection');

// 1. Listar todos os insumos
async function listarInsumos() {
    try {
        const [rows] = await pool.query(
            'SELECT id_insumo, nome, custo_unitario FROM Insumo ORDER BY id_insumo DESC'
        );
        return rows;
    } catch (erro) {
        console.error("Erro ao listar insumos:", erro);
        throw erro;
    }
}

// 2. Buscar insumo por termo de pesquisa
async function buscarInsumos(termo) {
    if (!termo || termo.trim() === '') {
        throw new Error('Preencha a barra de pesquisa!');
    }

    try {
        let rows = [];
        const termoNumerico = parseFloat(termo);

        // Se for um número válido, pesquisa por custo unitário
        if (!isNaN(termoNumerico)) {
            const query = 'SELECT id_insumo, nome, custo_unitario FROM Insumo WHERE custo_unitario = ?';
            [rows] = await pool.query(query, [termoNumerico]);
        } else {
            // Se não for número, pesquisa por nome
            const query = 'SELECT id_insumo, nome, custo_unitario FROM Insumo WHERE nome LIKE ?';
            const wildcard = `%${termo}%`;
            [rows] = await pool.query(query, [wildcard]);
        }

        if (rows.length === 0) {
            throw new Error('Resultados não encontrados!');
        }

        return rows;
    } catch (erro) {
        console.error("Erro ao buscar insumos:", erro);
        throw erro;
    }
}

// 3. Cadastrar Insumo
async function cadastrarInsumo(dados) {
    const { nome, custo_unitario } = dados;

    if (!nome || custo_unitario === undefined || custo_unitario === null) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    const custoValidado = parseFloat(custo_unitario);
    if (isNaN(custoValidado) || custoValidado < 0) {
        throw new Error("Formato inválido!");
    }

    try {
        // Verifica duplicidade de nome (Aqui é pelo documento de especificação de requisitos)
        const [insumoExistente] = await pool.query(
            'SELECT id_insumo FROM Insumo WHERE nome = ?',
            [nome]
        );

        if (insumoExistente.length > 0) {
            throw new Error("Insumo já cadastrado!");
        }

        const query = 'INSERT INTO Insumo (nome, custo_unitario) VALUES (?, ?)';
        const [resultado] = await pool.query(query, [nome, custoValidado]);

        return {
            id_insumo: resultado.insertId,
            nome,
            custo_unitario: custoValidado
        };
    } catch (erro) {
        console.error("Erro ao cadastrar insumo:", erro);
        throw erro;
    }
}

// 4. Atualizar Insumo
async function atualizarInsumo(id, dados) {
    const { nome, custo_unitario } = dados;

    if (!nome || custo_unitario === undefined || custo_unitario === null) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    const custoValidado = parseFloat(custo_unitario);
    if (isNaN(custoValidado) || custoValidado < 0) {
        throw new Error("Formato inválido!");
    }

    try {
        // Verifica se o insumo existe
        const [insumoAtual] = await pool.query(
            'SELECT id_insumo FROM Insumo WHERE id_insumo = ?',
            [id]
        );

        if (insumoAtual.length === 0) {
            throw new Error("Sem resultados para esse insumo!");
        }

        // Verifica conflito de nome (se o nome já pertence a OUTRO id_insumo)
        const [insumoComMesmoNome] = await pool.query(
            'SELECT id_insumo FROM Insumo WHERE nome = ? AND id_insumo != ?',
            [nome, id]
        );

        if (insumoComMesmoNome.length > 0) {
            throw new Error("Insumo já cadastrado!");
        }

        const query = 'UPDATE Insumo SET nome = ?, custo_unitario = ? WHERE id_insumo = ?';
        await pool.query(query, [nome, custoValidado, id]);

        return {
            id_insumo: id,
            nome,
            custo_unitario: custoValidado
        };
    } catch (erro) {
        console.error("Erro ao atualizar insumo:", erro);
        throw erro;
    }
}

// 5. Excluir Insumo
async function excluirInsumo(id) {
    try {
        const [resultado] = await pool.query(
            'DELETE FROM Insumo WHERE id_insumo = ?',
            [id]
        );

        // Se nenhuma linha foi afetada, o id não existia
        if (resultado.affectedRows === 0) {
            throw new Error("Sem resultados para esse insumo!");
        }

        return {
            mensagem: "Insumo excluído com sucesso!"
        };
    } catch (erro) {
        // Captura o erro específico de chave estrangeira do MySQL
        if (erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.message.includes('foreign key constraint fails')) {
            throw new Error("Não é possível excluir este insumo, pois ele está vinculado a um ou mais serviços!");
        }

        console.error("Erro ao excluir insumo:", erro);
        throw erro;
    }
}

module.exports = {
    listarInsumos,
    buscarInsumos,
    cadastrarInsumo,
    atualizarInsumo,
    excluirInsumo
};