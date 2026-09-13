DROP DATABASE IF EXISTS buffet_eventos;
CREATE DATABASE buffet_eventos;
USE buffet_eventos;


/* Lógico_1(Corrigido): */

CREATE TABLE Cliente (
    id_cliente INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    telefone VARCHAR(15) NOT NULL
);

CREATE TABLE Evento (
    id_evento INTEGER AUTO_INCREMENT PRIMARY KEY,
    data_evento DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    local VARCHAR(50) NOT NULL,
    status ENUM('Confirmado', 'Pendente', 'Cancelado') NOT NULL,
    n_convidados SMALLINT UNSIGNED NOT NULL,
    horario_fim TIME NOT NULL,
    fk_Cliente_id_cliente INTEGER,
    fk_Cidade_id_cidade INTEGER
);

CREATE TABLE Servico (
    id_servico INTEGER  AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    descricao VARCHAR(300),
    preco_base DECIMAL(5,2) UNSIGNED NOT NULL,
    fk_Categoria_id_categoria INTEGER
);

CREATE TABLE Orcamento (
    id_orcamento INTEGER AUTO_INCREMENT PRIMARY KEY,
    valor_total DECIMAL(7,2) UNSIGNED NOT NULL,
    desconto DECIMAL(5,2) UNSIGNED NOT NULL,
    valor_final DECIMAL(7,2) UNSIGNED NOT NULL,
    sinal_pagamento DECIMAL(7,2) UNSIGNED NOT NULL,
    fk_Evento_id_evento INTEGER UNIQUE
);

CREATE TABLE Carrinho (
    id_carrinho INTEGER AUTO_INCREMENT PRIMARY KEY,
    tipo_base VARCHAR(20) NOT NULL,
    capacidade SMALLINT UNSIGNED NOT NULL,
    ativo BOOLEAN NOT NULL
);

CREATE TABLE Categoria (
    nome_categoria VARCHAR(20) NOT NULL,
    descricao VARCHAR(300),
    id_categoria INTEGER AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE Produto (
    id_produto INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL
);

CREATE TABLE Cidade (
    id_cidade INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30),
    taxa_deslocamento DECIMAL(6,2) UNSIGNED NOT NULL
);

CREATE TABLE Preco_convidado (
    preco_por_pessoa DECIMAL(4,2) UNSIGNED NOT NULL,
    qtd_max_convidados SMALLINT UNSIGNED NOT NULL,
    qtd_min_Convidados SMALLINT UNSIGNED NOT NULL,
    id_preco_convidado INTEGER AUTO_INCREMENT PRIMARY KEY,
    fk_Servico_id_servico INTEGER 
);

CREATE TABLE Terceirizado (
    id_terceirizado INTEGER AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    trabalho_hora DECIMAL(4,2) UNSIGNED NOT NULL
);

CREATE TABLE EVENTO_CARRINHO (
    FK_Evento_id_evento INTEGER,
    FK_Carrinho_id_carrinho INTEGER,
    PRIMARY KEY (FK_Evento_id_evento, FK_Carrinho_id_carrinho)
);

CREATE TABLE EVENTO_SERVICO (
    FK_Servico_id_servico INTEGER ,
    FK_Evento_id_evento INTEGER,
    quantidade SMALLINT UNSIGNED NOT NULL,
    preco_praticado DECIMAL(6,2) UNSIGNED NOT NULL,
    PRIMARY KEY (FK_Servico_id_servico, FK_Evento_id_evento)
);

CREATE TABLE SERVICO_PRODUTO (
    FK_Produto_id_produto INTEGER,
    FK_Servico_id_servico INTEGER ,
    quantidade_produto SMALLINT UNSIGNED NOT NULL,
    custo_unitario DECIMAL(4,2) UNSIGNED NOT NULL,
    PRIMARY KEY (FK_Servico_id_servico, FK_Produto_id_produto)
);

CREATE TABLE EVENTO_TERCEIRIZADO (
    FK_Terceirizado_id_terceirizado INTEGER,
    FK_Evento_id_evento INTEGER,
    Custo_mao_de_obra DECIMAL(5,2) UNSIGNED NOT NULL,
    PRIMARY KEY (FK_Terceirizado_id_terceirizado, FK_Evento_id_evento)
);
 
ALTER TABLE Evento ADD CONSTRAINT FK_Evento_2
    FOREIGN KEY (fk_Cliente_id_cliente)
    REFERENCES Cliente (id_cliente)
    ON DELETE RESTRICT;
 
ALTER TABLE Evento ADD CONSTRAINT FK_Evento_3
    FOREIGN KEY (fk_Cidade_id_cidade)
    REFERENCES Cidade (id_cidade);
 
ALTER TABLE Servico ADD CONSTRAINT FK_Servico_3
    FOREIGN KEY (fk_Categoria_id_categoria)
    REFERENCES Categoria (id_categoria);
 
ALTER TABLE Orcamento ADD CONSTRAINT FK_Orcamento_2
    FOREIGN KEY (fk_Evento_id_evento)
    REFERENCES Evento (id_evento)
    ON DELETE CASCADE;
 
ALTER TABLE Preco_convidado ADD CONSTRAINT FK_Preco_convidado_2
    FOREIGN KEY (fk_Servico_id_servico)
    REFERENCES Servico (id_servico);
 
ALTER TABLE EVENTO_CARRINHO ADD CONSTRAINT FK_EVENTO_CARRINHO_1
    FOREIGN KEY (FK_Evento_id_evento)
    REFERENCES Evento (id_evento)
    ON DELETE RESTRICT;
 
ALTER TABLE EVENTO_CARRINHO ADD CONSTRAINT FK_EVENTO_CARRINHO_2
    FOREIGN KEY (FK_Carrinho_id_carrinho)
    REFERENCES Carrinho (id_carrinho)
    ON DELETE RESTRICT;
 
ALTER TABLE EVENTO_SERVICO ADD CONSTRAINT FK_EVENTO_SERVICO_1
    FOREIGN KEY (FK_Servico_id_servico)
    REFERENCES Servico (id_servico)
    ON DELETE RESTRICT;
 
ALTER TABLE EVENTO_SERVICO ADD CONSTRAINT FK_EVENTO_SERVICO_2
    FOREIGN KEY (FK_Evento_id_evento)
    REFERENCES Evento (id_evento)
    ON DELETE RESTRICT;
 
ALTER TABLE SERVICO_PRODUTO ADD CONSTRAINT FK_SERVICO_PRODUTO_1
    FOREIGN KEY (FK_Produto_id_produto)
    REFERENCES Produto (id_produto)
    ON DELETE RESTRICT;
 
ALTER TABLE SERVICO_PRODUTO ADD CONSTRAINT FK_SERVICO_PRODUTO_2
    FOREIGN KEY (FK_Servico_id_servico)
    REFERENCES Servico (id_servico)
    ON DELETE RESTRICT;
 
ALTER TABLE EVENTO_TERCEIRIZADO ADD CONSTRAINT FK_EVENTO_TERCEIRIZADO_1
    FOREIGN KEY (FK_Terceirizado_id_terceirizado)
    REFERENCES Terceirizado (id_terceirizado)
    ON DELETE RESTRICT;
 
ALTER TABLE EVENTO_TERCEIRIZADO ADD CONSTRAINT FK_EVENTO_TERCEIRIZADO_2
    FOREIGN KEY (FK_Evento_id_evento)
    REFERENCES Evento (id_evento)
    ON DELETE RESTRICT;