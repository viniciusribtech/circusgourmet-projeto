const pool = require('../database/connection');

const getDashboardData = async (year, month) => {
    // 1. Eventos do Calendário
    const [calendarEvents] = await pool.query(`
        SELECT 
            e.id_evento AS id, 
            CONCAT(e.nome_evento, ' - ', c.nome) AS titulo, 
            DATE_FORMAT(e.data_evento, '%Y-%m-%d') AS data, 
            e.status, 
            e.n_convidados AS convidados, 
            e.local AS local,
            'corporativo' AS categoria
        FROM Evento e
        JOIN Cliente c ON e.fk_Cliente_id_cliente = c.id_cliente
        WHERE YEAR(e.data_evento) = ? AND MONTH(e.data_evento) = ?
    `, [year, month]);

    // 2. Próximos Eventos
    const [upcomingEvents] = await pool.query(`
        SELECT 
            e.id_evento AS id, 
            DATE_FORMAT(e.data_evento, '%d/%m/%Y') AS data_evento, 
            TIME_FORMAT(e.horario_inicio, '%H:%i') AS horario_inicio,
            e.nome_evento AS nome_evento, 
            e.status, 
            e.n_convidados AS convidados
        FROM Evento e
        WHERE e.data_evento >= CURDATE()
        ORDER BY e.data_evento ASC
        LIMIT 5
    `);

    // 3. Ocupação de Carrinhos
    const [totalCarts] = await pool.query(`
        SELECT tipo_base AS nome, COUNT(id_carrinho) AS total 
        FROM Carrinho 
        WHERE ativo = TRUE 
        GROUP BY tipo_base
    `);

    const [occupiedCarts] = await pool.query(`
        SELECT c.tipo_base AS nome, COUNT(DISTINCT c.id_carrinho) AS usado
        FROM Carrinho c
        JOIN EVENTO_CARRINHO ec ON c.id_carrinho = ec.FK_Carrinho_id_carrinho
        JOIN Evento e ON ec.FK_Evento_id_evento = e.id_evento
        WHERE YEAR(e.data_evento) = ? AND MONTH(e.data_evento) = ? AND c.ativo = TRUE
        GROUP BY c.tipo_base
    `, [year, month]);

    const cores = ['primaria', 'secundaria', 'terciaria'];

    const cartOccupancy = totalCarts.map((cart, index) => {
        const ocupado = occupiedCarts.find(oc => oc.nome === cart.nome);
        const usadoCount = ocupado ? ocupado.usado : 0;
        return {
            id: index + 1,
            nome: `Carrinho ${cart.nome}`,
            usado: usadoCount,
            total: cart.total,
            cor: cores[index % cores.length]
        };
    });

    // 4. Estatísticas Gerais
    const [[{ budgets }]] = await pool.query(`SELECT COUNT(*) AS budgets FROM Orcamento`);
    const [[{ activeCarts }]] = await pool.query(`SELECT COUNT(*) AS activeCarts FROM Carrinho WHERE ativo = TRUE`);

    return {
        period: { year, month },
        calendarEvents,
        upcomingEvents,
        cartOccupancy,
        statistics: { budgets, activeCarts }
    };
};

const criarEvento = async (dadosEvento) => {
    const { 
        nome_evento, 
        data_evento, 
        horario_inicio, 
        horario_fim, 
        local, 
        status, 
        n_convidados, 
        fk_Cliente_id_cliente 
    } = dadosEvento;
    
    const query = `
        INSERT INTO Evento 
        (nome_evento, data_evento, horario_inicio, horario_fim, local, status, n_convidados, fk_Cliente_id_cliente) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [resultado] = await pool.query(query, [
        nome_evento,
        data_evento, 
        horario_inicio,
        horario_fim,
        local, 
        status || 'Pendente', 
        n_convidados, 
        fk_Cliente_id_cliente
    ]);
    
    return resultado;
};

module.exports = { 
    getDashboardData,
    criarEvento 
};