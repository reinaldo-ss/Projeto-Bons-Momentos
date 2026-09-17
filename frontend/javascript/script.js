function desenharCardsDeReceitas(receitas) {
    const container = document.querySelector('.catalogo');
    if (!container) return;

    container.innerHTML = ''; // Limpa tela

    if (receitas.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%;">Nenhuma receita encontrada com esse nome.</p>';
        const subtitulo = document.querySelector('.subtitulo-mostruario');
        if (subtitulo) subtitulo.textContent = '0 receitas encontradas';
        return;
    }

    receitas.forEach(receita => {
        const nome = receita.nome || receita.Nome;
        const caminhoBanco = receita.foto || receita.Foto;
        const urlFinalFoto = caminhoBanco ? `http://localhost:5147${caminhoBanco}` : `https://placehold.co/400x250?text=${nome}`;
        const ingredientes = receita.ingredientes || receita.Ingredientes || '';
        const preco = Number(receita.preco || receita.Preco || 0);

        container.innerHTML += `
            <div class="card-receita" onclick="verDetalhes(${receita.id || receita.Id})">
                <div class="card-img">
                    <img src="${urlFinalFoto}" alt="${nome}" />
                </div>
                <div class="card-info">
                    <h3>${nome}</h3>
                    <p class="card-ingredientes">${ingredientes}</p>
                    <p class="card-preco">R$ ${preco.toLocaleString('pt-BR')}</p>
                </div>
            </div>
        `;
    });

    const subtitulo = document.querySelector('.subtitulo-mostruario');
    if (subtitulo) subtitulo.textContent = `${receitas.length} receitas encontradas`;
}

async function listarReceitas() {
    try {
        const response = await fetch('http://localhost:5147/api/carro');
        const receitas = await response.json();
        desenharCardsDeReceitas(receitas); // Manda desenhar
    } catch (erro) {
        console.error("Erro ao carregar receitas:", erro);
        const container = document.querySelector('.catalogo');
        if (container) container.innerHTML = '<p>Erro ao carregar o cardápio.</p>';
    }
}

function checarEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // pra n recarregar a página
        realizarPesquisa();
    }
}

// Função criada para pesquisar receitas tanto na tela de admin quanto na vitrine
async function realizarPesquisa() {
    console.log("Iniciando Pesquisa");

    const inputElement = document.getElementById('input-buscar-receita');
    console.log("JavaScript não encontrou o input de busca");
    if (!inputElement) return;

    const termo = inputElement.value.trim();
    const NaTelaDoAdm = document.getElementById('corpo-tabela-admin') !== null;
    console.log("estamos na tela do administrador: ", NaTelaDoAdm);

    if (!termo) {
        console.log("A barra não possui nenhum nome");
        if (NaTelaDoAdm) carregarTabelaAdmin();
        else listarReceitas();
        return;
    }

    try {
        // C# faz o trabalho para as duas telas com a mesma rota
        const response = await fetch(`http://localhost:5147/api/carro/buscar/${termo}`);

        let receitasEncontradas = [];
        if (response.ok) {
            receitasEncontradas = await response.json();
        }

        // Bifurcação: Aqui ele manda os dados pra função certa dependendo da tela
        if (NaTelaDoAdm) {
            desenharLinhasTabelaAdmin(receitasEncontradas);
        } else {
            desenharCardsDeReceitas(receitasEncontradas);
        }

    } catch (error) {
        console.error("Erro na pesquisa:", error);
    }
}

function enviarReceita(form) {
    if (!validarFormCadReceita()) {
        console.log("Formulário inválido e não enviado");
        return;
    }

    const formData = new FormData(form);
    const idEdicao = localStorage.getItem('vm_receita_edicao');
    const url = idEdicao ? `http://localhost:5147/api/carro/${idEdicao}` : 'http://localhost:5147/api/carro';
    const metodo = idEdicao ? 'PUT' : 'POST';

    fetch(url, {
        method: metodo,
        body: formData
    })
    .then(response => {
        if (response.ok) {
            alert(idEdicao ? 'Receita atualizada com sucesso!' : 'Receita cadastrada com sucesso!');
            localStorage.removeItem('vm_receita_edicao');

            carregarPagina('admin');
        } else {
            alert('Erro ao cadastrar a receita. Verifique se preencheu todos os campos.');
            console.error('Status da resposta:', response.status);
        }
    })
    .catch(erro => console.error('Erro na requisição (A API está rodando?):', erro));
}

function novaReceita() {
    localStorage.removeItem('vm_receita_edicao');
    carregarPagina('cadastrarReceita');
}

function prepararEdicaoReceita(id) {
    localStorage.setItem('vm_receita_edicao', id);
    carregarPagina('cadastrarReceita');
}

async function preencherFormularioEdicao() {
    const idEdicao = localStorage.getItem('vm_receita_edicao');

    const tituloForm = document.getElementById('titulo-cadastro-cad-receita');
    const botaoSubmit = document.getElementById('btn-submit-receita');

    if (!idEdicao) {
        if (tituloForm) tituloForm.textContent = 'Formulário Cadastrar Receita';
        if (botaoSubmit) botaoSubmit.textContent = 'Cadastrar receita';
        return;
    }

    if (tituloForm) tituloForm.textContent = 'Editar Receita';
    if (botaoSubmit) botaoSubmit.textContent = 'Salvar Dados';

    try {
        const res = await fetch('http://localhost:5147/api/carro');
        const receitas = await res.json();
        const receita = receitas.find(r => (r.id || r.Id) == idEdicao);

        if (receita) {
            document.getElementById('nome').value = receita.nome || receita.Nome || '';
            document.getElementById('descricao').value = receita.descricao || receita.Descricao || '';
            document.getElementById('ingredientes').value = receita.ingredientes || receita.Ingredientes || '';
            document.getElementById('preco').value = receita.preco || receita.Preco || '';
        }
    }

    catch (error) {
        console.error("Erro ao atualizar os dados da receita", error);
    }
}

