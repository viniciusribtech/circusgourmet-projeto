USE buffet_eventos;

/* =========================================================
   POVOAMENTO DO BANCO - 10 REGISTROS
========================================================= */

/* =========================
   CLIENTE
========================= */
INSERT INTO Cliente (nome, telefone)
VALUES
('Maria Silva', '77999990001'),
('João Souza', '77999990002'),
('Ana Oliveira', '77999990003'),
('Carlos Pereira', '77999990004'),
('Fernanda Lima', '77999990005'),
('Lucas Santos', '77999990006'),
('Patricia Alves', '77999990007'),
('Ricardo Gomes', '77999990008'),
('Juliana Costa', '77999990009'),
('Bruno Rocha', '77999990010');

/* =========================
   CIDADE
========================= */
INSERT INTO Cidade (nome, taxa_deslocamento)
VALUES
('Vitória da Conquista', 50.00),
('Barra do Choça', 30.00),
('Itapetinga', 80.00),
('Poções', 60.00),
('Planalto', 40.00),
('Jequié', 90.00),
('Itambé', 70.00),
('Brumado', 120.00),
('Guanambi', 150.00),
('Ilhéus', 200.00);

/* =========================
   CATEGORIA
========================= */
INSERT INTO Categoria (nome_categoria, descricao)
VALUES
('Bebidas', 'Serviços de bebidas e drinks'),
('Sobremesas', 'Serviços doces e sobremesas'),
('Salgados', 'Lanches e refeições'),
('Infantil', 'Serviços voltados para crianças'),
('Corporativo', 'Serviços para empresas');

/* =========================
   SERVICO
========================= */
INSERT INTO Servico (
nome,
descricao,
preco_base,
fk_Categoria_id_categoria
)
VALUES
('Bar de Drinks', 'Drinks alcoólicos e não alcoólicos', 15.00, 1),
('Coffee Break Executivo', 'Coffee break para empresas', 18.00, 5),
('Açaí Premium', 'Estação completa de açaí', 20.00, 2),
('Sorvete Tropical', 'Ilha de sorvetes', 25.00, 2),
('Churros Fest', 'Churros recheados', 30.00, 2),
('Hambúrguer Artesanal', 'Mini hambúrguer gourmet', 22.00, 3),
('Pizza Express', 'Rodízio de pizza', 28.00, 3),
('Crepe Gourmet', 'Crepes doces e salgados', 18.00, 3),
('Algodão Doce Kids', 'Algodão doce colorido', 10.00, 4),
('Pipoca Gourmet', 'Pipocas especiais', 12.00, 4);

/* =========================
   PRECO_CONVIDADO
========================= */
INSERT INTO Preco_convidado (
preco_por_pessoa,
qtd_max_convidados,
qtd_min_Convidados,
fk_Servico_id_servico
)
VALUES
(15.00, 50, 1, 1),
(12.00, 100, 51, 1),
(18.00, 50, 1, 2),
(15.00, 100, 51, 2),
(20.00, 50, 1, 3),
(17.00, 100, 51, 3),
(25.00, 50, 1, 4),
(22.00, 100, 51, 4),
(30.00, 50, 1, 5),
(28.00, 100, 51, 5);

/* =========================
   PRODUTO
========================= */
INSERT INTO Produto (nome)
VALUES
('Leite Condensado'),
('Granola'),
('Morango'),
('Vodka'),
('Leite'),
('Chocolate'),
('Refrigerante'),
('Queijo'),
('Presunto'),
('Café'),
('Acucar');

/* =========================
   CARRINHO
========================= */
INSERT INTO Carrinho (
tipo_base,
capacidade,
ativo
)
VALUES
('Pequeno', 50, TRUE),
('Pequeno', 50, TRUE),
('Pequeno', 50, FALSE),
('Medio', 100, TRUE),
('Medio', 100, TRUE),
('Medio', 100, TRUE),
('Grande', 200, TRUE),
('Grande', 200, TRUE),
('Grande', 250, FALSE),
('Grande', 300, TRUE);

/* =========================
   TERCEIRIZADO
========================= */
INSERT INTO Terceirizado (nome, telefone, trabalho_hora)
VALUES
('Carlos Drinks', '77999991111', 50.00),
('Pedro Garçom', '77999992222', 40.00),
('Lucas Bartender', '77999993333', 60.00),
('Rafael Cozinheiro', '77999994444', 55.00),
('Thiago Eventos', '77999995555', 45.00),
('Marcos Buffet', '77999996666', 70.00),
('Felipe Chef', '77999997777', 65.00),
('André Garçom', '77999998888', 50.00),
('Diego Drinks', '77999999999', 75.00),
('Paulo Churrasqueiro', '77999990000', 80.00);

