const pool = require('../database/connection')


// 1. Listar todos os clientes (com paginação opcional ou geral)
async function listarClientes(){
    try{
        const [rows] = await pool.query('SELECT * FROM cliente ORDER BY id_cliente DESC')
        return rows;
    }catch(erro){
        console.error("Erro ao listar", erro);
        throw erro;
    }
}

// 2. Buscar cliente por ID ou termo de pesquisa
async function buscarClientes(termo) {
    try {
        const query = `
            SELECT * FROM Cliente 
            WHERE nome LIKE ? OR telefone LIKE ?
        `;
        const wildcard = `%${termo}%`;
        const [rows] = await pool.query(query, [wildcard, wildcard, wildcard]);
        return rows;
    } catch (erro) {
        console.error("Erro ao buscar clientes:", erro);
        throw erro;
    }
}

// 3. Cadastrar Cliente
async function cadastrarCliente(dados) {
    const { nome, telefone } = dados;

    // Validação de campos obrigatórios conforme
    if (!nome || !telefone) {
        throw new Error("Campos obrigatórios não preenchidos!");
    }

    try {
        const query = 'INSERT INTO Cliente (nome, telefone) VALUES (?, ?)';
        const [resultado] = await pool.query(query, [nome || '', telefone]);
        
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
        const query = 'UPDATE Cliente SET nome = ?, telefone = ? WHERE id_cliente = ?';
        const [resultado] = await pool.query(query, [nome || '', telefone, id]);

        if (resultado.affectedRows === 0) {
            throw new Error("Cliente não encontrado!");
        }

        return { id_cliente: id, nome, telefone };
    } catch (erro) {
        console.error("Erro ao atualizar cliente:", erro);
        throw erro;
    }
}

// 5. Excluir Cliente com verificação de eventos futuros 
async function excluirCliente(id) {
    try {
    //    Verificar se o cliente possui eventos futuros vinculados
        const queryEventosFuturos = `
            SELECT COUNT(*) AS total 
            FROM Evento 
            WHERE fk_Cliente_id_cliente = ? AND data_evento >= CURDATE() 
        `; // o data_evento >= CURDATE(), vai de encontro ao ON DELETE RESTRICT do nosso create.sql,
           // pois ele impede que QUALQUER cliente com evento vinculado seja excluído, independentemente
           // se está no passado ou no futuro. Pensar melhor sobre isso, pra saber o que a gente vai alterar. 
        const [eventos] = await pool.query(queryEventosFuturos, [id]);

        if (eventos[0].total > 0) {
            throw new Error("Não é possível excluir um cliente com eventos vinculados!");
        }

        // Se não houver eventos futuros, procede com a exclusão
        const [resultado] = await pool.query('DELETE FROM Cliente WHERE id_cliente = ?', [id]);

        if (resultado.affectedRows === 0) {
            throw new Error("Item já excluído ou não encontrado!");
        }

        return { mensagem: "Cliente excluído com sucesso!" };
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