function carregarPagina(pagina) {
    fetch(`view/${pagina}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('conteudo').innerHTML = html;

            const header = document.getElementById('secao-header');
            const headerLogado = document.getElementById('secao-header-logado');
            const footer = document.getElementById('secao-footer');

            // Rola para o topo sempre que trocar de página
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (pagina === 'cadastrarCliente' || pagina === 'login' || pagina === 'cadastrarReceita' || pagina === 'admin' || pagina === 'motoboys' || pagina === 'historicoPedidos' || pagina === 'cadastrarMotoBoys') {
                header.style.display = 'none';
                if (headerLogado) headerLogado.style.display = 'none';
                footer.style.display = 'none';
            } else {
                aplicarEstadoLogin();
                footer.style.display = '';
            }

            // GATILHOS DAS PÁGINAS
            if (pagina === 'admin') {
                carregarTabelaAdmin();
            } else if (pagina === 'motoboys') {
                carregarTabelaMotoboys();
            } else if (pagina === 'historicoPedidos') {
                carregarTabelaPedidos();
            } else if (pagina === 'cardapio') {
                listarReceitas();
                inicializarCarrossel();
            } else if (pagina === 'detalhesReceita') {
                preencherDetalhesReceita();
            } else if (pagina === 'finalCompra') {
                preencherResumoCompra();
            } else if (pagina === 'historicoPedidoCliente') {
                carregarPedidosCliente();
            } else if (pagina === 'conta') {
                preencherDadosConta();
            } else if (pagina === 'cadastrarReceita') {
                preencherFormularioEdicao();
            } else if (pagina === 'cadastrarMotoBoys') {
                preencherFormularioEdicaoMotoboy();
            } else if (pagina === 'cadastrarCliente') {
                preencherFormularioEdicaoConta();
            }
        });
}

function desenharLinhasTabelaAdmin(receitas) {
    const tabela = document.getElementById('corpo-tabela-admin');
    if (!tabela) return;

    tabela.innerHTML = ''; // Limpa a tabela

    if (receitas.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhuma receita encontrada na pesquisa.</td></tr>'
        return;
    }

    receitas.forEach(receita => {
        const idReceita = receita.id || receita.Id;
        const precoSeguro = Number(receita.preco || receita.Preco || 0);
        const foto = receita.foto || receita.Foto;
        const urlFoto = foto ? `http://localhost:5147${foto}` : `https://placehold.co/80x50?text=Receita`;

        tabela.innerHTML += `
            <tr>
                <td><img src="${urlFoto}" class="tabela-img"></td>
                <td>${receita.nome || receita.Nome}</td>
                <td class="tabela-texto-truncado" title="${receita.descricao || receita.Descricao || ''}">${receita.descricao || receita.Descricao || ''}</td>
                <td class="tabela-texto-truncado" title="${receita.ingredientes || receita.Ingredientes || ''}">${receita.ingredientes || receita.Ingredientes || ''}</td>
                <td>R$ ${precoSeguro.toLocaleString('pt-BR')}</td>
                <td class="col-acoes">
                    <button class="btn-alterar" onclick="prepararEdicaoReceita(${idReceita})">Alterar</button>
                    <button class="btn-deletar" onclick="deletarReceita(${idReceita})">Deletar</button>
                </td>
            </tr>`;
    })
}
async function carregarTabelaAdmin() {
    try {
        const res = await fetch('http://localhost:5147/api/carro');
        const receitas = await res.json();

        desenharLinhasTabelaAdmin(receitas);
    }  catch (error) {
        console.error("Erro ao carregar tabela do admin: ", error);
    }
}

async function deletarReceita(id) {
    if (confirm("Deseja realmente excluir esta receita?")) {
        const res = await fetch(`http://localhost:5147/api/carro/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Excluído!");
            carregarTabelaAdmin();
        }
    }
}

/* ===== Painel Admin: Motoboys ===== */

function desenharLinhasTabelaMotoboys(motoboys) {
    const tabela = document.getElementById('corpo-tabela-motoboys');
    if (!tabela) return;

    tabela.innerHTML = ''; // Limpa a tabela

    if (motoboys.length === 0) {
        tabela.innerHTML = '<tr><td colspan="13" style="text-align:center;">Nenhum motoboy encontrado na pesquisa.</td></tr>'
        return;
    }

    motoboys.forEach(motoboy => {
        const idMotoboy = motoboy.id || motoboy.Id;

        tabela.innerHTML += `
            <tr>
                <td>${motoboy.nome || motoboy.Nome}</td>
                <td>${motoboy.email || motoboy.Email}</td>
                <td>••••••••</td>
                <td>${motoboy.dataNascimento || motoboy.DataNascimento || ''}</td>
                <td>${motoboy.cep || motoboy.Cep || ''}</td>
                <td>${motoboy.endereco || motoboy.Endereco || ''}</td>
                <td>${motoboy.cidade || motoboy.Cidade || ''}</td>
                <td>${motoboy.bairro || motoboy.Bairro || ''}</td>
                <td>${motoboy.numero || motoboy.Numero || ''}</td>
                <td>${motoboy.complemento || motoboy.Complemento || ''}</td>
                <td>${motoboy.telefone || motoboy.Telefone || ''}</td>
                <td>${motoboy.tipoUsuario || motoboy.TipoUsuario || 'Motoboy'}</td>
                <td class="col-acoes">
                    <button class="btn-alterar" onclick="prepararEdicaoMotoboy(${idMotoboy})">Alterar</button>
                    <button class="btn-deletar" onclick="deletarMotoboy(${idMotoboy})">Deletar</button>
                </td>
            </tr>`;
    })
}

async function carregarTabelaMotoboys() {
    try {
        const res = await fetch('http://localhost:5147/api/motoboy');
        const motoboys = await res.json();

        desenharLinhasTabelaMotoboys(motoboys);
    } catch (error) {
        console.error("Erro ao carregar tabela de motoboys: ", error);
    }
}

async function deletarMotoboy(id) {
    if (confirm("Deseja realmente excluir este motoboy?")) {
        const res = await fetch(`http://localhost:5147/api/motoboy/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert("Excluído!");
            carregarTabelaMotoboys();
        }
    }
}

function novoMotoboy() {
    localStorage.removeItem('vm_motoboy_edicao');
    carregarPagina('cadastrarMotoBoys');
}

function prepararEdicaoMotoboy(id) {
    localStorage.setItem('vm_motoboy_edicao', id);
    carregarPagina('cadastrarMotoBoys');
}

