CREATE DATABASE BonsMomentos_DataBase;

use BonsMomentos_DataBase;

CREATE TABLE public.usuarios (
  id serial NOT NULL,
  nome character varying(100) NOT NULL,
  email character varying(100) NOT NULL,
  senha character varying(255) NOT NULL,
  data_nascimento date NOT NULL,
  cep character varying(10) NULL,
  endereco character varying(150) NULL,
  cidade character varying(80) NULL,
  bairro character varying(80) NULL,
  numero character varying(10) NULL,
  complemento character varying(80) NULL,
  telefone character varying(20) NULL,
  tipo_usuario character varying(30) NULL,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_email_key UNIQUE (email)
) TABLESPACE pg_default;

CREATE TABLE public.receitas (
  id serial NOT NULL,
  nome character varying(100) NOT NULL,
  descricao text NULL,
  ingredientes text NULL,
  foto text NULL,
  preco numeric(10, 2) NOT NULL,
  CONSTRAINT receitas_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

CREATE TABLE public.motoboy (
  id serial NOT NULL,
  nome character varying(100) NOT NULL,
  cpf character varying(14) NOT NULL,
  telefone character varying(20) NOT NULL,
  cnh character varying(20) NOT NULL,
  placa character varying(10) NOT NULL,
  senha character varying(255) NOT NULL,
  CONSTRAINT motoboy_pkey PRIMARY KEY (id),
  CONSTRAINT motoboy_cnh_key UNIQUE (cnh),
  CONSTRAINT motoboy_cpf_key UNIQUE (cpf)
) TABLESPACE pg_default;

-- 2. Tabela dependente (pedidos)
CREATE TABLE public.pedidos (
  id serial NOT NULL,
  id_usuario integer NOT NULL,
  id_receita integer NOT NULL,
  observacao text NULL,
  endereco_entrega character varying(255) NOT NULL,
  opcao_pagamento character varying(25) NULL,
  status character varying(25) NULL,
  valor_total numeric(10, 2) NOT NULL,
  data_pedido timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  id_motoboy integer NULL,
  CONSTRAINT pedidos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_pedido_motoboy FOREIGN KEY (id_motoboy) REFERENCES public.motoboy (id) ON DELETE SET NULL,
  CONSTRAINT pedidos_id_receita_fkey FOREIGN KEY (id_receita) REFERENCES public.receitas (id) ON DELETE CASCADE,
  CONSTRAINT pedidos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios (id) ON DELETE CASCADE
) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS pedidos_motoboy_idx ON public.pedidos USING btree (id_motoboy) TABLESPACE pg_default;