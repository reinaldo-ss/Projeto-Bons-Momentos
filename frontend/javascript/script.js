/* =====================================================
   Roteamento da SPA
   ===================================================== */

const API_URL = 'http://localhost:5041/api';

// Páginas que vivem dentro de subpastas de view/ (admin/, cozinha/)
const PAGINAS_EM_SUBPASTA = {
    admin: 'admin/admin',
    motoboys: 'admin/motoboys',
    historicoPedidos: 'admin/historicoPedidos',
    cadastrarReceita: 'admin/cadastrarReceita',
    cadastrarMotoBoys: 'admin/cadastrarMotoBoys',
    cozinha: 'cozinha/cozinha',
    historicoPedidosCozinha: 'cozinha/historicoPedidosCozinha',
    enviarPedido: 'cozinha/enviarPedido'
};

function carregarPagina(pagina) {
    const caminho = PAGINAS_EM_SUBPASTA[pagina] || pagina;

    fetch(`view/${caminho}.html`)
        .then(res => res.text())
        .then(html => {
            document.getElementById('conteudo').innerHTML = html;

            const header = document.getElementById('secao-header');
            const headerLogado = document.getElementById('secao-header-logado');
            const footer = document.getElementById('secao-footer');

            // Rola para o topo sempre que trocar de página
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (pagina === 'cadastrarCliente' || pagina === 'login' || pagina === 'cadastrarReceita' || pagina === 'admin' || pagina === 'motoboys' || pagina === 'historicoPedidos' || pagina === 'cadastrarMotoBoys' || pagina === 'cozinha' || pagina === 'historicoPedidosCozinha' || pagina === 'enviarPedido') {
                header.style.display = 'none';
                if (headerLogado) headerLogado.style.display = 'none';
                footer.style.display = 'none';
            } else {
                aplicarEstadoLogin();
                footer.style.display = '';
            }

            // GATILHOS DAS PÁGINAS (apenas UI/estado local — sem chamadas à API)
            if (pagina === 'cardapio') {
                inicializarCarrossel();
                carregarReceitas();
            } else if (pagina === 'conta') {
                preencherDadosConta();
            } else if (pagina === 'cadastrarCliente') {
                preencherFormularioEdicaoConta();
            } else if (pagina === 'finalCompra') {
                carregarDadosFinalCompra();
            } else if (pagina === 'historicoPedidoCliente') {
                carregarHistoricoCliente();
            } else if (pagina === 'historicoPedidoCliente') {
                carregarHistoricoCliente();
            } else if (pagina === 'cozinha') {
                carregarPainelCozinha();
            } else if (pagina === 'historicoPedidosCozinha') {
                carregarPainelHistorico();
            } else if (pagina === 'enviarPedido') {
                carregarEnviarPedido();
            } else if (pagina === 'admin') {
                carregarPainelAdmin();
            } else if (pagina === 'motoboys') {
                carregarPainelMotoboys();
            } else if (pagina === 'historicoPedidos') {
                carregarPainelHistorico();
            };
        });
}

/* ===== Carrossel (Cardápio) ===== */
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

/* ===== Simulação de login (estado local, sem API) ===== */
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
        if (headerComPerfil) headerComPerfil.style.display = 'none';
        if (headerComBotaoEntrar) headerComBotaoEntrar.style.display = '';
    }
}

function carregarPainelCozinha() {
    // Atribuindo os IDs de cada coluna as variáveis
    const colFazer = document.getElementById('cz-coluna-fazer');
    const colFazendo = document.getElementById('cz-coluna-fazendo');
    const colEntrega = document.getElementById('cz-coluna-entrega');

    // Trava de segurança
    if (!colFazer || !colFazendo || !colEntrega) return;

    // Texto de carregamento
    colFazer.innerHTML = '<p style="text-align:center;">Buscando...</p>';
    colFazendo.innerHTML = '<p style="text-align:center;">Buscando...</p>';
    colEntrega.innerHTML = '<p style="text-align:center;">Buscando...</p>';

    // Fazendo a requisição ao endpoint de pedidos da API
    fetch(`${API_URL}/Pedidos`)
        .then(res => res.json())
        .then(pedidos => {
            pedidosCozinhaMemoria = pedidos; 
            
            colFazer.innerHTML = '';
            colFazendo.innerHTML = '';
            colEntrega.innerHTML = '';

            // Filtra pedidos que devem aparecer na cozinha
            const pedidosAtivos = pedidos.filter(p => {
                const st = (p.status || p.Status).toLowerCase();
                return st !== 'entregue' && st !== 'cancelado';
            });

            pedidosAtivos.forEach(pedido => {
                const id = pedido.id || pedido.Id;
                const status = (pedido.status || pedido.Status).toLowerCase();
                const obs = pedido.observacao || pedido.Observacao || '-';
                const pag = pedido.opcaoPagamento || pedido.OpcaoPagamento || '-';
                const nomeReceita = pedido.receita?.nome || pedido.Receita?.Nome || `Receita #${pedido.idReceita || pedido.IdReceita}`;

                const divCard = document.createElement('div');
                divCard.className = 'cz-card-pedido';
                
                let htmlBotoes = '';

                // Define os botões com base na coluna (status)
                if (status === 'pendente') {
                    htmlBotoes = `
                        <button class="cz-btn-cancelar" onclick="atualizarStatusCozinha(${id}, 'Cancelado')">Cancelar</button>
                        <button class="cz-btn-aceitar" onclick="atualizarStatusCozinha(${id}, 'Em Preparo')">Aceitar</button>
                    `;
                } else if (status === 'em preparo') {
                    htmlBotoes = `
                        <button class="cz-btn-concluir" onclick="atualizarStatusCozinha(${id}, 'Pronto')">Concluir</button>
                    `;
                } else if (status === 'pronto') {
                    htmlBotoes = `
                        <button class="cz-btn-motoboy" onclick="prepararDespacho(${id})">Escolher motoboy</button>
                    `;
                }

                divCard.innerHTML = `
                    <p class="cz-card-titulo">Pedido #${id} — ${nomeReceita}</p>
                    <p class="cz-card-info"><strong>Observação:</strong> ${obs}</p>
                    <p class="cz-card-info"><strong>Pagamento:</strong> ${pag}</p>
                    <div class="cz-card-acoes">${htmlBotoes}</div>
                `;

                // Distribui nas colunas do Kanban
                if (status === 'pendente') colFazer.appendChild(divCard);
                else if (status === 'em preparo') colFazendo.appendChild(divCard);
                else if (status === 'pronto') colEntrega.appendChild(divCard);
            });
        })
        .catch(erro => console.error('Erro ao carregar Kanban:', erro));
};