async function preencherFormularioEdicaoMotoboy() {
    const idEdicao = localStorage.getItem('vm_motoboy_edicao');

    const tituloForm = document.getElementById('titulo-cadastro-cad-motoboy');
    const botaoSubmit = document.getElementById('btn-submit-motoboy');

    if (!idEdicao) {
        if (tituloForm) tituloForm.textContent = 'Formulário Cadastrar Motoboy';
        if (botaoSubmit) botaoSubmit.textContent = 'Cadastrar motoboy';
        return;
    }

    if (tituloForm) tituloForm.textContent = 'Editar Dados do Motoboy';
    if (botaoSubmit) botaoSubmit.textContent = 'Salvar Dados';

    try {
        const res = await fetch('http://localhost:5147/api/motoboy');
        const motoboys = await res.json();
        const motoboy = motoboys.find(m => (m.id || m.Id) == idEdicao);

        if (motoboy) {
            document.getElementById('nome').value = motoboy.nome || motoboy.Nome || '';
            document.getElementById('email').value = motoboy.email || motoboy.Email || '';
            document.getElementById('dataNascimento').value = motoboy.dataNascimento || motoboy.DataNascimento || '';
            document.getElementById('cep').value = motoboy.cep || motoboy.Cep || '';
            document.getElementById('endereco').value = motoboy.endereco || motoboy.Endereco || '';
            document.getElementById('cidade').value = motoboy.cidade || motoboy.Cidade || '';
            document.getElementById('bairro').value = motoboy.bairro || motoboy.Bairro || '';
            document.getElementById('numero').value = motoboy.numero || motoboy.Numero || '';
            document.getElementById('complemento').value = motoboy.complemento || motoboy.Complemento || '';
            document.getElementById('telefone').value = motoboy.telefone || motoboy.Telefone || '';
        }
    } catch (error) {
        console.error("Erro ao atualizar os dados do motoboy", error);
    }
}

function enviarMotoboy(form) {
    if (!validarFormCadMotoboy()) return;

    const formData = new FormData(form);
    const idEdicao = localStorage.getItem('vm_motoboy_edicao');
    const url = idEdicao ? `http://localhost:5147/api/motoboy/${idEdicao}` : 'http://localhost:5147/api/motoboy';
    const metodo = idEdicao ? 'PUT' : 'POST';

    const dadosMotoboy = Object.fromEntries(formData.entries());

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosMotoboy)
    })
    .then(response => {
        if (response.ok) {
            alert(idEdicao ? 'Motoboy atualizado com sucesso!' : 'Motoboy cadastrado com sucesso!');
            localStorage.removeItem('vm_motoboy_edicao');
            carregarPagina('motoboys');
        } else {
            alert('Erro ao cadastrar o motoboy. Verifique se preencheu todos os campos.');
            console.error('Status da resposta:', response.status);
        }
    })
    .catch(erro => console.error('Erro na requisição (A API está rodando?):', erro));
}

/* ===== Painel Admin: Histórico de Pedidos ===== */

function desenharLinhasTabelaPedidos(pedidos) {
    const tabela = document.getElementById('corpo-tabela-pedidos');
    if (!tabela) return;

    tabela.innerHTML = ''; // Limpa a tabela

    if (pedidos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="6" style="text-align:center;">Nenhum pedido encontrado.</td></tr>'
        return;
    }

    pedidos.forEach(pedido => {
        const status = pedido.status || pedido.Status || '';
        const statusClasse = 'status-' + status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');

        tabela.innerHTML += `
            <tr>
                <td>${pedido.idUsuario || pedido.id_usuario || pedido.IdUsuario || ''}</td>
                <td>${pedido.idReceita || pedido.id_receita || pedido.IdReceita || ''}</td>
                <td class="tabela-texto-truncado" title="${pedido.observacao || pedido.Observacao || ''}">${pedido.observacao || pedido.Observacao || ''}</td>
                <td>${pedido.opcaoPagamento || pedido.opcao_pagamento || pedido.OpcaoPagamento || ''}</td>
                <td><span class="status-pill ${statusClasse}">${status}</span></td>
                <td>${pedido.dataPedido || pedido.data_pedido || pedido.DataPedido || ''}</td>
            </tr>`;
    })
}

async function carregarTabelaPedidos() {
    try {
        const res = await fetch('http://localhost:5147/api/pedido');
        const pedidos = await res.json();

        desenharLinhasTabelaPedidos(pedidos);
    } catch (error) {
        console.error("Erro ao carregar histórico de pedidos: ", error);
    }
}

/* ===== Meus Pedidos (cliente) ===== */

async function carregarPedidosCliente() {
    const lista = document.getElementById('lista-pedidos-cliente');
    if (!lista) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));
    if (!usuarioLogado) {
        lista.innerHTML = '<p class="pedidos-cliente-vazio">Faça login para ver seus pedidos.</p>';
        return;
    }

    try {
        const usuarioId = usuarioLogado.id || usuarioLogado.Id;

        const [resPedidos, resReceitas] = await Promise.all([
            fetch('http://localhost:5147/api/pedido'),
            fetch('http://localhost:5147/api/carro')
        ]);
        const pedidos = await resPedidos.json();
        const receitas = await resReceitas.json();

        const pedidosCliente = pedidos.filter(p => (p.idUsuario || p.id_usuario || p.IdUsuario) == usuarioId);

        if (pedidosCliente.length === 0) {
            lista.innerHTML = '<p class="pedidos-cliente-vazio">Você ainda não fez nenhum pedido.</p>';
            return;
        }

        lista.innerHTML = '';

        pedidosCliente.forEach(pedido => {
            const idReceita = pedido.idReceita || pedido.id_receita || pedido.IdReceita;
            const receita = receitas.find(r => (r.id || r.Id) == idReceita);

            const nome = receita ? (receita.nome || receita.Nome) : 'Receita indisponível';
            const foto = receita ? (receita.foto || receita.Foto) : null;
            const urlFoto = foto ? `http://localhost:5147${foto}` : `https://placehold.co/100x100?text=${nome}`;
            const preco = receita ? Number(receita.preco || receita.Preco).toLocaleString('pt-BR') : '-';

            const status = pedido.status || pedido.Status || '';
            const statusClasse = 'status-' + status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-');
            const dataPedido = pedido.dataPedido || pedido.data_pedido || pedido.DataPedido || '';
            const pagamento = pedido.opcaoPagamento || pedido.opcao_pagamento || pedido.OpcaoPagamento || '';

            lista.innerHTML += `
                <div class="pedido-cliente-card">
                    <img class="pedido-cliente-foto" src="${urlFoto}" alt="${nome}">
                    <div class="pedido-cliente-info">
                        <p class="pedido-cliente-nome">${nome}</p>
                        <p class="pedido-cliente-data">Pedido em ${dataPedido}</p>
                        <p class="pedido-cliente-pagamento">${pagamento}</p>
                    </div>
                    <div class="pedido-cliente-status">
                        <span class="status-pill ${statusClasse}">${status}</span>
                        <p class="pedido-cliente-preco">R$ ${preco}</p>
                    </div>
                </div>`;
        });
    } catch (erro) {
        console.error("Erro ao carregar pedidos do cliente:", erro);
        lista.innerHTML = '<p class="pedidos-cliente-vazio">Erro ao carregar seus pedidos.</p>';
    }
}