/* =========================
   EVENTO
========================= */
INSERT INTO Evento (
data_evento,
horario_inicio,
local,
status,
n_convidados,
horario_fim,
fk_Cliente_id_cliente,
fk_Cidade_id_cidade
)
VALUES
('2026-05-17', '18:00:00', 'Salão Imperial', 'Confirmado', 120, '23:00:00', 1, 1),
('2026-06-29', '19:00:00', 'Espaço Fest', 'Confirmado', 80, '00:00:00', 2, 1),
('2026-06-21', '17:00:00', 'Chácara Verde', 'Pendente', 150, '22:00:00', 3, 3),
('2026-07-07', '18:30:00', 'Buffet Real', 'Confirmado', 90, '23:30:00', 4, 1),
('2026-04-11', '16:00:00', 'Área Vip', 'Cancelado', 60, '21:00:00', 5, 5),
('2026-05-01', '20:00:00', 'Casa de Eventos', 'Confirmado', 200, '02:00:00', 6, 6),
('2026-05-15', '15:00:00', 'Espaço Kids', 'Pendente', 70, '20:00:00', 7, 7),
('2026-04-17', '19:30:00', 'Salão Ouro', 'Cancelado', 110, '00:30:00', 8, 8),
('2026-03-20', '18:00:00', 'Fazenda Bela Vista', 'Cancelado', 180, '01:00:00', 9, 9),
('2026-06-15', '21:00:00', 'Clube Central', 'Confirmado', 250, '05:00:00', 10, 10);

/* =========================
   ORCAMENTO
========================= */
INSERT INTO Orcamento (
valor_total,
desconto,
valor_final,
sinal_pagamento,
fk_Evento_id_evento
)
VALUES
(3000.00, 200.00, 2800.00, 1000.00, 1),
(2500.00, 100.00, 2400.00, 800.00, 2),
(5000.00, 500.00, 4500.00, 0, 3),
(3500.00, 0, 3500.00, 1000.00, 4),
(2000.00, 150.00, 1850.00, 700.00, 5),
(7000.00, 700.00, 6300.00, 2500.00, 6),
(2800.00, 200.00, 2600.00, 900.00, 7),
(4200.00, 350.00, 3850.00, 1200.00, 8),
(6500.00, 500.00, 6000.00, 2000.00, 9),
(9000.00, 100.00, 8000.00, 3000.00, 10);

/* =========================
   EVENTO_CARRINHO
========================= */
INSERT INTO EVENTO_CARRINHO
VALUES

(1,1),
(2,4),
(2,5),
(3,2),
(4,7),
(4,8),
(5,4),
(6,7),
(6,10),
(7,2),
(8,8),
(8,10),
(9,5),
(10,7),
(10,8),
(10,10);

/* =========================
   EVENTO_SERVICO
========================= */
INSERT INTO EVENTO_SERVICO
(FK_Servico_id_servico, FK_Evento_id_evento,
quantidade, preco_praticado)
VALUES

(1, 1, 1, 15.00),
(1, 2, 1, 12.00),
(1, 3, 1, 15.00),
(1, 4, 1, 12.00),
(1, 6, 1, 12.00),
(1, 7, 1, 15.00),
(1, 8, 1, 12.00),
(1, 10, 1, 12.00),
(3, 1, 1, 20.00),
(10, 8, 1, 10.00);

/* =========================
   SERVICO_PRODUTO
========================= */
INSERT INTO SERVICO_PRODUTO (
FK_Produto_id_produto,
FK_Servico_id_servico,
quantidade_produto,
custo_unitario
)
VALUES
(4, 1, 5, 40.00),      
(7, 1, 20, 3.50),     
(10, 2, 15, 1.50),     
(5, 2, 10, 2.00),      
(2, 3, 50, 1.50),      
(3, 3, 40, 2.50),      
(1, 3, 20, 4.00),      
(6, 4, 25, 2.50),      
(3, 4, 20, 2.50),      
(1, 4, 15, 4.00),      
(6, 5, 20, 2.50),      
(1, 5, 30, 4.00),     
(8, 6, 30, 3.00),    
(9, 6, 30, 2.50),     
(8, 7, 40, 3.00),   
(9, 7, 35, 2.50),      
(6, 8, 15, 2.50),      
(8, 8, 20, 3.00),      
(9, 8, 15, 2.50),      
(11, 9, 25, 1.00), 
(1, 10, 15, 4.00),    
(6, 10, 10, 2.50);     


/* =========================
   EVENTO_TERCEIRIZADO
========================= */
INSERT INTO EVENTO_TERCEIRIZADO
(FK_Terceirizado_id_terceirizado,
FK_Evento_id_evento,
Custo_mao_de_obra)
VALUES

(1,2,300.00),
(2,2,250.00),
(3,4,300.00),
(4,6,150.00),
(5,6,200.00),
(6,6,400.00),
(7,8,450.00),
(8,10,200.00),
(9,10,150.00);