function atualizarStatusCozinha(id, novoStatus) {
    // Resgata o pedido completo da memória
    // const pedido = pedidosCozinhaMemoria.find(p => (p.id || p.Id) === id);
    // if (!pedido) return;

    // Montando o objeto apenas com os dados que precisamos
    const payload = {
        id: id,
        status: novoStatus
    };
    
    // Atualiza a string do status lidando com PascalCase ou camelCase
    if (payload.status !== undefined) payload.status = novoStatus;
    if (payload.Status !== undefined) payload.Status = novoStatus;

    // Remove os objetos aninhados para o C# não tentar recriá-los no banco e dar conflito
    delete payload.receita; delete payload.Receita;
    delete payload.usuario; delete payload.Usuario;

    fetch(`${API_URL}/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async (res) => {
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.mensagem || 'Falha ao atualizar o C#');
        };

        carregarPainelCozinha(); // Recarrega os cards automaticamente nas colunas certas
    })
    .catch(erro => alert(`Erro: ${erro.message}`));
};

function prepararDespacho(id) {
    // Salva qual pedido a cozinha quer enviar e joga para a tela do Motoboy
    localStorage.setItem('vm_pedido_despacho', id);
    carregarPagina('enviarPedido');
};

function carregarEnviarPedido() {
    const pedidoId = localStorage.getItem('vm_pedido_despacho');

    if (!pedidoId) return carregarPagina('cozinha');

    // Resgata o pedido que já estava na memória do Kanban
    const pedido = pedidosCozinhaMemoria.find(p => (p.id || p.Id) == pedidoId);
    if (!pedido) return;

    // Preenche dados básicos
    document.getElementById('ep-val-pedido').textContent = `#${pedido.id || pedido.Id}`;
    document.getElementById('ep-val-pagamento').textContent = pedido.opcaoPagamento || pedido.OpcaoPagamento;
    document.getElementById('ep-val-endereco').textContent = pedido.enderecoEntrega || pedido.EnderecoEntrega;

    // Busca o cliente pelo ID para exibir nome, telefone e CEP
    const idUsuario = pedido.idUsuario || pedido.IdUsuario;
    fetch(`${API_URL}/Usuarios/${idUsuario}`)
        .then(res => res.json())
        .then(usuario => {
            document.getElementById('ep-val-cliente').textContent = usuario.nome || usuario.Nome;
            document.getElementById('ep-val-telefone').textContent = usuario.telefone || usuario.Telefone;
            document.getElementById('ep-val-cep').textContent = usuario.cep || usuario.Cep;
        }).catch(() => console.warn('Falha ao carregar dados do cliente'));

    // Busca motoboys e preenche o dropdown
    const selectMotoboy = document.getElementById('ep-select-motoboy');
    selectMotoboy.innerHTML = '<option value="">Carregando motoboys...</option>';
    
    fetch(`${API_URL}/Motoboys`)
        .then(res => res.json())
        .then(motoboys => {
            selectMotoboy.innerHTML = '<option value="">Selecione um motoboy</option>';
            motoboys.forEach(m => {
                selectMotoboy.innerHTML += `<option value="${m.id || m.Id}">${m.nome || m.Nome} - ${m.telefone || m.Telefone}</option>`;
            });
        }).catch(() => selectMotoboy.innerHTML = '<option value="">Erro ao buscar motoboys</option>');
};

function despacharPedido() {
    const pedidoId = localStorage.getItem('vm_pedido_despacho');
    const idMotoboy = document.getElementById('ep-select-motoboy').value;

    if (!idMotoboy) {
        alert("Selecione um motoboy antes de enviar!");
        return;
    }

    // Avança o status. Como combinamos, não mexemos mais depois daqui pelo front
    const payload = {
        id: parseInt(pedidoId),
        status: 'Saiu para entrega',
        idMotoboy: parseInt(idMotoboy)
    };

    fetch(`${API_URL}/Pedidos/${pedidoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(async (res) => {
        if (!res.ok) throw new Error('Falha ao despachar pedido');
        alert('Pedido enviado para entrega com sucesso!');
        localStorage.removeItem('vm_pedido_despacho');
        carregarPagina('cozinha'); // Retorna ao Kanban
    })
    .catch(erro => alert(`Erro: ${erro.message}`));
};

function carregarHistoricoCliente() {
    const lista = document.getElementById('lista-pedidos-cliente');
    const usuarioString = localStorage.getItem('vm_usuario');

    if (!lista) return;

    // Verificando se o usuário está logado e caso não o orientando a logar
    if (!usuarioString) {
        lista.innerHTML = '<p style="text-align: center;">Você precisa estar logado para ver seus pedidos.</p>';
        return;
    }

    const usuario = JSON.parse(usuarioString);
    const usuarioId = usuario.id || usuario.Id;

    lista.innerHTML = '<p style="text-align: center;">Carregando seus pedidos...</p>';

    // requisição ao endpoint de pedidos da API
    fetch(`${API_URL}/Pedidos`)
        .then(res => {
            if (!res.ok) throw new Error('Falha ao buscar pedidos');
            return res.json();
        })
        .then(pedidos => {
            // Filtra os pedidos para mostrar apenas os do cliente logado
            const meusPedidos = pedidos.filter(p => (p.idUsuario || p.IdUsuario) === usuarioId);

            lista.innerHTML = '';

            if (meusPedidos.length === 0) {
                lista.innerHTML = '<p style="text-align: center;">Você ainda não possui pedidos em nosso histórico.</p>';
                return;
            }

            // Inverte o array para mostrar os mais recentes primeiro
            meusPedidos.reverse().forEach(pedido => {

                // puxando os dados e os tratando para ficarem no formato desejado
                const precoFormatado = (pedido.valorTotal || pedido.ValorTotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const dataFormatada = new Date(pedido.dataPedido || pedido.DataPedido).toLocaleDateString('pt-BR');
                const status = pedido.status || pedido.Status || 'Pendente';
                const pagamento = pedido.opcaoPagamento || pedido.OpcaoPagamento || '-';
                
                // Define a classe CSS do status dinamicamente (pendente = amarelo, entregue = verde, etc)
                const classeStatus = status.toLowerCase() === 'pendente' ? 'status-pendente' : 'status-entregue';
                
                const nomeReceita = pedido.receita?.nome || pedido.Receita?.Nome || `Pedido #${pedido.id || pedido.Id}`;
                const fotoReceita = pedido.receita?.foto || pedido.Receita?.Foto || 'https://placehold.co/100x100?text=Bolo';

                // Montando os cards que serão mostrados na página pro cliente
                const divCard = document.createElement('div');
                divCard.className = 'pedido-cliente-card';
                divCard.innerHTML = `
                    <img class="pedido-cliente-foto" src="${fotoReceita}" alt="${nomeReceita}">
                    <div class="pedido-cliente-info">
                        <p class="pedido-cliente-nome">${nomeReceita}</p>
                        <p class="pedido-cliente-data">Pedido em ${dataFormatada}</p>
                        <p class="pedido-cliente-pagamento">${pagamento}</p>
                    </div>
                    <div class="pedido-cliente-status">
                        <span class="status-pill ${classeStatus}">${status}</span>
                        <p class="pedido-cliente-preco">${precoFormatado}</p>
                    </div>
                `;
                lista.appendChild(divCard);
            });
        })
        .catch(erro => {
            console.error('Erro no histórico:', erro);
            lista.innerHTML = '<p style="text-align: center; color: red;">Erro ao carregar seu histórico.</p>';
        });

}