/* ===== Finalizar Compra ===== */

async function preencherResumoCompra() {
    const id = localStorage.getItem('vm_receita_detalhe');
    if (!id) return;

    try {
        const res = await fetch('http://localhost:5147/api/carro');
        const receitas = await res.json();
        const receita = receitas.find(r => (r.id || r.Id) == id);

        if (!receita) {
            console.error("Receita não encontrada.");
            return;
        }

        const nome = receita.nome || receita.Nome;
        const preco = Number(receita.preco || receita.Preco).toLocaleString('pt-BR');
        const caminhoFoto = receita.foto || receita.Foto;
        const urlFoto = caminhoFoto ? `http://localhost:5147${caminhoFoto}` : `https://placehold.co/200x150?text=${nome}`;

        const nomeEl = document.getElementById('compra-nome');
        const precoEl = document.getElementById('compra-preco');
        const fotoEl = document.getElementById('compra-foto');
        const resumoPrecoEl = document.getElementById('compra-resumo-preco');
        const totalEl = document.getElementById('compra-total');
        if (nomeEl) nomeEl.textContent = nome;
        if (precoEl) precoEl.textContent = `R$ ${preco}`;
        if (fotoEl) fotoEl.src = urlFoto;
        if (resumoPrecoEl) resumoPrecoEl.textContent = `R$ ${preco}`;
        if (totalEl) totalEl.textContent = `R$ ${preco}`;
    } catch (erro) {
        console.error("Erro ao carregar resumo da compra:", erro);
    }

    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));
    const enderecoEl = document.getElementById('compra-endereco-texto');
    if (enderecoEl) {
        if (usuarioLogado) {
            const endereco = usuarioLogado.endereco || usuarioLogado.Endereco || '';
            const numero = usuarioLogado.numero || usuarioLogado.Numero || '';
            const bairro = usuarioLogado.bairro || usuarioLogado.Bairro || '';
            const cidade = usuarioLogado.cidade || usuarioLogado.Cidade || '';
            const cep = usuarioLogado.cep || usuarioLogado.Cep || '';
            enderecoEl.textContent = `${endereco}, ${numero} - ${bairro}, ${cidade} - CEP ${cep}`;
        } else {
            enderecoEl.textContent = 'Faça login para exibir seu endereço de entrega.';
        }
    }
}

function finalizarCompra(form) {
    const idReceita = localStorage.getItem('vm_receita_detalhe');
    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));

    if (!usuarioLogado) {
        alert("Você precisa estar logado para finalizar a compra!");
        carregarPagina('login');
        return;
    }

    const formData = new FormData(form);
    const opcaoPagamento = formData.get('opcaoPagamento');
    const erroPagamentoEl = document.getElementById('erro-opcaoPagamento');

    if (!opcaoPagamento) {
        if (erroPagamentoEl) erroPagamentoEl.textContent = 'Selecione uma forma de pagamento';
        return;
    }
    if (erroPagamentoEl) erroPagamentoEl.textContent = '';

    const dadosPedido = {
        idUsuario: usuarioLogado.id || usuarioLogado.Id,
        idReceita: idReceita,
        observacao: formData.get('observacao') || '',
        opcaoPagamento: opcaoPagamento,
        status: 'Pendente',
        dataPedido: new Date().toISOString()
    };

    fetch('http://localhost:5147/api/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPedido)
    })
    .then(response => {
        if (response.ok) {
            alert('Pedido realizado com sucesso!');
            localStorage.removeItem('vm_receita_detalhe');
            carregarPagina('cardapio');
        } else {
            alert('Erro ao finalizar o pedido. Tente novamente.');
            console.error('Status da resposta:', response.status);
        }
    })
    .catch(erro => console.error('Erro na requisição (A API está rodando?):', erro));
}

function verDetalhes(id) {
    localStorage.setItem('vm_receita_detalhe', id);
    carregarPagina('detalhesReceita');
}

async function preencherDetalhesReceita() {
    const id = localStorage.getItem('vm_receita_detalhe');
    if (!id) return;

    try {
        // 1. Busca as receitas na API
        const res = await fetch('http://localhost:5147/api/carro');
        const receitas = await res.json();

        // 2. Encontra a receita específica pelo id
        const receita = receitas.find(r => (r.id || r.Id) == id);

        if (!receita) {
            console.error("Receita não encontrada.");
            return;
        }

        // 3. Mapeia os dados do banco para variáveis
        const nome = receita.nome || receita.Nome;
        const preco = Number(receita.preco || receita.Preco).toLocaleString('pt-BR');
        const descricao = receita.descricao || receita.Descricao || "Nenhuma descrição informada.";
        const ingredientes = receita.ingredientes || receita.Ingredientes || "Nenhum ingrediente informado.";

        // 4. Injeta os TEXTOS no HTML
        document.getElementById('detalhe-nome-titulo').textContent = nome;
        document.getElementById('detalhe-preco').textContent = `R$ ${preco}`;
        document.getElementById('detalhe-descricao-texto').textContent = descricao;
        document.getElementById('detalhe-ingredientes-texto').textContent = ingredientes;

        // 5. Injeta a FOTO no HTML
        const urlBase = 'http://localhost:5147';
        const caminhoFoto = receita.foto || receita.Foto;
        const urlFoto = caminhoFoto ? `${urlBase}${caminhoFoto}` : `https://placehold.co/800x500?text=${nome}`;
        const imgPrincipal = document.getElementById('detalhe-foto-principal');
        if (imgPrincipal) imgPrincipal.src = urlFoto;

        // 6. Configura o botão de WhatsApp dinâmico
        const textoZap = encodeURIComponent(`Olá! Tenho interesse na receita ${nome} anunciada na Bons Momentos.`);
        document.getElementById('btn-whatsapp-dinamico').href = `https://wa.me/5511900000000?text=${textoZap}`;

    } catch (erro) {
        console.error("Erro ao carregar detalhes:", erro);
    }
}

