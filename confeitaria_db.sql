CREATE DATABASE IF NOT EXISTS confeitaria;
USE confeitaria;

DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS receitas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_nascimento DATE NOT NULL,
    cep VARCHAR(10),
    endereco VARCHAR(150),
    cidade VARCHAR(80),
    bairro VARCHAR(80),
    numero VARCHAR(10),
    complemento VARCHAR(80),
    telefone VARCHAR(20),
    tipo_usuario ENUM('admin', 'cozinha', 'cliente') NOT NULL DEFAULT 'cliente'
);

CREATE TABLE receitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ingredientes TEXT,
    foto VARCHAR(255),
    preco DECIMAL(10,2) NOT NULL
);

CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,
    observacao TEXT,
    opcao_pagamento ENUM('dinheiro', 'cartao', 'pix', 'vale refeição') NOT NULL,
    status ENUM('a fazer', 'fazendo', 'saiu para entrega', 'entregue', 'cancelado') NOT NULL DEFAULT 'a fazer',
    valor_total DECIMAL(10,2) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_receita) REFERENCES receitas(id) ON DELETE RESTRICT
);

INSERT INTO usuarios (nome, email, senha, data_nascimento, tipo_usuario)
VALUES 
    ('Administrador', 'admin@admin.com', 'senhageral123@', '1990-01-01', 'admin'),
    ('Cozinha', 'cozinha@cozinha.com', 'senhageral123@', '1990-01-01', 'cozinha');

INSERT INTO receitas (nome, descricao, ingredientes, preco)
VALUES
    ('Bolo de Chocolate', 'Bolo fofinho com cobertura de ganache', 'Farinha, açúcar, ovos, chocolate, manteiga', 35.90),
    ('Cupcake de Morango', 'Cupcake com recheio de morango e chantilly', 'Farinha, açúcar, ovos, morango, creme de leite', 8.50);

INSERT INTO pedidos (id_usuario, id_receita, observacao, opcao_pagamento, status, valor_total)
VALUES
    (1, 1, 'Sem glúten, por favor', 'pix', 'a fazer', 35.90);