function simularLogout() {
    localStorage.removeItem('vm_logado');
    localStorage.removeItem('vm_usuario');
    aplicarEstadoLogin();
    carregarPagina('cardapio');
}

function fazerLogout() {
    localStorage.clear();
    sessionStorage.clear();

    window.location.href = 'index.html';
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

function mostrarTermos() {
    carregarPagina('cardapio');
    setTimeout(() => {
        const termos = document.getElementById('termos-de-uso');
        if (termos) termos.scrollIntoView({ behavior: 'smooth' });
    }, 400);
}

/* ===== Conta do cliente (lê/preenche a partir do localStorage) ===== */
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

function excluirContaCliente() {
    const usuarioString = localStorage.getItem('vm_usuario');
    if (!usuarioString) return;

    const usuarioLogado = JSON.parse(usuarioString);
    const idUsuario = usuarioLogado.id || usuarioLogado.Id;
    const senhaAtual = usuarioLogado.senha || usuarioLogado.Senha;

    // Pede confirmação e senha por segurança (mesmo padrão do prepararEdicaoConta)
    const confirmar = confirm("Tem certeza que deseja excluir permanentemente a sua conta?");
    if (!confirmar) return;

    const senhaDigitada = prompt("Digite sua SENHA para confirmar a exclusão da conta:");
    if (senhaDigitada !== senhaAtual) {
        alert("Senha incorreta. A conta não foi excluída.");
        return;
    }

    fetch(`${API_URL}/Usuarios/${idUsuario}`, {
        method: 'DELETE'
    })
    .then(async (res) => {
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.mensagem || 'Não foi possível excluir a conta (verifique se há pedidos vinculados a este usuário).');
        }
        alert("Sua conta foi excluída com sucesso.");
        simularLogout(); // Limpa o localStorage, atualiza o header e volta para o cardápio
    })
    .catch(erro => {
        console.error('Erro ao excluir conta:', erro);
        alert(`Erro: ${erro.message}`);
    });
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

// ===== Validação do Cadastro de Motoboy =====

function _validCpf(v) {
    v = v.trim();
    if (!v) return 'CPF é obrigatório';
    if (!/^\d+$/.test(v)) return 'Use apenas números';
    if (v.length !== 11) return 'CPF deve ter 11 dígitos';
    return '';
}

function _validCnh(v) {
    v = v.trim();
    if (!v) return 'CNH é obrigatória';
    if (!/^\d+$/.test(v)) return 'Use apenas números';
    if (v.length !== 9) return 'CNH deve ter 9 dígitos';
    return '';
}

function _validPlaca(v) {
    v = v.trim();
    if (!v) return 'Placa é obrigatória';
    if (v.length < 7) return 'Placa inválida';
    return '';
}

function validarFormCadMotoboy() {
    const campos = [
        { id: 'nome',            fn: _validNome },
        { id: 'cpf',             fn: _validCpf },
        { id: 'telefone',        fn: _validTelefone },
        { id: 'cnh',             fn: _validCnh },
        { id: 'placa',           fn: _validPlaca },
        { id: 'senha',           fn: _validSenha }
    ];
    let valido = true;
    campos.forEach(({ id, fn }) => {
        const el = document.getElementById(id);
        const msg = fn(el ? el.value : '');
        _mostrarErroCad(id, msg);
        if (msg) valido = false;
    });
    return valido;
};

