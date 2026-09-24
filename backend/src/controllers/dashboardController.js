const dashboardService = require('../services/dashboardService');

const getDashboard = async (req, res) => {
    try {
        const currentDate = new Date();
        const year = parseInt(req.query.year) || currentDate.getFullYear();
        const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);

        if (month < 1 || month > 12 || year < 2000 || year > 2100) {
            return res.status(400).json({ success: false, message: "Parâmetros 'year' ou 'month' inválidos." });
        }

        const dashboardData = await dashboardService.getDashboardData(year, month);
        return res.status(200).json({ success: true, data: dashboardData });

    } catch (error) {
        console.error("Erro no Dashboard Controller:", error);
        return res.status(500).json({ success: false, message: "Erro interno ao buscar dados do dashboard." });
    }
};

const getHealth = (req, res) => {
    res.status(200).json({ success: true, message: "API Circus Gourmet rodando!" });
};

const criarEvento = async (req, res) => {
    try {
        const { 
            nome_evento, 
            data_evento, 
            horario_inicio, 
            horario_fim, 
            local, 
            n_convidados, 
            fk_Cliente_id_cliente 
        } = req.body;

        // Barreira de segurança para as colunas NOT NULL do banco
        if (!nome_evento || !data_evento || !horario_inicio || !horario_fim || !local || !n_convidados || !fk_Cliente_id_cliente) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltam campos obrigatórios. Preencha: nome_evento, data_evento, horario_inicio, horario_fim, local, n_convidados e fk_Cliente_id_cliente." 
            });
        }

        const resultado = await dashboardService.criarEvento(req.body);

        return res.status(201).json({
            success: true,
            message: "Evento criado com sucesso no banco de dados!",
            insertId: resultado.insertId
        });

    } catch (error) {
        console.error("Erro ao criar evento no Controller:", error);
        return res.status(500).json({ success: false, message: "Erro interno ao salvar o novo evento." });
    }
};

module.exports = {
    getDashboard,
    getHealth,
    criarEvento
};