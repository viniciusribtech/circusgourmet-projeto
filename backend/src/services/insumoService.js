const pool = require('../database/connection');

// Função auxiliar interna para validar se o ID é numérico
function validarId(idDoInsumo) {
    const identificadorNumerico = Number(idDoInsumo);

    if (!Number.isInteger(identificadorNumerico) || identificadorNumerico <= 0) {
        throw new Error("O identificador do insumo informado é inválido.");
    }
}

// 1. Listar todos os insumos
async function listarInsumos() {
    const [listaDeInsumos] = await pool.query(
        'SELECT id_insumo, nome, custo_unitario FROM Insumo'
    );

    return listaDeInsumos;
}

// 2. Buscar insumos por nome
async function buscarInsumos(termoPesquisado) {
    const [resultadosDaBusca] = await pool.query(
        'SELECT id_insumo, nome, custo_unitario FROM Insumo WHERE nome LIKE ?',
        [`%${termoPesquisado}%`]
    );

    return resultadosDaBusca;
}

// 3. Cadastrar um novo insumo
async function cadastrarInsumo(dadosDoInsumo) {
    const { nome, custo_unitario } = dadosDoInsumo;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error("O nome do insumo é obrigatório!");
    }

    const custoValidado = Number(custo_unitario);

    if (!Number.isFinite(custoValidado) || custoValidado < 0) {
        throw new Error("O custo unitário deve ser um número e não pode ser negativo!");
    }

    // Verifica se já existe um insumo com o mesmo nome
    const [insumoExistente] = await pool.query(
        'SELECT id_insumo FROM Insumo WHERE nome = ?',
        [nome.trim()]
    );

    if (insumoExistente.length > 0) {
        throw new Error("Já existe um insumo cadastrado com este nome!");
    }

    const [resultadoDoBanco] = await pool.query(
        'INSERT INTO Insumo (nome, custo_unitario) VALUES (?, ?)',
        [nome.trim(), custoValidado]
    );

    return {
        mensagem: "Insumo cadastrado com sucesso!",
        id_insumo: resultadoDoBanco.insertId
    };
}

// 4. Atualizar um insumo
async function atualizarInsumo(idDoInsumo, dadosDoInsumo) {
    validarId(idDoInsumo);

    const { nome, custo_unitario } = dadosDoInsumo;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error("O nome do insumo é obrigatório para a atualização!");
    }

    const custoValidado = Number(custo_unitario);

    if (!Number.isFinite(custoValidado) || custoValidado < 0) {
        throw new Error("O custo unitário deve ser um número e não pode ser negativo!");
    }

    // Verifica se outro insumo já possui esse nome
    const [insumoExistente] = await pool.query(
        'SELECT id_insumo FROM Insumo WHERE nome = ? AND id_insumo <> ?',
        [nome.trim(), idDoInsumo]
    );

    if (insumoExistente.length > 0) {
        throw new Error("Já existe outro insumo cadastrado com este nome!");
    }

    const [resultadoDoBanco] = await pool.query(
        'UPDATE Insumo SET nome = ?, custo_unitario = ? WHERE id_insumo = ?',
        [nome.trim(), custoValidado, idDoInsumo]
    );

    if (resultadoDoBanco.affectedRows === 0) {
        const erro = new Error("Insumo não encontrado para atualização!");
        erro.status = 404;
        throw erro;
    }

    return {
        mensagem: "Insumo atualizado com sucesso!"
    };
}

// 5. Excluir um insumo
async function excluirInsumo(idDoInsumo) {
    validarId(idDoInsumo);

    try {
        const [resultadoDoBanco] = await pool.query(
            'DELETE FROM Insumo WHERE id_insumo = ?',
            [idDoInsumo]
        );

        if (resultadoDoBanco.affectedRows === 0) {
            const erro = new Error("Insumo não encontrado para exclusão!");
            erro.status = 404;
            throw erro;
        }

        return {
            mensagem: "Insumo excluído com sucesso!"
        };

    } catch (erroDoBanco) {
        if (erroDoBanco.code === 'ER_ROW_IS_REFERENCED_2') {
            throw new Error(
                "Não é possível excluir este insumo, pois ele está vinculado a um ou mais serviços!"
            );
        }

        throw erroDoBanco;
    }
}

module.exports = {
    listarInsumos,
    buscarInsumos,
    cadastrarInsumo,
    atualizarInsumo,
    excluirInsumo
};