/* ===== Função de Carregamento da Vitrine (Cardápio) ===== */
function carregarReceitas() {

    console.log('[DEBUG] 1. Função carregarReceitas() iniciada.');

    // Localizando os elementos visuais
    const catalogo = document.getElementById('catalogo-receitas');
    const contador = document.getElementById('contador-receitas');
    if (!catalogo) {
        console.error('[DEBUG] X. Elemento "catalogo-receitas" NÃO encontrado no DOM! O script parou.');
        return;
    }

    console.log('[DEBUG] 2. DOM encontrado. Disparando fetch para a API...');
    catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Carregando cardápio...</p>';

    // Conectando com a rota da API que busca as receitas no banco
    fetch(`${API_URL}/Receitas`)
        .then(res => {
            console.log(`[DEBUG] 3. Resposta recebida da API. Status: ${res.status}`);
            if (!res.ok) throw new Error(`Falha ao buscar as receitas (Status: ${res.status})`);
            return res.json();
        })
        .then(receitas => {
            console.log('[DEBUG] 4. Dados convertidos para JSON:', receitas);

            if (contador) {
                contador.textContent = `${receitas.length} receita(s) encontrada(s)`;
            }

            catalogo.innerHTML = '';

            if (receitas.length === 0) {
                console.log('[DEBUG] 5. Array de receitas vazio.');
                catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">Nenhuma receita disponível no momento.</p>';
                return;
            }

            console.log(`[DEBUG] 6. Renderizando ${receitas.length} receitas no HTML...`);
            receitas.forEach(receita => {
                // Formata o valor numérico para a moeda local (R$)
                const precoFormatado = receita.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                // Fallback caso a receita venha sem foto do banco
                const srcImagem = receita.foto ? receita.foto : 'https://placehold.co/400x250?text=Sem+Foto';

                const divCard = document.createElement('div');
                divCard.className = 'card-receita';
                
                // Ao clicar, envia os dados para a função de transição
                divCard.onclick = () => selecionarReceita(receita.id, receita.nome, receita.preco, srcImagem);

                divCard.innerHTML = `
                    <div class="card-img">
                        <img src="${srcImagem}" alt="${receita.nome}" />
                    </div>
                    <div class="card-info">
                        <h3>${receita.nome}</h3>
                        <p class="card-ingredientes">${receita.ingredientes}</p>
                        <p class="card-preco">${precoFormatado}</p>
                    </div>
                `;
                catalogo.appendChild(divCard);
            });
            console.log('[DEBUG] 7. Renderização concluída com sucesso.');

        })
        .catch(erro => {
            console.error('[DEBUG] X. Erro capturado no catch:', erro);
            catalogo.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: red;">Erro ao carregar o cardápio. Tente novamente.</p>';
            if (contador) contador.textContent = '0 receitas encontradas';
        });
};

/* Função que salva os dados da receita no localStorage do navegador */
function selecionarReceita(id, nome, preco, foto) {
    console.log(`[DEBUG] Clicou na receita: ID=${id} | Nome=${nome} | Preço=${preco}`);

    const receitaSelecionada = {
        id: id,
        nome: nome,
        preco: preco,
        foto: foto
    };
    
    // Salva a receita selecionada na memória local do navegador
    localStorage.setItem('vm_pedido_atual', JSON.stringify(receitaSelecionada));
    console.log('[DEBUG] Salvo no localStorage. Roteando para finalCompra...');

    // Dispara a rota para a tela de finalizar compra
    carregarPagina('finalCompra');
};

/* ===== Carregamento da Tela de Finalizar Compra ===== */
/* ===== Carregamento da Tela de Finalizar Compra ===== */
function carregarDadosFinalCompra() {
    const pedidoString = localStorage.getItem('vm_pedido_atual');
    const usuarioString = localStorage.getItem('vm_usuario');
    const logado = localStorage.getItem('vm_logado') === 'true';

    // Se não há pedido armazenado em localStorage
    if (!pedidoString) {
        alert("Nenhuma receita selecionada.");
        carregarPagina('cardapio');
        return;
    }

    const pedido = JSON.parse(pedidoString);

    // 1. Preenche os dados da receita (funciona logado ou deslogado)
    const precoFormatado = pedido.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const imgEl = document.getElementById('compra-foto');
    if (imgEl) imgEl.src = pedido.foto;
    
    document.getElementById('compra-nome').textContent = pedido.nome;
    document.getElementById('compra-preco').textContent = precoFormatado;
    document.getElementById('compra-resumo-preco').textContent = precoFormatado;
    document.getElementById('compra-total').textContent = precoFormatado;

    // 2. Preenche o endereço apenas se o cliente estiver logado
    const enderecoEl = document.getElementById('compra-endereco-texto');
    if (logado && usuarioString) {
        const usuario = JSON.parse(usuarioString);
        const rua = usuario.endereco || usuario.Endereco || 'Endereço não informado';
        const num = usuario.numero || usuario.Numero || 'S/N';
        const bairro = usuario.bairro || usuario.Bairro || '';
        const cidade = usuario.cidade || usuario.Cidade || '';
        const cep = usuario.cep || usuario.Cep || '';
        
        enderecoEl.textContent = `${rua}, ${num} - ${bairro}, ${cidade} - CEP ${cep}`;
    } else if (enderecoEl) {
        enderecoEl.textContent = 'Faça login para carregar seu endereço de entrega';
    }
}

// Valida campo ao sair dele (focusout borbulha, blur não)
document.addEventListener('focusout', function(e) {
    if (!document.getElementById('formCadastrarMotoboy')) return;
    const mapa = {
        nome:           _validNome,
        cpf:            _validCpf,
        telefone:       _validTelefone,
        cnh:            _validCnh,
        placa:          _validPlaca,
        senha:          _validSenha
    };
    const id = e.target?.id;
    if (mapa[id]) _mostrarErroCad(id, mapa[id](e.target.value));
});

