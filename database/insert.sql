SET NAMES utf8mb4;
USE buffet_eventos;

/* =========================================================
   POVOAMENTO DO BANCO - VALORES REALISTAS DE MERCADO
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
('Vitória da Conquista', 80.00),
('Barra do Choça', 120.00),
('Itapetinga', 250.00),
('Poções', 180.00),
('Planalto', 150.00),
('Jequié', 320.00),
('Itambé', 220.00),
('Brumado', 380.00),
('Guanambi', 450.00),
('Ilhéus', 600.00);

/* =========================
   CATEGORIA
========================= */
INSERT INTO Categoria (nome_categoria, descricao)
VALUES
('Bebidas', 'Serviços de bebidas e drinks artesanais'),
('Sobremesas', 'Serviços de doces, sorvetes e estações sobremesa'),
('Salgados', 'Lanches gourmet e estações salgadas'),
('Infantil', 'Estações interativas para público infantil'),
('Corporativo', 'Coffee breaks e recepções empresariais');

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
('Bar de Drinks', 'Drinks alcoólicos e não alcoólicos completos', 45.00, 1),
('Coffee Break Executivo', 'Coffee break corporativo completo com salgados e bebidas', 38.00, 5),
('Açaí Premium', 'Estação completa de açaí com acompanhamentos livres', 25.00, 2),
('Sorvete Tropical', 'Ilha de sorvetes artesanais e caldas', 22.00, 2),
('Churros Fest', 'Estação de churros recheados na hora', 18.00, 2),
('Hambúrguer Artesanal', 'Mini hambúrgueres gourmet assados na hora', 35.00, 3),
('Pizza Express', 'Rodízio de pizza artesanal em forno móvel', 48.00, 3),
('Crepe Gourmet', 'Rodízio de crepes franceses doces e salgados', 42.00, 3),
('Algodão Doce Kids', 'Estação de algodão doce colorido ilimitado', 12.00, 4),
('Pipoca Gourmet', 'Pipocas gourmet doces e salgadas temperadas', 15.00, 4);

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
/* Bar de Drinks */
(45.00, 50, 1, 1),
(38.00, 100, 51, 1),
(32.00, 300, 101, 1),

/* Coffee Break Executivo */
(38.00, 50, 1, 2),
(32.00, 100, 51, 2),
(28.00, 300, 101, 2),

/* Açaí Premium */
(25.00, 50, 1, 3),
(20.00, 100, 51, 3),
(18.00, 300, 101, 3),

/* Sorvete Tropical */
(22.00, 50, 1, 4),
(18.00, 100, 51, 4),

/* Churros Fest */
(18.00, 50, 1, 5),
(15.00, 100, 51, 5);

/* =========================
   INSUMO
========================= */
INSERT INTO Insumo (nome, custo_unitario)
VALUES
('Leite Condensado (Caixa 395g)', 6.50),
('Granola (Kg)', 18.00),
('Morango (Bandeja 250g)', 8.50),
('Vodka Nacional (Garrafa 1L)', 38.00),
('Leite Integral (Litro)', 5.20),
('Chocolate em Barra (Kg)', 42.00),
('Refrigerante (Garrafa 2L)', 9.00),
('Queijo Mussarela (Kg)', 36.00),
('Presunto Fatiado (Kg)', 28.00),
('Café Gourmet (Gourmet 500g)', 24.00),
('Açúcar Refinado (Kg)', 4.50);

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
('Carlos Drinks', '77999991111', 45.00),
('Pedro Garçom', '77999992222', 35.00),
('Lucas Bartender', '77999993333', 50.00),
('Rafael Cozinheiro', '77999994444', 55.00),
('Thiago Eventos', '77999995555', 40.00),
('Marcos Buffet', '77999996666', 65.00),
('Felipe Chef', '77999997777', 75.00),
('André Garçom', '77999998888', 35.00),
('Diego Drinks', '77999999999', 50.00),
('Paulo Churrasqueiro', '77999990000', 60.00);

