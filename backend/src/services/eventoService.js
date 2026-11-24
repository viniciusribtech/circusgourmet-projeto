const pool = require('../database/connection');

const CAMPOS_EVENTO = `
    SELECT Evento.id_evento, Evento.nome_evento,
           DATE_FORMAT(Evento.data_evento, '%Y-%m-%d') AS data_evento,
           TIME_FORMAT(Evento.horario_inicio, '%H:%i') AS horario_inicio,
           TIME_FORMAT(Evento.horario_fim, '%H:%i') AS horario_fim,
           Evento.local, Evento.status, Evento.n_convidados,
           Evento.fk_Cliente_id_cliente, Evento.fk_Cidade_id_cidade,
           Cliente.nome AS nome_cliente, Cidade.nome AS nome_cidade,
           Cidade.taxa_deslocamento
    FROM Evento
    LEFT JOIN Cliente ON Cliente.id_cliente = Evento.fk_Cliente_id_cliente
    LEFT JOIN Cidade ON Cidade.id_cidade = Evento.fk_Cidade_id_cidade
`;

function falha(mensagem, status = 400) {
    const erro = new Error(mensagem);
    erro.status = status;
    return erro;
}

async function listarEventos(pesquisa = '') {
    const termo = pesquisa.trim();
    if (!termo) {
        const [linhas] = await pool.query(`${CAMPOS_EVENTO} ORDER BY Evento.data_evento DESC, Evento.horario_inicio, Evento.id_evento`);
        return linhas;
    }
    const [linhas] = await pool.query(`${CAMPOS_EVENTO}
        WHERE Evento.nome_evento LIKE ? OR Evento.local LIKE ? OR Cliente.nome LIKE ?
           OR Cidade.nome LIKE ? OR DATE_FORMAT(Evento.data_evento, '%d/%m/%Y') LIKE ?
           OR CAST(Evento.id_evento AS CHAR) = ?
        ORDER BY Evento.data_evento DESC, Evento.horario_inicio, Evento.id_evento`,
        [`%${termo}%`, `%${termo}%`, `%${termo}%`, `%${termo}%`, `%${termo}%`, termo]);
    return linhas;
}

async function obterEvento(id) {
    const [linhas] = await pool.query(`${CAMPOS_EVENTO} WHERE Evento.id_evento = ?`, [id]);
    if (!linhas[0]) return null;

    const [servicos] = await pool.query(`
        SELECT ES.FK_Servico_id_servico AS id_servico,
               ES.quantidade,
               ES.preco_praticado,
               Servico.nome,
               Servico.preco_base
        FROM EVENTO_SERVICO ES
        INNER JOIN Servico ON Servico.id_servico = ES.FK_Servico_id_servico
        WHERE ES.FK_Evento_id_evento = ?
        ORDER BY Servico.nome, Servico.id_servico
    `, [id]);

    return { ...linhas[0], servicos };
}

async function listarClientes() {
    const [linhas] = await pool.query('SELECT id_cliente, nome FROM Cliente ORDER BY nome, id_cliente');
    return linhas;
}

async function listarCidades() {
    const [linhas] = await pool.query('SELECT id_cidade, nome, taxa_deslocamento FROM Cidade ORDER BY nome, id_cidade');
    return linhas;
}

function idOpcional(valor, campo) {
    if (valor === '' || valor == null) return null;
    if (!/^\d+$/.test(String(valor)) || !Number.isSafeInteger(Number(valor)) || Number(valor) <= 0) {
        throw falha(`${campo} inválido(a).`);
    }
    return Number(valor);
}