// Filtra caracteres inválidos durante a digitação para o form do Motoboy
document.addEventListener('input', function(e) {
    if (!document.getElementById('formCadastrarMotoboy')) return;
    const id = e.target?.id;
    
    // Garante que só números sejam digitados no CPF, CNH e Telefone
    if (id === 'cpf' || id === 'cnh' || id === 'telefone') {
        const limpo = e.target.value.replace(/\D/g, '');
        if (limpo !== e.target.value) e.target.value = limpo;
    }
    
    // Deixa a Placa sempre em maiúsculo automaticamente
    if (id === 'placa') {
        e.target.value = e.target.value.toUpperCase();
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
};

function carregarPainelHistorico() {
    const tbody = document.getElementById('corpo-tabela-pedidos');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Buscando histórico de pedidos...</td></tr>';

    fetch(`${API_URL}/Pedidos`)
        .then(res => res.json())
        .then(pedidos => {
            tbody.innerHTML = '';

            if (pedidos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum pedido encontrado.</td></tr>';
                return;
            }

            // Inverte para exibir os mais recentes no topo
            pedidos.reverse().forEach(pedido => {
                // Tenta pegar o nome do objeto aninhado. Se o Entity Framework não trouxer o Include, usa o ID
                const nomeCliente = pedido.usuario?.nome || pedido.Usuario?.Nome || `Cliente #${pedido.idUsuario || pedido.IdUsuario}`;
                const nomeReceita = pedido.receita?.nome || pedido.Receita?.Nome || `Receita #${pedido.idReceita || pedido.IdReceita}`;
                const observacao = pedido.observacao || pedido.Observacao || '-';
                const pagamento = pedido.opcaoPagamento || pedido.OpcaoPagamento || '-';
                const status = pedido.status || pedido.Status || 'Pendente';
                const dataFormatada = new Date(pedido.dataPedido || pedido.DataPedido).toLocaleDateString('pt-BR');

                let classeStatus = 'status-pendente';
                if (status.toLowerCase() === 'entregue') classeStatus = 'status-entregue';
                else if (status.toLowerCase() === 'saiu para entrega' || status.toLowerCase() === 'pronto') classeStatus = 'status-entregue'; // reaproveitando a cor verde/azul

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="tabela-texto-truncado" title="${nomeCliente}">${nomeCliente}</td>
                    <td class="tabela-texto-truncado" title="${nomeReceita}">${nomeReceita}</td>
                    <td class="tabela-texto-truncado" title="${observacao}">${observacao}</td>
                    <td>${pagamento}</td>
                    <td><span class="status-pill ${classeStatus}">${status}</span></td>
                    <td>${dataFormatada}</td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(erro => {
            console.error('Erro ao carregar histórico:', erro);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao buscar dados.</td></tr>';
        });
};

function carregarPainelAdmin() {
    const tbody = document.getElementById('corpo-tabela-admin');
    
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Buscando receitas...</td></tr>';

    fetch(`${API_URL}/Receitas`)
        .then(res => res.json())
        .then(receitas => {
            tbody.innerHTML = '';

            if (receitas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhuma receita cadastrada.</td></tr>';
                return;
            }

            receitas.forEach(receita => {
                const id = receita.id || receita.Id;
                const precoFormatado = (receita.preco || receita.Preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                const foto = receita.foto || receita.Foto || 'https://placehold.co/80x50?text=Sem+Foto';
                const nome = receita.nome || receita.Nome;
                const desc = receita.descricao || receita.Descricao;
                const ingr = receita.ingredientes || receita.Ingredientes;

                const tr = document.createElement('tr');
                tr.className = 'linha-receita-admin'; // Classe adicionada para facilitar o filtro
                tr.innerHTML = `
                    <td><img src="${foto}" class="tabela-img" alt="${nome}"></td>
                    <td class="nome-receita">${nome}</td>
                    <td class="tabela-texto-truncado desc-receita" title="${desc}">${desc}</td>
                    <td class="tabela-texto-truncado" title="${ingr}">${ingr}</td>
                    <td>${precoFormatado}</td>
                    <td class="col-acoes">
                        <button class="btn-deletar" onclick="deletarReceita(${id})">Deletar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(erro => {
            console.error('Erro ao carregar admin:', erro);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao buscar dados.</td></tr>';
        });
};

function deletarReceita(id) {
    if (!confirm("Tem certeza que deseja deletar esta receita do cardápio?")) return;

    fetch(`${API_URL}/Receitas/${id}`, {
        method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) throw new Error('Falha ao deletar no C#');
            alert('Receita deletada com sucesso!');
            carregarPainelAdmin(); // Recarrega a tabela atualizada
        })
        .catch(erro => alert(`Erro: ${erro.message}`));
};

function carregarPainelMotoboys() {
    const tbody = document.getElementById('corpo-tabela-motoboys');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Buscando motoboys...</td></tr>';

    fetch(`${API_URL}/Motoboys`)
        .then(res => res.json())
        .then(motoboys => {
            tbody.innerHTML = '';

            if (motoboys.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nenhum motoboy cadastrado.</td></tr>';
                return;
            }

            motoboys.forEach(motoboy => {
                const id = motoboy.id || motoboy.Id;
                const nome = motoboy.nome || motoboy.Nome;
                const cpf = motoboy.cpf || motoboy.Cpf;
                const telefone = motoboy.telefone || motoboy.Telefone;
                const cnh = motoboy.cnh || motoboy.Cnh;
                const placa = motoboy.placa || motoboy.Placa;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${nome}</td>
                    <td>${cpf}</td>
                    <td>${telefone}</td>
                    <td>${cnh}</td>
                    <td>${placa}</td>
                    <td class="col-acoes">
                        <button class="btn-deletar" onclick="deletarMotoboy(${id})">Deletar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(erro => {
            console.error('Erro ao carregar motoboys:', erro);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Erro ao buscar dados.</td></tr>';
        });
};

function deletarMotoboy(id) {
    if (!confirm("Tem certeza que deseja deletar este motoboy?")) return;

    fetch(`${API_URL}/Motoboys/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Falha ao deletar no C#');
            alert('Motoboy deletado com sucesso!');
            carregarPainelMotoboys();
        })
        .catch(erro => alert(`Erro: ${erro.message}`));
};

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

// ---------------------------------------------------------
// FILTRO DA BARRA DE PESQUISA (Escopo Global)
// ---------------------------------------------------------
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'input-buscar-receita') {
        const termo = e.target.value.toLowerCase();
        const linhas = document.querySelectorAll('.linha-receita-admin');

        linhas.forEach(linha => {
            const tdNome = linha.querySelector('.nome-receita');
            const tdDesc = linha.querySelector('.desc-receita');
            
            if (!tdNome || !tdDesc) return;
            
            const nome = tdNome.textContent.toLowerCase();
            const desc = tdDesc.textContent.toLowerCase();
            
            if (nome.includes(termo) || desc.includes(termo)) {
                linha.style.display = '';
            } else {
                linha.style.display = 'none';
            };
        });
    };
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

/* =====================================================
   Envio dos formulários
   Aqui rodamos apenas a validação de frontend (campos
   preenchidos, formatos corretos etc). O envio real dos
   dados para a API é responsabilidade de quem for
   implementar a integração com o backend.
   Edit: Eu mesmo, Henrique na área bb, e os dados são enviados
   daq msm
   ===================================================== */

function comprimirImagemBase64(file, maxWidth = 600, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Converte para JPEG comprimido (fica muito mais leve no banco)
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}


document.addEventListener('submit', function(e) {
    // log de teste
    console.log(`Evento de submit recebido. Nome do elemento que disparou: ${e.target.id}`);
    
    console.log(`valor do form: ${e.target.id}`);

    if (e.target.id === 'formCadastrarReceita') {
        e.preventDefault();

        const formValido = validarFormCadReceita();
        if (!formValido) {
            console.warn('Falha na validação do formulário de receita');
            return;
        }

        const form = e.target;
        const formData = new FormData(form);
        const inputFoto = document.getElementById('foto');
        const arquivoFoto = inputFoto.files[0];

        const dadosReceita = {
            nome: formData.get('nome'),
            descricao: formData.get('descricao'),
            ingredientes: formData.get('ingredientes'),
            preco: parseFloat(formData.get('preco')) || 0
        };

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit ? btnSubmit.textContent : '';

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Cadastrando...';
        }

        // Instanciando um conversor para Base64
        if (arquivoFoto) {
            comprimirImagemBase64(arquivoFoto)
                .then((base64String) => {
                    const dadosReceita = {
                        nome: formData.get('nome'),
                        descricao: formData.get('descricao'),
                        ingredientes: formData.get('ingredientes'),
                        preco: parseFloat(formData.get('preco')) || 0,
                        foto: base64String
                    };

                    return fetch(`${API_URL}/Receitas`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dadosReceita)
                    });
                })
                .then(async (res) => {
                    const resposta = await res.json().catch(() => null);
                    if (!res.ok) {
                        const mensagemErro = resposta?.mensagem || resposta?.title || 'Erro ao cadastrar a receita';
                        throw new Error(mensagemErro);
                    }
                    return resposta;
                })
                .then(() => {
                    alert('Receita cadastrada com sucesso!');
                    form.reset();
                    const preview = document.getElementById('preview-foto');
                    const placeholder = document.querySelector('.upload-placeholder-cad-receita');
                    if (preview) { preview.src = ''; preview.style.display = 'none'; }
                    if (placeholder) placeholder.style.display = 'flex';
                    carregarPagina('admin');
                })
                .catch((error) => {
                    console.error('Erro na requisição:', error);
                    alert(`Não foi possível cadastrar: ${error.message}`);
                })
                .finally(() => {
                    if (btnSubmit) {
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = textoOriginal;
                    }
                });
        }

        reader.onload = (evento) => {
            // Convertendo a imagem para Base64
            const base64String = evento.target.result;

            const dadosReceita = {
                nome: formData.get('nome'),
                descricao: formData.get('descricao'),
                ingredientes: formData.get('ingredientes'),
                preco: parseFloat(formData.get('preco')) || 0,
                foto: base64String
            };

            if (btnSubmit) btnSubmit.textContent = 'Cadastrando...';

            fetch(`${API_URL}/Receitas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dadosReceita)
            })
            .then(async (res) => {
                const resposta = await res.json().catch(() => null);
                if (!res.ok) {
                    const mensagemErro = resposta?.mensagem || resposta?.title || 'Erro ao cadastrar a receita';
                    throw new Error(mensagemErro);
                }
                return resposta;
            })
            .then(() => {
                alert('Receita cadastrada com sucesso!');
                form.reset();
                // Limpa o preview da imagem
                const preview = document.getElementById('preview-foto');
                const placeholder = document.querySelector('.upload-placeholder-cad-receita');
                if (preview) { preview.src = ''; preview.style.display = 'none'; }
                if (placeholder) placeholder.style.display = 'flex';
                
                carregarPagina('admin');
            })
            .catch((error) => {
                console.error('Erro na requisição:', error);
                alert(`Não foi possível cadastrar: ${error.message}`);
            })
            .finally(() => {
                if (btnSubmit) {
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = textoOriginal;
                }
            });
        };

        if (arquivoFoto) {
            reader.readAsDataURL(arquivoFoto);
        } else {
            alert("Erro: Foto não encontrada");

            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            }
        }

        return;
    }

    if (e.target.id === 'formCadastrarMotoboy') {
        e.preventDefault();
        console.log('1. Interceptado formCadastrarMotoboy!');
        
        // Verificando se os campos estão válidos
        const formValido = validarFormCadMotoboy();
        console.log('2. Resultado da validação do front:', formValido); 
        
        if (!formValido) {
            console.warn('Envio cancelado: corrija os campos destacados em vermelho.');
            return;
        };

        console.log('3. Validação aprovada! Coletando dados...');

        const form = e.target;
        const formData = new FormData(form);

        // Montando o objeto que será passado para o endpoint
        const dadosMotoboy = {
            nome: formData.get('nome'),
            cpf: formData.get('cpf'),
            telefone: formData.get('telefone'),
            cnh: formData.get('cnh'),
            placa: formData.get('placa'),
            senha: formData.get('senha')
        };

        console.log('4. Enviando payload para a API:', dadosMotoboy);

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit ? btnSubmit.textContent : '';

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Cadastrando...';
        };

        // Disparando a requisição POST para o endpoint de motoboys
        fetch(`${API_URL}/Motoboys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosMotoboy)
        })
        .then(async (res) => {
            console.log('Status da resposta da API:', res.status);
            const resposta = await res.json().catch(() => null);

            if (!res.ok) {
                const msg = resposta?.mensagem || resposta?.title || 'Erro ao realizar o cadastro do motoboy.';
                throw new Error(msg);
            }

            return resposta;
        })
        .then((dados) => {
            console.log('Motoboy salvo no banco com sucesso:', dados);
            alert('Motoboy cadastrado com sucesso!');
            form.reset();
            carregarPagina('motoboys'); // Redireciona de volta para a lista de motoboys
        })
        .catch((erro) => {
            console.error('Erro na requisição:', erro);
            alert(`Falha no cadastro: ${erro.message}`);
        })
        .finally(() => {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            }
        });

        return;
    }

    if (e.target.id === 'formFinalCompra') {
        e.preventDefault();

        // 1. Verifica se o usuário está logado ao clicar em "Finalizar Pedido"
        const usuarioString = localStorage.getItem('vm_usuario');
        const logado = localStorage.getItem('vm_logado') === 'true';

        if (!logado || !usuarioString) {
            alert("Você precisa estar logado para finalizar um pedido.");
            carregarPagina('login'); // Ou 'cadastrarCliente', se preferir
            return;
        }

        // Coletando os dados do formulário
        const form = e.target;
        const formData = new FormData(form);
        const opcaoPagamento = formData.get('opcaoPagamento');
        const observacao = document.getElementById('observacao').value || '';
        const erroPagamentoEl = document.getElementById('erro-opcaoPagamento');

        // Se não escolheu uma opção de pagamento
        if (!opcaoPagamento) {
            if (erroPagamentoEl) erroPagamentoEl.textContent = 'Selecione uma forma de pagamento';
            return;
        } else if (erroPagamentoEl) {
            erroPagamentoEl.textContent = '';
        }

        const pedidoString = localStorage.getItem('vm_pedido_atual');
        if (!pedidoString) return;

        const receita = JSON.parse(pedidoString);
        const usuario = JSON.parse(usuarioString);

        const usuarioId = usuario.id || usuario.Id;
        const rua = usuario.endereco || usuario.Endereco || '';
        const num = usuario.numero || usuario.Numero || 'S/N';
        const bairro = usuario.bairro || usuario.Bairro || '';
        const cidade = usuario.cidade || usuario.Cidade || '';
        const cep = usuario.cep || usuario.Cep || '';
        const enderecoEntrega = `${rua}, ${num} - ${bairro}, ${cidade} - CEP ${cep}`;

        // Monta o objeto respeitando a estrutura da tabela PEDIDOS definida no Supabase
        const payloadPedido = {
            idUsuario: usuarioId,
            idReceita: receita.id,
            observacao: observacao,
            enderecoEntrega: enderecoEntrega,
            opcaoPagamento: opcaoPagamento,
            status: 'Pendente',
            valorTotal: receita.preco
        };

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit ? btnSubmit.textContent : 'Finalizar Pedido';

        // considerações secundárias ao enviar o pedido
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Enviando...';
        }

        // Disparaando requisição POST pra API
        fetch(`${API_URL}/Pedidos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadPedido)
        })
        .then(async (res) => {
            const resposta = await res.json().catch(() => null);
            // Se a requisição deu problema, recebemos a mensagem e disparamos o erro
            if (!res.ok) {
                const msg = resposta?.mensagem || resposta?.title || 'Erro ao finalizar o pedido.';
                throw new Error(msg);
            }
            // Se deu certo retorna a resposta da requisição
            return resposta;
        })
        .then((dados) => {
            alert('Pedido realizado com sucesso!');
            localStorage.removeItem('vm_pedido_atual'); // Limpa o carrinho de pedidos da memória
            carregarPagina('cardapio'); // Envia para a página inicial
        })
        .catch((erro) => {
            console.error('Erro na requisição:', erro);
            alert(`Falha ao enviar pedido: ${erro.message}`);
        })
        .finally(() => {
            // Volta a tela ao que era antes
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            }
        });

        return;
    };

    if (e.target.id === 'formLogin') {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const senha = formData.get('senha');

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit ? btnSubmit.textContent : 'Entrar';

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Autenticando...';
        }

        // Disparando requisição para a rota de login da sua API
        fetch(`${API_URL}/Usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({ email: email, senha: senha })
        })
        .then(async (res) => {
            const resposta = await res.json().catch(() => null);
            if (!res.ok) {
                throw new Error(resposta?.mensagem || 'E-mail ou senha incorretos.');
            }
            // A API deve retornar o objeto do usuário logado em caso de sucesso
            return resposta;
        })
        .then((usuario) => {
            // Salva o estado e os dados reais do usuário na memória do navegador
            localStorage.setItem('vm_logado', 'true');
            localStorage.setItem('vm_usuario', JSON.stringify(usuario));

            // Atualiza a interface gráfica do cabeçalho (troca o botão Entrar pelo Avatar)
            aplicarEstadoLogin();

            const emailLogado = usuario.email || usuario.Email;

            // redirecionando para a cozinha ou para a página de admin, dependendo do email inserido
            if (emailLogado === 'cozinha@cozinha.com') {
                carregarPagina('cozinha');
            } else if (emailLogado === 'admin@admin.com') {
                carregarPagina('admin');
            } else {
                // Redireciona para o cardápio
                carregarPagina('cardapio');
            };
           
        })
        .catch((erro) => {
            console.error('Erro no login:', erro);
            alert(`Falha na autenticação: ${erro.message}`);
        })
        .finally(() => {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            }
        });

        return;
    };

    if (e.target.id === 'formCadastrarCliente') {
        e.preventDefault();
        console.log('1. Interceptado formCadastrarCliente!');

        // 1. Valida os campos no front-end
        const formValido = validarFormCadCliente();
        console.log('2. Resultado da validação do front:', formValido);

        if (!formValido) {
            console.warn('Envio cancelado: corrija os campos destacados em vermelho.');
            return;
        };

        console.log('3. Validação aprovada! Coletando dados...');

        const form = e.target;
        const formData = new FormData(form);

        // Verificando se o fluxo de edição foi ativado
        const idEdicao = localStorage.getItem('vm_usuario_edicao');

        // 2. Monta o objeto exatamente com os campos do formulário
        const dadosCliente = {
            nome: formData.get('nome'),
            email: formData.get('email'),
            telefone: formData.get('telefone'),
            senha: formData.get('senha'),
            dataNascimento: formData.get('dataNascimento'),
            cep: formData.get('cep'),
            cidade: formData.get('cidade'),
            bairro: formData.get('bairro'),
            endereco: formData.get('endereco'),
            numero: formData.get('numero'),
            complemento: formData.get('complemento') || ''
        };

        // Se estiver em edição, pegamos o ID para enviar junto do objeto acima pro C#
        // que exige que o ID esteja presente pra fazer o PUT
        if (idEdicao) {
            dadosCliente.id = parseInt(idEdicao);
        };

        // Decidindo qual o método que será usado na requisição
        const metodoRequisicao = idEdicao ? 'PUT' : 'POST';

        // Definindo a URL que será usada na requisição
        const urlRequisicao = idEdicao
        ? `${API_URL}/Usuarios/${idEdicao}`
        : `${API_URL}/Usuarios`;

        const btnSubmit = form.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit ? btnSubmit.textContent : '';
        if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.textContent = 'Enviando...'; }

        console.log('4. Enviando payload para a API:', dadosCliente);

        // 3. Dispara a requisição POST para o backend
        fetch(urlRequisicao, {
            method: metodoRequisicao,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosCliente)
        })
        .then(async (res) => {

            if (!res.ok) {
                const resposta = await res.json().catch(() => null);
                throw new Error(resposta?.mensagem || 'Erro na operação.');
            }

            // Não retornamos nada se o usuário tiver atualizado seu cadastro
            return idEdicao ? null : res.json();
        })
        .then((dados) => {
            if (idEdicao) {
                console.log('Usuario atualizado com sucesso!');
                alert('Conta atualizada com sucesso!');
                // Atualizando o localStorage do usuário com os dados novos e limpando a flag
                localStorage.setItem('vm_usuario', JSON.stringify(dadosCliente));
                localStorage.removeItem('vm_usuario_edicao');
            } else {
                console.log('Usuário salvo no banco com sucesso:', dados);
                alert('Sua conta foi criada com sucesso!');
                form.reset();
                carregarPagina('login');
            }
            
        })
        .catch((erro) => {
            console.error('Erro na requisição:', erro);
            alert(`Falha no cadastro: ${erro.message}`);
        })
        .finally(() => {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = textoOriginal;
            };
        })

        return;
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

