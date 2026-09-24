// Importe o arquivo de conexão que o seu parceiro criou (ajuste o caminho se necessário)
const pool = require('../database/connection');

const getDashboardData = async (year, month) => {
    // 1. Eventos do Calendário
    const [calendarEvents] = await pool.query(`
        SELECT 
            e.id_evento AS id, 
            c.nome AS title, 
            DATE_FORMAT(e.data_evento, '%Y-%m-%d') AS date, 
            e.status, 
            e.n_convidados AS guests, 
            e.local AS location
        FROM Evento e
        JOIN Cliente c ON e.fk_Cliente_id_cliente = c.id_cliente
        WHERE YEAR(e.data_evento) = ? AND MONTH(e.data_evento) = ?
    `, [year, month]);

    // 2. Próximos Eventos
    const [upcomingEvents] = await pool.query(`
        SELECT 
            e.id_evento AS id, 
            DATE_FORMAT(e.data_evento, '%Y-%m-%d') AS date, 
            c.nome AS title, 
            e.status, 
            e.n_convidados AS guests,
            (SELECT COUNT(*) FROM EVENTO_CARRINHO ec WHERE ec.FK_Evento_id_evento = e.id_evento) AS carts
        FROM Evento e
        JOIN Cliente c ON e.fk_Cliente_id_cliente = c.id_cliente
        WHERE e.data_evento >= CURRENT_DATE
        ORDER BY e.data_evento ASC
        LIMIT 5
    `);

    // 3. Ocupação de Carrinhos
    const [totalCarts] = await pool.query(`
        SELECT tipo_base AS type, COUNT(id_carrinho) AS total 
        FROM Carrinho 
        WHERE ativo = TRUE 
        GROUP BY tipo_base
    `);

    const [occupiedCarts] = await pool.query(`
        SELECT c.tipo_base AS type, COUNT(DISTINCT c.id_carrinho) AS occupied
        FROM Carrinho c
        JOIN EVENTO_CARRINHO ec ON c.id_carrinho = ec.FK_Carrinho_id_carrinho
        JOIN Evento e ON ec.FK_Evento_id_evento = e.id_evento
        WHERE YEAR(e.data_evento) = ? AND MONTH(e.data_evento) = ? AND c.ativo = TRUE
        GROUP BY c.tipo_base
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