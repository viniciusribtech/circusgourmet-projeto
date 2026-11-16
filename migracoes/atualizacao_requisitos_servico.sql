-- Execute UMA vez, no banco existente, após fazer backup.
-- Não apaga dados nem recria tabelas.
USE buffet_eventos;
ALTER TABLE Servico
    ADD COLUMN preco_mao_obra DECIMAL(5,2) UNSIGNED NULL AFTER preco_base,
    ADD COLUMN visivel BOOLEAN NOT NULL DEFAULT TRUE AFTER preco_mao_obra;
-- Campos previstos por RF001/RF002/RF003 que faltavam no esquema original.
-- Para novas instalações, incorporar essas colunas no CREATE TABLE Servico.
    