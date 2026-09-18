// Importe o arquivo de conexão que o seu parceiro criou (ajuste o caminho se necessário)
const pool = require('../database/connection');

const getDashboardData = async (year, month) => {
    // 1. Eventos do Calendário
    const [calendarEvents] = await pool.query(`
        SELECT 
            id_evento AS id, 
            nome AS title, 
            DATE_FORMAT(data_evento, '%Y-%m-%d') AS date, 
            status, 
            n_convidados AS guests, 
            local AS location
        FROM Evento
        WHERE YEAR(data_evento) = ? AND MONTH(data_evento) = ?
    `, [year, month]);

    // 2. Próximos Eventos
    const [upcomingEvents] = await pool.query(`
        SELECT 
            e.id_evento AS id, 
            DATE_FORMAT(e.data_evento, '%Y-%m-%d') AS date, 
            e.nome AS title, 
            e.status, 
            e.n_convidados AS guests,
            (SELECT COUNT(*) FROM EVENTO_CARRINHO ec WHERE ec.id_evento = e.id_evento) AS carts
        FROM Evento e
        WHERE e.data_evento >= CURRENT_DATE
        ORDER BY e.data_evento ASC
        LIMIT 5
    `);

    // 3. Ocupação de Carrinhos
    const [totalCarts] = await pool.query(`
        SELECT tamanho AS type, COUNT(id_carrinho) AS total 
        FROM Carrinho 
        WHERE ativo = TRUE 
        GROUP BY tamanho
    `);

    const [occupiedCarts] = await pool.query(`
        SELECT c.tamanho AS type, COUNT(DISTINCT c.id_carrinho) AS occupied
        FROM Carrinho c
        JOIN EVENTO_CARRINHO ec ON c.id_carrinho = ec.id_carrinho
        JOIN Evento e ON ec.id_evento = e.id_evento
        WHERE YEAR(e.data_evento) = ? AND MONTH(e.data_evento) = ? AND c.ativo = TRUE
        GROUP BY c.tamanho
    `, [year, month]);

    const cartOccupancy = totalCarts.map(cart => {
        const ocupado = occupiedCarts.find(oc => oc.type === cart.type);
        const occupiedCount = ocupado ? ocupado.occupied : 0;
        return {
            type: cart.type,
            total: cart.total,
            occupied: occupiedCount,
            available: cart.total - occupiedCount
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

module.exports = { getDashboardData };