function normalizarServicos(entradaServicos) {
    if (entradaServicos === undefined || entradaServicos === null || entradaServicos === '') {
        return [];
    }
    if (!Array.isArray(entradaServicos)) {
        throw falha('A lista de serviços do evento é inválida.');
    }

    const consolidados = new Map();

    for (const item of entradaServicos) {
        if (!item || typeof item !== 'object') {
            throw falha('Item de serviço inválido.');
        }

        const idRaw = String(item.id_servico ?? item.FK_Servico_id_servico ?? '').trim();
        const qtdRaw = String(item.quantidade ?? 1).trim();

        if (!/^\d+$/.test(idRaw) || !Number.isSafeInteger(Number(idRaw)) || Number(idRaw) <= 0) {
            throw falha('Serviço selecionado inválido.');
        }
        if (!/^\d+$/.test(qtdRaw) || Number(qtdRaw) < 1 || Number(qtdRaw) > 65535) {
            throw falha('Informe uma quantidade de serviço entre 1 e 65535.');
        }

        const idServico = Number(idRaw);
        const quantidade = Number(qtdRaw);

        const precoRaw = item.preco_praticado;
        let precoPraticado = null;
        if (precoRaw !== undefined && precoRaw !== null && String(precoRaw).trim() !== '') {
            const normalizado = Number(String(precoRaw).trim().replace(',', '.'));
            if (!Number.isFinite(normalizado) || normalizado < 0) {
                throw falha('Preço praticado do serviço inválido.');
            }
            precoPraticado = normalizado;
        }

        if (consolidados.has(idServico)) {
            const atual = consolidados.get(idServico);
            const somaQtd = atual.quantidade + quantidade;
            if (somaQtd > 65535) {
                throw falha('Quantidade total do serviço excede o limite permitido.');
            }
            consolidados.set(idServico, {
                id_servico: idServico,
                quantidade: somaQtd,
                preco_praticado: precoPraticado !== null ? precoPraticado : atual.preco_praticado
            });
        } else {
            consolidados.set(idServico, {
                id_servico: idServico,
                quantidade,
                preco_praticado: precoPraticado
            });
        }
    }

    return Array.from(consolidados.values());
}

function validarDados(dados) {
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) throw falha('Informe os dados do evento.');
    const nome = typeof dados.nome_evento === 'string' ? dados.nome_evento.trim() : '';
    const local = typeof dados.local === 'string' ? dados.local.trim() : '';
    const data = String(dados.data_evento ?? '').trim();
    const inicio = String(dados.horario_inicio ?? '').trim();
    const fim = String(dados.horario_fim ?? '').trim();
    const status = dados.status;
    const convidados = String(dados.n_convidados ?? '').trim();
    if (!nome || !local || !data || !inicio || !fim || !status || !convidados) throw falha('Campos obrigatórios não preenchidos!');
    if (nome.length > 50 || local.length > 50) throw falha('Nome e local devem ter até 50 caracteres.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !Number.isFinite(Date.parse(`${data}T12:00:00Z`)) ||
        new Date(`${data}T12:00:00Z`).toISOString().slice(0, 10) !== data) throw falha('Insira uma data válida!');
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(inicio) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(fim)) throw falha('Horário em formato inválido!');
    if (fim === inicio) throw falha('O horário de início e encerramento não podem ser iguais.');
    if (!['Confirmado', 'Pendente', 'Cancelado'].includes(status)) throw falha('Status inválido.');
    if (!/^\d+$/.test(convidados) || Number(convidados) > 65535 || Number(convidados) < 1) {
        throw falha('Informe um número de convidados entre 1 e 65535.');
    }
    if (!dados.fk_Cidade_id_cidade) throw falha('Selecione a cidade do evento (taxa de deslocamento obrigatória).');

    const servicos = normalizarServicos(dados.servicos);

    return {
        nome, local, data, inicio, fim, status, convidados: Number(convidados),
        cliente: idOpcional(dados.fk_Cliente_id_cliente, 'Cliente'),
        cidade: idOpcional(dados.fk_Cidade_id_cidade, 'Cidade'),
        servicos
    };
}

