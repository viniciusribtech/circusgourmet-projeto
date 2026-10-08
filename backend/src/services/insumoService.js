const pool = require('../database/connection')

// Função auxiliar interna para validar se o ID é numérico
function validarId(idDoInsumo) {
    if (!idDoInsumo || isNaN(idDoInsumo)) {
        throw new Error("O identificador do insumo informado é inválido.");
    }
}

// 1. Listar todos
async function listarInsumos() {
    const [listaDeInsumos] = await pool.query('SELECT id_insumo, nome, custo_unitario FROM Insumo');
    return listaDeInsumos;
}

// 2. Buscar por nome
async function buscarInsumos(termoPesquisado) {
    const [resultadosDaBusca] = await pool.query(
        'SELECT id_insumo, nome, custo_unitario FROM Insumo WHERE nome LIKE ?',
        [`%${termoPesquisado}%`]
    );
    return resultadosDaBusca;
}

// 3. Cadastrar Insumo
async function cadastrarInsumo(dadosDoInsumo) {
    const { nome, custo_unitario } = dadosDoInsumo;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    const custoValidado = parseFloat(custo_unitario);
    if (isNaN(custoValidado) || custoValidado < 0) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

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
        idInsumoGerado: resultadoDoBanco.insertId
    };
}

// 4. Atualizar Insumo
async function atualizarInsumo(idDoInsumo, dadosDoInsumo) {
    validarId(idDoInsumo);

    const { nome, custo_unitario } = dadosDoInsumo;

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        throw new Error("O nome do insumo é obrigatório para a atualização!");
    }

    const custoValidado = parseFloat(custo_unitario);
    if (isNaN(custoValidado) || custoValidado < 0) {
        throw new Error("O custo unitário deve ser numérico e positivo!");
    }

    const [resultadoDoBanco] = await pool.query(
        'UPDATE Insumo SET nome = ?, custo_unitario = ? WHERE id_insumo = ?',
        [nome.trim(), custoValidado, idDoInsumo]
    );

    if (resultadoDoBanco.affectedRows === 0) {
        throw new Error("Insumo não encontrado para atualização!");
    }

    return {
        mensagem: "Insumo atualizado com sucesso!"
    };
}

// 5. Excluir Insumo
async function excluirInsumo(idDoInsumo) {
    validarId(idDoInsumo);

    try {
        const [resultadoDoBanco] = await pool.query(
            'DELETE FROM Insumo WHERE id_insumo = ?',
            [idDoInsumo]
        );

        if (resultadoDoBanco.affectedRows === 0) {
            throw new Error("Insumo não encontrado para exclusão!");
        }

        return {
            mensagem: "Insumo excluído com sucesso!"
        };
    } catch (erroDoBanco) {
        // Captura o erro específico de chave estrangeira (nativo do motor MySQL)
        if (erroDoBanco.code === 'ER_ROW_IS_REFERENCED_2' || erroDoBanco.message.includes('foreign key constraint fails')) {
            throw new Error("Não é possível excluir este insumo, pois ele está vinculado a um ou mais serviços!");
        }
        // Repassa qualquer outro erro não previsto
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