/* ===== Carrossel ===== */
function inicializarCarrossel() {
    const trilho = document.getElementById('carrossel-trilho');
    if (!trilho) return;

    const indicadores = document.querySelectorAll('.indicador');
    const totalSlides = trilho.children.length;
    let slideAtual = 0;

    function atualizar() {
        trilho.style.transform = `translateX(-${slideAtual * 100}%)`;
        indicadores.forEach((ind, i) => ind.classList.toggle('ativo', i === slideAtual));
    }

    window.moverCarrossel = function (dir) {
        slideAtual = (slideAtual + dir + totalSlides) % totalSlides;
        atualizar();
    };
    window.irParaSlide = function (i) {
        slideAtual = i;
        atualizar();
    };

    if (window._carrosselTimer) clearInterval(window._carrosselTimer);
    window._carrosselTimer = setInterval(() => window.moverCarrossel(1), 5000);
}

/* ===== Simulação de login ===== */
function aplicarEstadoLogin() {
    // Apenas inverti a lógica para bater com os IDs confusos do HTML
    const headerComPerfil = document.getElementById('secao-header'); // Onde está o João Silva
    const headerComBotaoEntrar = document.getElementById('secao-header-logado'); // Onde está o Entrar/Cadastrar
    
    const logado = localStorage.getItem('vm_logado') === 'true';

    if (logado) {
        // Se está logado, mostra o perfil e esconde o botão de entrar
        headerComPerfil.style.display = ''; 
        headerComBotaoEntrar.style.display = 'none';
        
        // Atualiza o nome no header se tiver dados salvos
        const usuarioString = localStorage.getItem('vm_usuario');
        if (usuarioString) {
            const usuario = JSON.parse(usuarioString);
            const nome = usuario.nome || usuario.Nome || 'Usuário';
            document.querySelectorAll('.user-nome').forEach(el => el.textContent = nome);
        }
    } else {
        // Se NÃO está logado, mostra o botão de entrar e esconde o perfil
        headerComPerfil.style.display = 'none';
        headerComBotaoEntrar.style.display = '';
    }
}

// function simularLogin() {
//     localStorage.setItem('vm_logado', 'true');
//     aplicarEstadoLogin();
// }

function simularLogout() {
    localStorage.removeItem('vm_logado');
    localStorage.removeItem('vm_usuario');
    aplicarEstadoLogin();
    carregarPagina('cardapio');
}

/* ===== Menu dropdown do usuário logado =====
   Funciona tanto no desktop quanto no mobile (dois elementos separados). */
function toggleUserMenu(e) {
    e.stopPropagation();
    const drop = e.currentTarget.closest('.user-dropdown');
    if (!drop) return;
    // Fecha outros dropdowns antes de abrir o atual
    document.querySelectorAll('.user-dropdown.aberto').forEach(d => {
        if (d !== drop) d.classList.remove('aberto');
    });
    drop.classList.toggle('aberto');
}

function fecharUserMenu() {
    document.querySelectorAll('.user-dropdown').forEach(d => d.classList.remove('aberto'));
}

/* ===== Menu hamburguer (mobile ≤ 900px) =====
   Abre um dropdown posicionado — igual ao dropdown do usuário. */
function toggleMenuMobile(botao) {
    const wrapper = botao.closest('.hamburger-dropdown-wrapper');
    if (!wrapper) return;
    // Fecha dropdowns de usuário ao abrir o hamburguer
    fecharUserMenu();
    botao.classList.toggle('aberto');
    wrapper.classList.toggle('aberto');
}

function fecharMenuMobile() {
    document.querySelectorAll('.btn-hamburguer.aberto').forEach(b => b.classList.remove('aberto'));
    document.querySelectorAll('.hamburger-dropdown-wrapper.aberto').forEach(w => w.classList.remove('aberto'));
}

/* Fecha qualquer dropdown aberto ao clicar fora */
document.addEventListener('click', (e) => {
    document.querySelectorAll('.user-dropdown').forEach(drop => {
        if (!drop.contains(e.target)) drop.classList.remove('aberto');
    });
    document.querySelectorAll('.hamburger-dropdown-wrapper').forEach(wrapper => {
        if (!wrapper.contains(e.target)) {
            wrapper.classList.remove('aberto');
            const btn = wrapper.querySelector('.btn-hamburguer');
            if (btn) btn.classList.remove('aberto');
        }
    });
});