async function conferirRelacionamentos(conexao, dados) {
    if (dados.cliente !== null) {
        const [[cliente]] = await conexao.query('SELECT id_cliente FROM Cliente WHERE id_cliente = ?', [dados.cliente]);
        if (!cliente) throw falha('Cliente selecionado não encontrado.');
    }
    if (dados.cidade !== null) {
        const [[cidade]] = await conexao.query('SELECT id_cidade FROM Cidade WHERE id_cidade = ?', [dados.cidade]);
        if (!cidade) throw falha('Cidade selecionada não encontrada.');
    }

    const servicosValidados = [];
    for (const item of dados.servicos || []) {
        const [[servico]] = await conexao.query(
            'SELECT id_servico, nome, preco_base, visivel FROM Servico WHERE id_servico = ?',
            [item.id_servico]
        );
        if (!servico) {
            throw falha(`Serviço selecionado (ID ${item.id_servico}) não encontrado.`);
        }
        if (servico.visivel !== undefined && !Boolean(Number(servico.visivel))) {
            throw falha(`O serviço "${servico.nome}" está indisponível no momento.`);
        }
        servicosValidados.push({
            id_servico: servico.id_servico,
            quantidade: item.quantidade,
            preco_praticado: item.preco_praticado !== null ? item.preco_praticado : Number(servico.preco_base || 0)
        });
    }

    return servicosValidados;
}

async function salvarServicosEvento(conexao, idEvento, servicosValidados) {
    for (const item of servicosValidados) {
        await conexao.query(
            `INSERT INTO EVENTO_SERVICO
                (FK_Servico_id_servico, FK_Evento_id_evento, quantidade, preco_praticado)
             VALUES (?, ?, ?, ?)`,
            [item.id_servico, idEvento, item.quantidade, item.preco_praticado]
        );
    }
}

// Intervalos são calculados com data e hora completas, permitindo eventos que
// começam num dia e terminam na madrugada do seguinte.
function periodoEvento(data, inicio, fim) {
    const comeco = new Date(`${data}T${inicio}:00`);
    const termino = new Date(`${data}T${fim}:00`);
    if (fim < inicio) termino.setDate(termino.getDate() + 1);
    return { comeco: comeco.getTime(), termino: termino.getTime() };
}

async function conferirConflito(conexao, dados, ignorarId = 0) {
    const periodoAtual = periodoEvento(dados.data, dados.inicio, dados.fim);
    // Eventos até um dia antes podem atravessar a meia-noite.
    const [eventos] = await conexao.query(`SELECT id_evento,
        DATE_FORMAT(data_evento, '%Y-%m-%d') AS data_evento,
        TIME_FORMAT(horario_inicio, '%H:%i') AS horario_inicio,
        TIME_FORMAT(horario_fim, '%H:%i') AS horario_fim
        FROM Evento WHERE data_evento BETWEEN DATE_SUB(?, INTERVAL 1 DAY)
        AND DATE_ADD(?, INTERVAL 1 DAY) AND id_evento <> ?
        AND status <> 'Cancelado' FOR UPDATE`, [dados.data, dados.data, ignorarId]);
    if (dados.status === 'Cancelado') return;
    for (const evento of eventos) {
        const periodoExistente = periodoEvento(evento.data_evento, evento.horario_inicio, evento.horario_fim);
        if (periodoAtual.comeco < periodoExistente.termino && periodoAtual.termino > periodoExistente.comeco) {
            throw falha('Já existe um evento cadastrado nesse dia e horário!', 409);
        }
    }
}

