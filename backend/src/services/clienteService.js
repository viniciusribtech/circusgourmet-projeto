const pool = require('../database/connection')


// 1. Listar todos os clientes
async function listarClientes(){
    try{
        const [rows] = await pool.query(
            'SELECT * FROM Cliente ORDER BY id_cliente DESC'
        );

        return rows;

    }catch(erro){
        console.error("Erro ao listar", erro);
        throw erro;
    }
}


// 2. Buscar cliente por termo de pesquisa
async function buscarClientes(termo) {
    try {
        const query = `
            SELECT * FROM Cliente 
            WHERE nome LIKE ? OR telefone LIKE ?
        `;

        const wildcard = `%${termo}%`;

        const [rows] = await pool.query(
            query,
            [wildcard, wildcard]
        );

        return rows;

    } catch (erro) {
        console.error("Erro ao buscar clientes:", erro);
        throw erro;
    }
}


// 3. Cadastrar Cliente
async function cadastrarCliente(dados) {
    const { nome, telefone } = dados;

    // Validação de campos obrigatórios
    if (!nome || !telefone) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    try {
        const query = `
            INSERT INTO Cliente (nome, telefone) 
            VALUES (?, ?)
        `;

        const [resultado] = await pool.query(
            query,
            [nome, telefone]
        );
        
        return {
            id_cliente: resultado.insertId,
            nome,
            telefone
        };

    } catch (erro) {
        console.error("Erro ao cadastrar cliente:", erro);
        throw erro;
    }
}


// 4. Atualizar Cliente
async function atualizarCliente(id, dados) {
    const { nome, telefone } = dados;

    if (!nome || !telefone) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    try {
        const query = `
            UPDATE Cliente 
            SET nome = ?, telefone = ? 
            WHERE id_cliente = ?
        `;

        const [resultado] = await pool.query(
            query,
            [nome, telefone, id]
        );

        if (resultado.affectedRows === 0) {
            throw new Error("Cliente não encontrado!");
        }

        return {
            id_cliente: id,
            nome,
            telefone
        };

    } catch (erro) {
        console.error("Erro ao atualizar cliente:", erro);
        throw erro;
    }
}


// 5. Excluir Cliente
async function excluirCliente(id) {
    try {

        // Verificar se o cliente possui eventos vinculados
        const queryEventos = `
            SELECT COUNT(*) AS total 
            FROM Evento 
            WHERE fk_Cliente_id_cliente = ?
        `;

        const [eventos] = await pool.query(
            queryEventos,
            [id]
        );

        if (eventos[0].total > 0) {
            throw new Error(
                "Não é possível excluir um cliente com eventos vinculados!"
            );
        }

        // Se não houver eventos vinculados, procede com a exclusão
        const [resultado] = await pool.query(
            'DELETE FROM Cliente WHERE id_cliente = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            throw new Error("Item já excluído ou não encontrado!");
        }

        return {
            mensagem: "Cliente excluído com sucesso!"
        };

    } catch (erro) {
        console.error("Erro ao excluir cliente:", erro);
        throw erro;
    }
}


module.exports = {
    listarClientes,
    buscarClientes,
    cadastrarCliente,
    atualizarCliente,
    excluirCliente
};