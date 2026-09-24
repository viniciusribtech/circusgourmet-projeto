const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Pega o ano e mês da URL ou usa a data atual como padrão
        const year = parseInt(req.query.year) || currentDate.getFullYear();
        const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);

        if (month < 1 || month > 12 || year < 2000 || year > 2100) {
            return res.status(400).json({
                success: false,
                message: "Parâmetros 'year' ou 'month' inválidos."
            });
        }

        // Chama o service para buscar os dados no banco
        const dashboardData = await dashboardService.getDashboardData(year, month);

        return res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Erro no Dashboard Controller:", error);
        return res.status(500).json({
            success: false,
            message: "Erro interno ao buscar dados do dashboard."
        });
    }
};

const getHealth = (req, res) => {
    res.status(200).json({ success: true, message: "API Circus Gourmet rodando!" });
};

module.exports = {
    getDashboard,
    getHealth
};