document.addEventListener('submit', function(e) {
    // Verifica se é o formulário de cadastrar receita
     if (e.target.id === 'formCadastrarReceita') {
        e.preventDefault();
        enviarReceita(e.target);
        return;
    }
    // Verifica se é o formulário de cadastrar motoboy
    if (e.target.id === 'formCadastrarMotoboy') {
        e.preventDefault();
        enviarMotoboy(e.target);
        return;
    }
    // Verifica se é o formulário de finalizar compra
    if (e.target.id === 'formFinalCompra') {
        e.preventDefault();
        finalizarCompra(e.target);
        return;
    }
    //console.log("Evento submit detectado no formulário:", e.target.id)
    // Verifica se é o formulário de cadastrar cliente
    if (e.target.id === 'formCadastrarCliente') {
        e.preventDefault(); // Evita que a página recarregue

        if (!validarFormCadCliente()) return;

        // Captura os dados do formulário HTML
        const formData = new FormData(e.target);

        // Monta o objeto JSON garantindo que as chaves batam com as propriedades do C#
        const dadosUsuario = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            senha: formData.get('senha'),
            dataNascimento: formData.get('dataNascimento'),
            cep: formData.get('cep'),
            endereco: formData.get('endereco'),
            cidade: formData.get('cidade'),
            bairro: formData.get('bairro'),
            numero: formData.get('numero'),
            complemento: formData.get('complemento'),
            telefone: formData.get('telefone')
        };

        const idEdicao = localStorage.getItem('vm_usuario_edicao');
        const url = idEdicao ? `http://localhost:5147/api/usuario/${idEdicao}` : 'http://localhost:5147/api/usuario';
        const metodo = idEdicao ? 'PUT' : 'POST';

        // Dispara para a API
        fetch(url, { 
            method: metodo,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dadosUsuario)
        })
        .then(response => {
            if (response.ok) {
                alert(idEdicao ? 'Dados atualizados com sucesso!' : 'Cliente cadastrado com sucesso!');
                carregarPagina('login'); // Redireciona para o login
            
                if (idEdicao) {
                    localStorage.setItem('vm_usuario', JSON.stringify(dadosUsuario));
                    localStorage.removeItem('vm_usuario_edicao');
                    preencherDadosConta();
                    carregarPagina('conta');
                } else {
                    carregarPagina('login');
                }
            } else {
                alert('Erro salvar dados. Verifique o console');
                console.error('Status:', response.status);
            }
        })
        .catch(erro => console.error('Erro: ', erro));
    }

    // Verifica se é o formulário de login
    if (e.target.id === 'formLogin') {
        e.preventDefault();

        const formData = new FormData(e.target);
        const dadosLogin = {
            email: formData.get('Email'),
            senha: formData.get('Senha')
        };

        fetch('http://localhost:5147/api/usuario/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosLogin)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('E-mail ou senha incorretos');
            }
        })
        .then(usuario => {
            localStorage.setItem('vm_logado', 'true');
            localStorage.setItem('vm_usuario', JSON.stringify(usuario));

            console.log("Login realizado com sucesso. Redirecionando...");

            // Se for o administrador, redireciona para a página de admin
            if (usuario.email === 'administrador@gmail.com') {
                carregarPagina('admin');
            } else {
                carregarPagina('cardapio');
            }
        })
        .catch(erro => {
            alert(erro.message);
            console.error('Erro no login:', erro);
        });
    }
});

function mostrarTermos() {
    carregarPagina('cardapio');
    setTimeout(() => {
        const termos = document.getElementById('termos-de-uso');
        if (termos) termos.scrollIntoView({ behavior: 'smooth' });
    }, 400);
}

function fazerLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const dadosLogin = Object.fromEntries(formData.entries());

    fetch('http://localhost:5147/api/usuario/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosLogin)
    })
    .then(async response => {
        if (response.ok) {
            const usuario = await response.json();
            
            // Salva os dados reais do banco no navegador
            localStorage.setItem('vm_usuario', JSON.stringify(usuario));
            localStorage.setItem('vm_logado', 'true');

            // Direciona o Admin pro painel, e o Cliente pra vitrine
            if (usuario.email === 'administrador@gmail.com' || usuario.Email === 'administrador@gmail.com') {
                carregarPagina('admin');
            } else {
                carregarPagina('cardapio');
            }
            aplicarEstadoLogin();
        } else {
            alert('E-mail ou senha incorretos.');
        }
    })
    .catch(erro => console.error('Erro no login:', erro));
}

function fazerLogout() {
    localStorage.clear();
    sessionStorage.clear();

    window.location.href = 'index.html';
}

function preencherDadosConta() {
    const usuarioString = localStorage.getItem('vm_usuario');
    if (!usuarioString) return;

    const usuario = JSON.parse(usuarioString);
    
    // Suporta tanto letra maiúscula quanto minúscula que vier do C#
    const nome = usuario.nome || usuario.Nome || 'Usuário';
    const email = usuario.email || usuario.Email;
    
    document.getElementById('info-nome-header').textContent = nome;
    document.getElementById('info-email-header').textContent = email;
    document.getElementById('info-nome').textContent = nome;
    document.getElementById('info-email').textContent = email;
    document.getElementById('info-telefone').textContent = usuario.telefone || usuario.Telefone || 'Não informado';
    document.getElementById('info-dataNascimento').textContent = usuario.dataNascimento || usuario.DataNascimento || 'Não informado';
    document.getElementById('info-cep').textContent = usuario.cep || usuario.Cep || 'Não informado';
    document.getElementById('info-endereco').textContent = usuario.endereco || usuario.Endereco || 'Não informado';
    document.getElementById('info-cidade').textContent = usuario.cidade || usuario.Cidade || 'Não informado';
    document.getElementById('info-bairro').textContent = usuario.bairro || usuario.Bairro || 'Não informado';
    document.getElementById('info-numero').textContent = usuario.numero || usuario.Numero || 'Não informado';
    document.getElementById('info-complemento').textContent = usuario.complemento || usuario.Complemento || 'Não informado';

    document.getElementById('info-avatar').textContent = nome.substring(0, 2).toUpperCase();
}

function logoutAdmin() {
    localStorage.removeItem('vm_logado');
    localStorage.removeItem('vm_usuario');

    aplicarEstadoLogin();

    carregarPagina('cadastrarCliente');
}

async function gerarRelatorio() {
    try {
        const res = await fetch('http://localhost:5147/api/carro');
        const receitas = await res.json();

        if (receitas.length === 0) {
            alert("Não há receitas cadastradas para gerar relatório.");
            return;
        }

        let csv = "ID | Nome | Descricao | Ingredientes | Preco\n";

        receitas.forEach(receita => {
            csv += `${receita.id || receita.Id} | "${receita.nome || receita.Nome}" | "${receita.descricao || receita.Descricao}" | "${receita.ingredientes || receita.Ingredientes}" | ${receita.preco || receita.Preco}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;'});
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "relatorio_receitas.csv");
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        alert("Erro ao gerar relatório. Confira o terminal para mais detalhes.");
    }
}

async function deletarConta() {
    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));
    if (!usuarioLogado) return;

    const confirmacao = confirm("Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.");

    if (confirmacao) {
        try {
            const id = usuarioLogado.id || usuarioLogado.Id;

            const res = await fetch(`http://localhost:5147/api/usuario/${id}`, {method: 'DELETE'});

            if (res.ok) {
                alert("Conta excluída com sucesso.");
                simularLogout();
            } else {
                alert("Erro ao excluir conta. Verifique o console para detalhes.");
                console.error("Status da resposta:", res.status);
            }
        } catch (error) {
            console.error("Erro ao excluir conta: ", error);
        }
    }

}

function prepararEdicaoConta() {
    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));
    if (!usuarioLogado) return;

    const senhaAtual = usuarioLogado.senha || usuarioLogado.Senha;

    const senhaDigitada = prompt("Antes de editar seus dados, digite sua SENHA para prosseguir: ");

    if (senhaDigitada === senhaAtual) {
        localStorage.setItem('vm_usuario_edicao', usuarioLogado.id || usuarioLogado.Id);
        carregarPagina('cadastrarCliente');
    } else {
        alert("Senha incorreta. Acesso negado.");
    }
}