/* =========================
   EVENTO
========================= */
INSERT INTO Evento (
  nome_evento,
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
('Festa de Aniversário do Lucas','2026-09-17', '18:00:00', 'Salão Imperial', 'Confirmado', 120, '23:00:00', 1, 1),
('Comemoração de Formatura','2026-10-29', '19:00:00', 'Espaço Fest', 'Confirmado', 80, '00:00:00', 2, 1),
('Aniversário de Laura','2026-12-21', '17:00:00', 'Chácara Verde', 'Pendente', 150, '22:00:00', 3, 3),
('Casamento DG','2026-09-07', '18:30:00', 'Buffet Real', 'Confirmado', 90, '23:30:00', 4, 1),
('Coffee-break da LT Design','2026-09-11', '16:00:00', 'Área Vip', 'Cancelado', 60, '21:00:00', 5, 5),
('Geruza Nails','2026-09-01', '20:00:00', 'Casa de Eventos', 'Confirmado', 200, '02:00:00', 6, 6),
('Coffee-break Estética Automotiva','2026-05-15', '15:00:00', 'Espaço Kids', 'Pendente', 70, '20:00:00', 7, 7),
('Bodas de Prata GH','2026-10-17', '19:30:00', 'Salão Ouro', 'Cancelado', 110, '00:30:00', 8, 8),
('Casamento Miguel','2026-11-20', '18:00:00', 'Fazenda Bela Vista', 'Cancelado', 180, '01:00:00', 9, 9),
('Chá revelação Maria','2026-10-15', '21:00:00', 'Clube Central', 'Confirmado', 250, '05:00:00', 10, 10);

/* =========================
   ORCAMENTO (Valores coerentes com N° Convidados)
========================= */
INSERT INTO Orcamento (
  valor_total,
  desconto,
  valor_final,
  sinal_pagamento,
  fk_Evento_id_evento
)
VALUES
(6240.00, 300.00, 5940.00, 2000.00, 1), /* 120 conv. */
(3760.00, 160.00, 3600.00, 1200.00, 2), /* 80 conv. */
(8250.00, 450.00, 7800.00, 2500.00, 3), /* 150 conv. */
(4600.00, 200.00, 4400.00, 1500.00, 4), /* 90 conv. */
(2670.00, 170.00, 2500.00, 1000.00, 5), /* 60 conv. */
(11520.00, 720.00, 10800.00, 4000.00, 6), /* 200 conv. */
(3170.00, 170.00, 3000.00, 1000.00, 7), /* 70 conv. (#7 corrigido) */
(6120.00, 320.00, 5800.00, 2000.00, 8), /* 110 conv. */
(9850.00, 550.00, 9300.00, 3000.00, 9), /* 180 conv. */
(13600.00, 800.00, 12800.00, 5000.00, 10); /* 250 conv. */

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
(FK_Servico_id_servico, FK_Evento_id_evento, quantidade, preco_praticado)
VALUES
(1, 1, 1, 38.00),
(1, 2, 1, 38.00),
(1, 3, 1, 32.00),
(1, 4, 1, 38.00),
(1, 6, 1, 32.00),
(2, 7, 1, 38.00), /* Coffee break p/ 70 convidados */
(1, 8, 1, 32.00),
(1, 10, 1, 32.00),
(3, 1, 1, 20.00),
(10, 8, 1, 15.00);

/* =========================
   SERVICO_INSUMO
========================= */
INSERT INTO SERVICO_INSUMO (
  FK_Insumo_id_insumo,
  FK_Servico_id_servico,
  quantidade_insumo
)
VALUES
(4, 1, 15),      
(7, 1, 40),     
(10, 2, 5),     
(5, 2, 20),      
(2, 3, 15),      
(3, 3, 20),      
(1, 3, 10),      
(6, 4, 15),      
(3, 4, 10),      
(1, 4, 8),      
(6, 5, 10),      
(1, 5, 15),     
(8, 6, 12),    
(9, 6, 10),     
(8, 7, 20),   
(9, 7, 15),      
(6, 8, 10),      
(8, 8, 12),      
(9, 8, 10),      
(11, 9, 10), 
(1, 10, 8),    
(6, 10, 6);     

/* =========================
   EVENTO_TERCEIRIZADO
========================= */
INSERT INTO EVENTO_TERCEIRIZADO
(FK_Terceirizado_id_terceirizado,
 FK_Evento_id_evento,
 Custo_mao_de_obra)
VALUES
(1,2,250.00),
(2,2,180.00),
(3,4,280.00),
(4,6,350.00),
(5,6,220.00),
(6,6,450.00),
(7,8,400.00),
(8,10,200.00),
(9,10,280.00);