async function cadastrarEvento(entrada) {
    const dados = validarDados(entrada);
    const hoje = new Date();
    const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    if (dados.data < dataHoje) throw falha('Insira uma data válida! Não é permitido cadastrar eventos no passado.');
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const servicosValidados = await conferirRelacionamentos(conexao, dados);
        await conferirConflito(conexao, dados);
        const [resultado] = await conexao.query(`INSERT INTO Evento
            (nome_evento, data_evento, horario_inicio, horario_fim, local, status, n_convidados, fk_Cliente_id_cliente, fk_Cidade_id_cidade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [dados.nome, dados.data, dados.inicio, dados.fim, dados.local, dados.status, dados.convidados, dados.cliente, dados.cidade]);
        const idEvento = resultado.insertId;
        await salvarServicosEvento(conexao, idEvento, servicosValidados);
        await conexao.commit();
        return { id_evento: idEvento, mensagem: 'Evento cadastrado com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') throw falha('Cliente, cidade ou serviço não encontrado(a).');
        throw erro;
    } finally { conexao.release(); }
}

async function atualizarEvento(id, entrada) {
    const dados = validarDados(entrada);
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const [anteriores] = await conexao.query('SELECT id_evento FROM Evento WHERE id_evento = ? FOR UPDATE', [id]);
        if (!anteriores.length) throw falha('Evento não encontrado!', 404);
        const servicosValidados = await conferirRelacionamentos(conexao, dados);
        await conferirConflito(conexao, dados, id);
        await conexao.query(`UPDATE Evento SET nome_evento = ?, data_evento = ?, horario_inicio = ?,
            horario_fim = ?, local = ?, status = ?, n_convidados = ?, fk_Cliente_id_cliente = ?,
            fk_Cidade_id_cidade = ? WHERE id_evento = ?`,
            [dados.nome, dados.data, dados.inicio, dados.fim, dados.local, dados.status, dados.convidados, dados.cliente, dados.cidade, id]);
        await conexao.query('DELETE FROM EVENTO_SERVICO WHERE FK_Evento_id_evento = ?', [id]);
        await salvarServicosEvento(conexao, id, servicosValidados);
        await conexao.commit();
        return { mensagem: 'Evento atualizado com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') throw falha('Cliente, cidade ou serviço não encontrado(a).');
        throw erro;
    } finally { conexao.release(); }
}

async function excluirEvento(id) {
    const conexao = await pool.getConnection();
    try {
        await conexao.beginTransaction();
        const [eventos] = await conexao.query(`SELECT id_evento, DATE_FORMAT(data_evento, '%Y-%m-%d') AS data_evento,
            TIME_FORMAT(horario_inicio, '%H:%i') AS horario_inicio,
            TIME_FORMAT(horario_fim, '%H:%i') AS horario_fim FROM Evento WHERE id_evento = ? FOR UPDATE`, [id]);
        if (!eventos.length) throw falha('Evento já excluído ou não encontrado!', 404);
        const evento = eventos[0];
        const agora = new Date();
        if (periodoEvento(evento.data_evento, evento.horario_inicio, evento.horario_fim).termino <= agora.getTime()) {
            throw falha('Impossível excluir um evento já concluído!', 409);
        }
        const [vinculos] = await conexao.query(`SELECT
            (SELECT COUNT(*) FROM EVENTO_CARRINHO WHERE FK_Evento_id_evento = ?) +
            (SELECT COUNT(*) FROM EVENTO_SERVICO WHERE FK_Evento_id_evento = ?) +
            (SELECT COUNT(*) FROM EVENTO_TERCEIRIZADO WHERE FK_Evento_id_evento = ?) AS total`, [id, id, id]);
        if (Number(vinculos[0].total) > 0) throw falha('Não é possível excluir um evento com serviços, carrinhos ou terceirizados vinculados.', 409);
        // Orcamento tem ON DELETE CASCADE no SQL: não removemos orçamentos indiretamente sem aviso.
        const [[orcamento]] = await conexao.query('SELECT id_orcamento FROM Orcamento WHERE fk_Evento_id_evento = ? LIMIT 1', [id]);
        if (orcamento) throw falha('O evento possui um orçamento. Exclua o orçamento primeiro para evitar perda de dados.', 409);
        await conexao.query('DELETE FROM Evento WHERE id_evento = ?', [id]);
        await conexao.commit();
        return { mensagem: 'Evento excluído com sucesso!' };
    } catch (erro) {
        await conexao.rollback();
        if (erro.code === 'ER_ROW_IS_REFERENCED_2') throw falha('O evento possui registros vinculados e não pode ser excluído.', 409);
        throw erro;
    } finally { conexao.release(); }
}

module.exports = { listarEventos, obterEvento, listarClientes, listarCidades, cadastrarEvento, atualizarEvento, excluirEvento };