function preencherFormularioEdicaoConta() {
    const idEdicao = localStorage.getItem('vm_usuario_edicao');
    if (!idEdicao) return;

    const usuarioLogado = JSON.parse(localStorage.getItem('vm_usuario'));
    const form = document.getElementById('formCadastrarCliente');
    if (!form || !usuarioLogado) return;

    const btnSubmit = form.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.textContent = 'Salvar Dados';

    const preencher = (nomeCampo, valor) => {
        const input = form.querySelector(`[name="${nomeCampo}"]`);
        if (input) input.value = valor || '';
    }

    preencher('nome', usuarioLogado.nome || usuarioLogado.Nome);
    preencher('email', usuarioLogado.email || usuarioLogado.Email);
    preencher('dataNascimento', usuarioLogado.dataNascimento || usuarioLogado.DataNascimento);
    preencher('cep', usuarioLogado.cep || usuarioLogado.Cep);
    preencher('endereco', usuarioLogado.endereco || usuarioLogado.Endereco);
    preencher('cidade', usuarioLogado.cidade || usuarioLogado.Cidade);
    preencher('bairro', usuarioLogado.bairro || usuarioLogado.Bairro);
    preencher('numero', usuarioLogado.numero || usuarioLogado.Numero);
    preencher('complemento', usuarioLogado.complemento || usuarioLogado.Complemento);
    preencher('telefone', usuarioLogado.telefone || usuarioLogado.Telefone);
}

// ===== Validação do Cadastro de Receita =====

function _validNomeReceita(v) {
    v = v.trim();
    if (!v) return 'Nome é obrigatório';
    if (v.length < 3) return 'Mínimo 3 caracteres';
    if (v.length > 100) return 'Máximo 100 caracteres';
    return '';
}

function _validPreco(v) {
    v = v.trim();
    if (!v) return 'Preço é obrigatório';
    if (parseFloat(v) <= 0) return 'Digite um valor válido';
    if (v.length > 10) return 'Máximo 10 caracteres';
    return '';
}

function _validDescricao(v) {
    v = v.trim();
    if (!v) return 'Descrição é obrigatória';
    if (v.length < 10) return 'Mínimo 10 caracteres';
    return '';
}

function _validIngredientes(v) {
    v = v.trim();
    if (!v) return 'Ingredientes são obrigatórios';
    if (v.length < 5) return 'Mínimo 5 caracteres';
    return '';
}

function _validFotoReceita(id) {
    if (localStorage.getItem('vm_receita_edicao')) return '';
    const input = document.getElementById(id);
    if (!input || !input.files || !input.files[0]) return 'Foto obrigatória';
    return '';
}

function _mostrarErroCadReceita(id, msg) {
    const span = document.getElementById('erro-' + id);
    const input = document.getElementById(id);
    if (!span || !input) return;
    span.textContent = msg;
    if (input.type === 'file') {
        const label = document.querySelector(`label[for="${id}"]`);
        if (label) label.classList.toggle('upload-erro-cad-receita', !!msg);
    } else {
        input.classList.toggle('input-erro-cad-receita', !!msg);
    }
}

function validarFormCadReceita() {
    const campos = [
        { id: 'nome',         fn: _validNomeReceita },
        { id: 'descricao',    fn: _validDescricao },
        { id: 'ingredientes', fn: _validIngredientes },
        { id: 'preco',        fn: _validPreco },
    ];
    let valido = true;
    campos.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        const msg = fn(el ? el.value : '');
        _mostrarErroCadReceita(id, msg);
        if (msg) valido = false;
    });

    const msgFoto = _validFotoReceita('foto');
    _mostrarErroCadReceita('foto', msgFoto);
    if (msgFoto) valido = false;

    return valido;
}

// Valida campo ao sair (focusout borbulha, blur não)
document.addEventListener('focusout', function(e) {
    if (!document.getElementById('formCadastrarReceita')) return;
    const mapa = {
        nome: _validNomeReceita,
        descricao: _validDescricao,
        ingredientes: _validIngredientes,
        preco: _validPreco,
    };
    const id = e.target?.id;
    if (mapa[id]) _mostrarErroCadReceita(id, mapa[id](e.target.value));
});

// Preview + validação de tipo ao selecionar foto
document.addEventListener('change', function(e) {
    if (!document.getElementById('formCadastrarReceita')) return;
    if (e.target?.id !== 'foto') return;

    const input = e.target;
    const file = input.files[0];
    const label = document.querySelector(`label[for="${input.id}"]`);
    const preview = document.getElementById('preview-' + input.id);
    const placeholder = label?.querySelector('.upload-placeholder-cad-receita');

    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
        _mostrarErroCadReceita(input.id, 'Apenas .jpg e .png são aceitos');
        input.value = '';
        return;
    }

    _mostrarErroCadReceita(input.id, '');

    const reader = new FileReader();
    reader.onload = function(ev) {
        if (preview) {
            preview.src = ev.target.result;
            preview.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (label) label.classList.remove('upload-erro-cad-receita');
    };
    reader.readAsDataURL(file);
});

// ===== Validação do Cadastro de Cliente =====

function _validNome(v) {
    v = v.trim();
    if (!v) return 'Nome é obrigatório';
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(v)) return 'Use apenas letras';
    if (v.length < 8) return 'Mínimo 8 caracteres';
    if (v.length > 255) return 'Máximo 255 caracteres';
    return '';
}