document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'input-pesquisar-vitrine') {
        const termo = e.target.value.toLowerCase();
        const cards = document.querySelectorAll('.card-receita');
        let cardsVisiveis = 0;

        cards.forEach(card => {
            const nomeEl = card.querySelector('h3');
            const ingrEl = card.querySelector('.card-ingredientes');
            
            if (!nomeEl || !ingrEl) return;
            
            const nome = nomeEl.textContent.toLowerCase();
            const ingredientes = ingrEl.textContent.toLowerCase();
            
            if (nome.includes(termo) || ingredientes.includes(termo)) {
                card.style.display = '';
                cardsVisiveis++;
            } else {
                card.style.display = 'none';
            }
        });

        // Modifica os elementos existentes no HTML
        const tituloMostruario = document.querySelector('.titulo-mostruario');
        const contadorReceitas = document.getElementById('contador-receitas');

        if (tituloMostruario) {
            if (cardsVisiveis === 0 && cards.length > 0) {
                tituloMostruario.textContent = 'Nenhuma receita corresponde à sua pesquisa.';
                if (contadorReceitas) contadorReceitas.style.display = 'none';
            } else {
                tituloMostruario.textContent = 'Receitas Disponíveis';
                if (contadorReceitas) {
                    contadorReceitas.style.display = '';
                    contadorReceitas.textContent = `${cardsVisiveis} receita(s) encontrada(s)`;
                }
            }
        }
    }
});

aplicarEstadoLogin();

const usuarioStringStartup = localStorage.getItem('vm_usuario');

if (usuarioStringStartup) {
    const usuarioStartup = JSON.parse(usuarioStringStartup);
    const emailStartup = usuarioStartup.email || usuarioStartup.Email;
    
    if (emailStartup === 'cozinha@cozinha.com') {
        carregarPagina('cozinha');
    } else if (emailStartup === 'admin@admin.com') {
        carregarPagina('admin');
    } else {
        carregarPagina('cardapio');
    }
} else {
    carregarPagina('cardapio');
}
