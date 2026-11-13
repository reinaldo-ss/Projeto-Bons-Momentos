CREATE TYPE tipo_usuario_enum AS ENUM ('admin', 'cozinha', 'cliente', 'motoboy');
CREATE TYPE opcao_pagamento_enum AS ENUM ('dinheiro', 'cartao', 'pix', 'vale refeição');
CREATE TYPE status_pedido_enum AS ENUM ('a fazer', 'fazendo', 'saiu para entrega', 'entregue', 'cancelado');

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
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
    tipo_usuario tipo_usuario_enum NOT NULL DEFAULT 'cliente'
);

CREATE TABLE receitas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    ingredientes TEXT,
    foto VARCHAR(255),
    preco NUMERIC(10,2) NOT NULL
);

CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receita INT NOT NULL,
    id_motoboy INT NULL,
    observacao TEXT,
    endereco_entrega VARCHAR(255) NOT NULL,
    opcao_pagamento opcao_pagamento_enum NOT NULL,
    status status_pedido_enum NOT NULL DEFAULT 'a fazer',
    valor_total NUMERIC(10,2) NOT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_receita) REFERENCES receitas(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_motoboy) REFERENCES usuarios(id) ON DELETE SET NULL
);

INSERT INTO usuarios (nome, email, senha, data_nascimento, tipo_usuario)
VALUES  
    ('Administrador', 'admin@admin.com', 'senhageral123@', '1990-01-01', 'admin'),
    ('Cozinha', 'cozinha@cozinha.com', 'senhageral123@', '1990-01-01', 'cozinha'),
    ('Cliente Exemplo', 'cliente@email.com', 'senhageral123@', '2000-05-15', 'cliente'),
    ('Motoboy Exemplo', 'motoboy@email.com', 'senhageral123@', '1995-03-20', 'motoboy');

INSERT INTO receitas (nome, descricao, ingredientes, preco)
VALUES
    ('Bolo de Chocolate', 'Bolo fofinho com cobertura de ganache', 'Farinha, açúcar, ovos, chocolate, manteiga', 35.90),
    ('Cupcake de Morango', 'Cupcake com recheio de morango e chantilly', 'Farinha, açúcar, ovos, morango, creme de leite', 8.50);

INSERT INTO pedidos (id_usuario, id_receita, id_motoboy, observacao, endereco_entrega, opcao_pagamento, status, valor_total)
VALUES
    (3, 1, NULL, 'Sem glúten, por favor', 'Rua das Flores, 123, Bairro Jardim - São Paulo/SP', 'pix', 'a fazer', 35.90);