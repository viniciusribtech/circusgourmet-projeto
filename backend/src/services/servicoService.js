const pool = require('../database/connection');

const CONSULTA_SERVICOS = `
    SELECT Servico.id_servico, Servico.nome, Servico.descricao,
           Servico.preco_base, Servico.fk_Categoria_id_categoria,
           Categoria.nome_categoria
    FROM Servico
    LEFT JOIN Categoria
        ON Categoria.id_categoria = Servico.fk_Categoria_id_categoria
`;

async function listarServicos() {
    const [servicos] = await pool.query(`${CONSULTA_SERVICOS} ORDER BY Servico.nome, Servico.id_servico`);
    return servicos;
}

async function buscarServicos(termoPesquisado) {
    const [servicos] = await pool.query(
        `${CONSULTA_SERVICOS} WHERE Servico.nome LIKE ? ORDER BY Servico.nome, Servico.id_servico`,
        [`%${termoPesquisado}%`]
    );
    return servicos;
}

async function listarCategorias() {
    const [categorias] = await pool.query(
        'SELECT id_categoria, nome_categoria FROM Categoria ORDER BY nome_categoria, id_categoria'
    );
    return categorias;
}

function erroValidacao(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

function normalizarDadosServico(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        throw erroValidacao('Informe os dados do serviço.');
    }
    if (typeof dados.nome !== 'string' || !dados.nome.trim()) {
        throw erroValidacao('O nome do serviço é obrigatório.');
    }
    const nome = dados.nome.trim();
    if (nome.length > 30) {
        throw erroValidacao('O nome do serviço não pode ultrapassar 30 caracteres.');
    }
    if (dados.descricao != null && typeof dados.descricao !== 'string') {
        throw erroValidacao('A descrição do serviço é inválida.');
    }
    const descricao = String(dados.descricao ?? '').trim() || null;
    if (descricao && descricao.length > 300) {
        throw erroValidacao('A descrição não pode ultrapassar 300 caracteres.');
    }
    // O DECIMAL(5,2) UNSIGNED aceita valores entre 0,00 e 999,99.
    // Usar texto decimal evita arredondar valores que não tenham duas casas.
    const precoInformado = dados.preco_base;
    const precoTexto = typeof precoInformado === 'number'
        ? String(precoInformado)
        : typeof precoInformado === 'string' ? precoInformado.trim() : '';
    if (!/^\d{1,3}(?:[.,]\d{1,2})?$/.test(precoTexto)) {
        throw erroValidacao('Informe um preço base válido, entre R$ 0,00 e R$ 999,99, com até duas casas decimais.');
    }
    const precoBase = Number(precoTexto.replace(',', '.'));
    if (!Number.isFinite(precoBase) || precoBase > 999.99) {
        throw erroValidacao('O preço base não pode ultrapassar R$ 999,99.');
    }
    let categoriaId = null;
    if (dados.fk_Categoria_id_categoria !== null && dados.fk_Categoria_id_categoria !== undefined && dados.fk_Categoria_id_categoria !== '') {
        const categoriaInformada = dados.fk_Categoria_id_categoria;
        if (!/^\d+$/.test(String(categoriaInformada))) {
            throw erroValidacao('A categoria selecionada é inválida.');
        }
        categoriaId = Number(categoriaInformada);
        if (!Number.isSafeInteger(categoriaId) || categoriaId <= 0) {
            throw erroValidacao('A categoria selecionada é inválida.');
        }
    }
    return { nome, descricao, precoBase: precoBase.toFixed(2), categoriaId };
}