function _validTelefone(v) {
    v = v.trim();
    if (!v) return 'Telefone é obrigatório';
    if (!/^\d+$/.test(v)) return 'Use apenas números, sem parênteses ou traços';
    if (v.length !== 11) return 'Telefone deve ter exatamente 11 dígitos';
    return '';
}

function _validEmail(v) {
    v = v.trim();
    if (!v) return 'E-mail é obrigatório';
    if (v.length < 10) return 'Mínimo 10 caracteres';
    if (v.length > 255) return 'Máximo 255 caracteres';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'E-mail inválido';
    return '';
}

function _validSenha(v) {
    if (!v) return 'Senha é obrigatória';
    if (v.length < 8) return 'Mínimo 8 caracteres';
    return '';
}

function _validCidade(v) {
    v = v.trim();
    if (!v) return 'Cidade é obrigatória';
    if (v.length < 5) return 'Mínimo 5 caracteres';
    if (v.length > 50) return 'Máximo 50 caracteres';
    return '';
}

function _mostrarErroCad(id, msg) {
    const span = document.getElementById('erro-' + id);
    const input = document.getElementById(id);
    if (!span || !input) return;
    span.textContent = msg;
    input.classList.toggle('input-erro-cad', !!msg);
}

// ===== Validação do Cadastro de Motoboy =====

function _validDataNascimento(v) {
    v = v.trim();
    if (!v) return 'Data de nascimento é obrigatória';
    return '';
}

function _validCep(v) {
    v = v.trim();
    if (!v) return 'CEP é obrigatório';
    if (!/^\d+$/.test(v)) return 'Use apenas números';
    if (v.length !== 8) return 'CEP deve ter exatamente 8 dígitos';
    return '';
}

function _validEndereco(v) {
    v = v.trim();
    if (!v) return 'Endereço é obrigatório';
    if (v.length < 5) return 'Mínimo 5 caracteres';
    return '';
}

function _validBairro(v) {
    v = v.trim();
    if (!v) return 'Bairro é obrigatório';
    return '';
}

function _validNumero(v) {
    v = v.trim();
    if (!v) return 'Número é obrigatório';
    return '';
}

function validarFormCadMotoboy() {
    const campos = [
        { id: 'nome',            fn: _validNome },
        { id: 'email',           fn: _validEmail },
        { id: 'senha',           fn: _validSenha },
        { id: 'dataNascimento',  fn: _validDataNascimento },
        { id: 'cep',             fn: _validCep },
        { id: 'endereco',        fn: _validEndereco },
        { id: 'cidade',          fn: _validCidade },
        { id: 'bairro',          fn: _validBairro },
        { id: 'numero',          fn: _validNumero },
        { id: 'telefone',        fn: _validTelefone },
    ];
    let valido = true;
    campos.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        const msg = fn(el ? el.value : '');
        _mostrarErroCad(id, msg);
        if (msg) valido = false;
    });
    return valido;
}

// Valida campo ao sair dele (focusout borbulha, blur não)
document.addEventListener('focusout', function(e) {
    if (!document.getElementById('formCadastrarMotoboy')) return;
    const mapa = {
        nome:           _validNome,
        email:          _validEmail,
        senha:          _validSenha,
        dataNascimento: _validDataNascimento,
        cep:            _validCep,
        endereco:       _validEndereco,
        cidade:         _validCidade,
        bairro:         _validBairro,
        numero:         _validNumero,
        telefone:       _validTelefone,
    };
    const id = e.target?.id;
    if (mapa[id]) _mostrarErroCad(id, mapa[id](e.target.value));
});

// Filtra caracteres inválidos durante a digitação (CEP e telefone só números)
document.addEventListener('input', function(e) {
    if (!document.getElementById('formCadastrarMotoboy')) return;
    const id = e.target?.id;
    if (id === 'cep' || id === 'telefone') {
        const limpo = e.target.value.replace(/\D/g, '');
        if (limpo !== e.target.value) e.target.value = limpo;
    }
});

function validarFormCadCliente() {
    const campos = [
        { id: 'nome',           fn: _validNome },
        { id: 'email',          fn: _validEmail },
        { id: 'senha',          fn: _validSenha },
        { id: 'dataNascimento', fn: _validDataNascimento },
        { id: 'cep',            fn: _validCep },
        { id: 'endereco',       fn: _validEndereco },
        { id: 'cidade',         fn: _validCidade },
        { id: 'bairro',         fn: _validBairro },
        { id: 'numero',         fn: _validNumero },
        { id: 'telefone',       fn: _validTelefone },
    ];
    let valido = true;
    campos.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        const msg = fn(el ? el.value : '');
        _mostrarErroCad(id, msg);
        if (msg) valido = false;
    });
    return valido;
}

// Valida campo ao sair dele (focusout borbulha, blur não)
document.addEventListener('focusout', function(e) {
    if (!document.getElementById('formCadastrarCliente')) return;
    const mapa = {
        nome: _validNome,
        email: _validEmail,
        senha: _validSenha,
        dataNascimento: _validDataNascimento,
        cep: _validCep,
        endereco: _validEndereco,
        cidade: _validCidade,
        bairro: _validBairro,
        numero: _validNumero,
        telefone: _validTelefone,
    };
    const id = e.target?.id;
    if (mapa[id]) _mostrarErroCad(id, mapa[id](e.target.value));
});

// Filtra caracteres inválidos durante a digitação
document.addEventListener('input', function(e) {
    if (!document.getElementById('formCadastrarCliente')) return;
    const id = e.target?.id;
    if (id === 'nome') {
        const limpo = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
        if (limpo !== e.target.value) e.target.value = limpo;
    }
    if (id === 'cep' || id === 'telefone') {
        const limpo = e.target.value.replace(/\D/g, '');
        if (limpo !== e.target.value) e.target.value = limpo;
    }
});

window.addEventListener('unload', function() {
    const usuarioString = localStorage.getItem('vm_usuario');

    if (usuarioString) {
        const usuario = JSON.parse(usuarioString);

        if (usuario.email === 'administrador@gmail.com' || usuario.Email === 'administrador@gmail.com') {
            localStorage.removeItem('vm_logado');
            localStorage.removeItem('vm_usuario');    
        }
    }
})

aplicarEstadoLogin();
carregarPagina('cardapio');
