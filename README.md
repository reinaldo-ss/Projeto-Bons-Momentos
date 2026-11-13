# 🍰 BonsMomentos - Sistema de Gestão para Confeitaria

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Linguagem](https://img.shields.io/badge/Backend-C%23-239120)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-E34F26)

## 📖 Sobre o Projeto
O **BonsMomentos** é um sistema web completo desenvolvido para o gerenciamento de uma confeitaria. O projeto abrange desde a interface de compra para o cliente final até o controle de fluxo interno, incluindo a gestão administrativa, painel dinâmico para a cozinha (Kanban) e área dedicada aos motoboys.

Este projeto foi desenvolvido como parte dos requisitos acadêmicos (Projeto Integrado Multidisciplinar - PIM / BIM2 - 2026).

## ⚙️ Funcionalidades por Módulo

### 🛍️ Área do Cliente
* **Cardápio Digital:** Exibição rápida de receitas, ingredientes e preços.
* **Detalhes do Produto:** Visualização completa da receita com opção de compra.
* **Checkout:** Tela de finalização de compra intuitiva (com endereço do perfil, opções de pagamento na retirada e campo de observações).
* **Painel do Usuário:** Histórico de pedidos e gerenciamento de conta.

### 🧑‍💻 Painel Administrativo
* **Gestão do Cardápio:** Tabela de gerenciamento das receitas (CRUD completo).
* **Gestão de Motoboys:** Cadastro e controle de entregadores parceiros.
* **Histórico Global:** Visualização de todos os pedidos já realizados no sistema.

### 👨‍🍳 Painel da Cozinha (SPA)
* **Kanban de Pedidos:** Fluxo visual de trabalho dividido em colunas (`A fazer`, `Fazendo`, `Enviar para entrega`).
* **Navegação Dinâmica:** Alternância entre a tela de pedidos e o histórico sem recarregar a página (utilizando Fetch API).
* **Despacho:** Tela dedicada para vinculação de pedidos aos motoboys disponíveis.

### 🛵 Área do Entregador (Mobile)
* **Interface Mobile-First:** Telas otimizadas para uso em smartphones.
* **Dashboard Dinâmico:** Sistema de acordeão para visualização e conclusão de entregas pendentes.

## 💻 Tecnologias Utilizadas

**Front-end:**
* HTML5, CSS3 estruturado e responsivo.
* JavaScript Vanilla (Fetch API para requisições assíncronas e manipulação do DOM).

**Back-end & Arquitetura:**
* **C#:** Responsável por toda a lógica de negócios, validações e controle de fluxo, garantindo uma arquitetura limpa e inteligente.
* **Banco de Dados Relacional (SQL):** Armazenamento de dados seguro. (Obs: Utilização de *Triggers* focadas em auditoria/logs e *Stored Procedures* focadas na geração de relatórios de leitura).

## 🚀 Como Executar o Projeto

1. Clone este repositório:
   ```bash
   git clone [https://github.com/reinaldo-ss/Projeto-PIM-BIM2-2026.git](https://github.com/reinaldo-ss/Projeto-PIM-BIM2-2026.git)