async function cadastrarServico(dados) {
    const { nome, descricao, precoBase, categoriaId } = normalizarDadosServico(dados);
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        // O create.sql não define UNIQUE para nome. Esta validação corresponde ao RF001,
        // mas concorrência perfeita exigiria adicionar uma restrição UNIQUE ao esquema.
        const [existentes] = await conexao.query(
            'SELECT id_servico FROM Servico WHERE LOWER(nome) = LOWER(?) LIMIT 1', [nome]
        );
        if (existentes.length) throw erroValidacao('Serviço já cadastrado!', 409);
        if (categoriaId !== null) {
            const [categorias] = await conexao.query(
                'SELECT id_categoria FROM Categoria WHERE id_categoria = ? LIMIT 1', [categoriaId]
            );
            if (!categorias.length) throw erroValidacao('A categoria selecionada não existe.');
        }
        const [resultado] = await conexao.query(
            'INSERT INTO Servico (nome, descricao, preco_base, fk_Categoria_id_categoria) VALUES (?, ?, ?, ?)',
            [nome, descricao, precoBase, categoriaId]
        );
        await conexao.commit();
        return { id_servico: resultado.insertId, mensagem: 'Serviço cadastrado com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') throw erroValidacao('A categoria selecionada não existe.');
        throw erro;
    } finally {
        conexao.release();
    }
}

async function obterServicoPorId(idServico) {
    const [servicos] = await pool.query(`${CONSULTA_SERVICOS} WHERE Servico.id_servico = ? LIMIT 1`, [idServico]);
    return servicos[0] || null;
}

async function atualizarServico(idServico, dados) {
    const { nome, descricao, precoBase, categoriaId } = normalizarDadosServico(dados);
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const [existentes] = await conexao.query('SELECT id_servico FROM Servico WHERE id_servico = ? FOR UPDATE', [idServico]);
        if (!existentes.length) throw erroValidacao('Serviço não encontrado!', 404);
        const [duplicados] = await conexao.query(
            'SELECT id_servico FROM Servico WHERE LOWER(nome) = LOWER(?) AND id_servico <> ? LIMIT 1',
            [nome, idServico]
        );
        if (duplicados.length) throw erroValidacao('Serviço já cadastrado!', 409);
        if (categoriaId !== null) {
            const [categorias] = await conexao.query('SELECT id_categoria FROM Categoria WHERE id_categoria = ? LIMIT 1', [categoriaId]);
            if (!categorias.length) throw erroValidacao('A categoria selecionada não existe.');
        }
        await conexao.query(
            'UPDATE Servico SET nome = ?, descricao = ?, preco_base = ?, fk_Categoria_id_categoria = ? WHERE id_servico = ?',
            [nome, descricao, precoBase, categoriaId, idServico]
        );
        await conexao.commit();
        return { mensagem: 'Serviço atualizado com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') throw erroValidacao('A categoria selecionada não existe.');
        throw erro;
    } finally { conexao.release(); }
}

async function excluirServico(idServico) {
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const [existentes] = await conexao.query('SELECT id_servico FROM Servico WHERE id_servico = ? FOR UPDATE', [idServico]);
        if (!existentes.length) throw erroValidacao('Item já excluído ou não encontrado!', 404);
        // Respeita integralmente as referências existentes no create.sql.
        const verificacoes = [
            ['EVENTO_SERVICO', 'FK_Servico_id_servico'],
            ['SERVICO_INSUMO', 'FK_Servico_id_servico'],
            ['Preco_convidado', 'fk_Servico_id_servico']
        ];
        for (const [tabela, coluna] of verificacoes) {
            const [referencias] = await conexao.query(`SELECT 1 FROM ${tabela} WHERE ${coluna} = ? LIMIT 1`, [idServico]);
            if (referencias.length) {
                throw erroValidacao('Não é possível excluir um serviço com registros vinculados!', 409);
            }
        }
        await conexao.query('DELETE FROM Servico WHERE id_servico = ?', [idServico]);
        await conexao.commit();
        return { mensagem: 'Serviço excluído com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_ROW_IS_REFERENCED_2' || erro.code === 'ER_ROW_IS_REFERENCED') {
            throw erroValidacao('Não é possível excluir um serviço com registros vinculados!', 409);
        }
        throw erro;
    } finally { conexao.release(); }
}

module.exports = { listarServicos, buscarServicos, listarCategorias, cadastrarServico, obterServicoPorId, atualizarServico, excluirServico };
