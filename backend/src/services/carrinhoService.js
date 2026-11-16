const pool = require('../database/connection');


// 1. Listar todos os carrinhos
async function listarCarrinhos() {
    try {
        const query = `
            SELECT *
            FROM Carrinho
            ORDER BY id_carrinho DESC
        `;

        const [rows] = await pool.query(query);

        return rows;

    } catch (erro) {
        console.error("Erro ao listar carrinhos:", erro);
        throw erro;
    }
}


// 2. Buscar carrinhos por ID ou tipo de base
async function buscarCarrinhos(termo) {
    try {
        const query = `
            SELECT *
            FROM Carrinho
            WHERE tipo_base LIKE ?
               OR CAST(id_carrinho AS CHAR) LIKE ?
            ORDER BY id_carrinho DESC
        `;

        const wildcard = `%${termo}%`;

        const [rows] = await pool.query(query, [
            wildcard,
            wildcard
        ]);

        return rows;

    } catch (erro) {
        console.error("Erro ao buscar carrinhos:", erro);
        throw erro;
    }
}


// 3. Cadastrar carrinho
async function cadastrarCarrinho(dados) {
    const { tipo_base, capacidade, ativo } = dados;

    const capacidadeNumero = Number(capacidade);

    // Validar campos obrigatórios
    if (
        !tipo_base ||
        !tipo_base.trim() ||
        capacidade === undefined ||
        capacidade === null ||
        capacidade === '' ||
        ativo === undefined ||
        ativo === null
    ) {
        throw new Error("Preencha todos os campos obrigatórios!");
    }

    // Validar tamanho do tipo de base
    if (tipo_base.trim().length > 20) {
        throw new Error("O tipo de base deve ter no máximo 20 caracteres!");
    }

    // Validar capacidade
    if (
        !Number.isInteger(capacidadeNumero) ||
        capacidadeNumero <= 0 ||
        capacidadeNumero > 65535
    ) {
        throw new Error("Informe uma capacidade válida!");
    }

    // Validar disponibilidade
    if (typeof ativo !== 'boolean' && ativo !== 0 && ativo !== 1) {
        throw new Error("O campo ativo deve ser verdadeiro ou falso!");
    }

    try {
        const query = `
            INSERT INTO Carrinho (tipo_base, capacidade, ativo)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await pool.query(query, [
            tipo_base.trim(),
            capacidadeNumero,
            ativo
        ]);

        return {
            id_carrinho: resultado.insertId,
            tipo_base: tipo_base.trim(),
            capacidade: capacidadeNumero,
            ativo: Boolean(ativo)
        };

    } catch (erro) {
        console.error("Erro ao cadastrar carrinho:", erro);
        throw erro;
    }
}


// 4. Atualizar carrinho
async function atualizarCarrinho(id, dados) {
    const idCarrinho = Number(id);

    const { tipo_base, capacidade, ativo } = dados;

    const capacidadeNumero = Number(capacidade);

    // Validar ID
    if (!Number.isInteger(idCarrinho) || idCarrinho <= 0) {
        throw new Error("ID do carrinho inválido!");
    }

    // Validar campos obrigatórios
    if (
        !tipo_base ||
        !tipo_base.trim() ||
        capacidade === undefined ||
        capacidade === null ||
        capacidade === '' ||
        ativo === undefined ||
        ativo === null
    ) {
        throw new Error("Preencha todos os campos obrigatórios!");
    }

    if (tipo_base.trim().length > 20) {
        throw new Error("O tipo de base deve ter no máximo 20 caracteres!");
    }

    if (
        !Number.isInteger(capacidadeNumero) ||
        capacidadeNumero <= 0 ||
        capacidadeNumero > 65535
    ) {
        throw new Error("Informe uma capacidade válida!");
    }

    if (typeof ativo !== 'boolean' && ativo !== 0 && ativo !== 1) {
        throw new Error("O campo ativo deve ser verdadeiro ou falso!");
    }

    try {
        // Verificar se o carrinho existe
        const [carrinhos] = await pool.query(
            'SELECT id_carrinho FROM Carrinho WHERE id_carrinho = ?',
            [idCarrinho]
        );

        if (carrinhos.length === 0) {
            throw new Error("Carrinho não encontrado!");
        }

        const query = `
            UPDATE Carrinho
            SET tipo_base = ?, capacidade = ?, ativo = ?
            WHERE id_carrinho = ?
        `;

        await pool.query(query, [
            tipo_base.trim(),
            capacidadeNumero,
            ativo,
            idCarrinho
        ]);

        return {
            id_carrinho: idCarrinho,
            tipo_base: tipo_base.trim(),
            capacidade: capacidadeNumero,
            ativo: Boolean(ativo)
        };

    } catch (erro) {
        console.error("Erro ao atualizar carrinho:", erro);
        throw erro;
    }
}


// 5. Excluir carrinho
async function excluirCarrinho(id) {
    const idCarrinho = Number(id);

    if (!Number.isInteger(idCarrinho) || idCarrinho <= 0) {
        throw new Error("ID do carrinho inválido!");
    }

    try {
        // Verificar se o carrinho está vinculado a algum evento
        const queryEventos = `
            SELECT COUNT(*) AS total
            FROM EVENTO_CARRINHO
            WHERE FK_Carrinho_id_carrinho = ?
        `;

        const [eventos] = await pool.query(queryEventos, [idCarrinho]);

        if (eventos[0].total > 0) {
            throw new Error(
                "Não é possível excluir este carrinho porque ele está vinculado a um evento!"
            );
        }

        // Excluir carrinho
        const [resultado] = await pool.query(
            'DELETE FROM Carrinho WHERE id_carrinho = ?',
            [idCarrinho]
        );

        if (resultado.affectedRows === 0) {
            throw new Error("Carrinho não encontrado!");
        }

        return {
            mensagem: "Carrinho excluído com sucesso!"
        };

    } catch (erro) {
        console.error("Erro ao excluir carrinho:", erro);
        throw erro;
    }
}


module.exports = {
    listarCarrinhos,
    buscarCarrinhos,
    cadastrarCarrinho,
    atualizarCarrinho,
    excluirCarrinho
};