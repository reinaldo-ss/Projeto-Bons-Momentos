/* =====================================================
   Roteamento da SPA
   ===================================================== */

// Páginas que vivem dentro de subpastas de view/ (admin/, cozinha/)
const PAGINAS_EM_SUBPASTA = {
    admin: 'admin/admin',
    motoboys: 'admin/motoboys',
    historicoPedidos: 'admin/historicoPedidos',
    cadastrarReceita: 'admin/cadastrarReceita',
    cadastrarMotoBoys: 'admin/cadastrarMotoBoys',
    cozinha: 'cozinha/cozinha',
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

            if (pagina === 'cadastrarCliente' || pagina === 'login' || pagina === 'cadastrarReceita' || pagina === 'admin' || pagina === 'motoboys' || pagina === 'historicoPedidos' || pagina === 'cadastrarMotoBoys' || pagina === 'cozinha' || pagina === 'enviarPedido') {
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
            } else if (pagina === 'conta') {
                preencherDadosConta();
            } else if (pagina === 'cadastrarCliente') {
                preencherFormularioEdicaoConta();
            } else if (pagina === 'cozinha') {
                cz_selecionarSecao('pedidos');
            }
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

/* ===== Painel Cozinha ===== */

// Monta o caminho do partial considerando se a página já foi aberta diretamente
// de dentro de view/cozinha/ (teste isolado) ou carregada via SPA a partir da raiz (index.html)
function cz_caminhoView(arquivo) {
    const estaDentroDeView = window.location.pathname.includes('/view/');
    return estaDentroDeView ? `${arquivo}.html` : `view/cozinha/${arquivo}.html`;
}

const CZ_TITULOS_SECOES = {
    pedidos: { titulo: 'Pedidos', subtitulo: 'Gerencie os pedidos em andamento na cozinha' },
    historico: { titulo: 'Histórico de Pedidos', subtitulo: 'Acompanhe todos os pedidos já finalizados pela cozinha' }
};

// Troca o conteúdo principal da cozinha (Pedidos / Histórico) via fetch, sem recarregar a página
function cz_selecionarSecao(secao, elClicado) {
    const area = document.getElementById('cz-area-principal');
    if (!area) return;

    document.querySelectorAll('.cz-menu-item').forEach(item => item.classList.remove('ativo'));
    const itemAtivo = elClicado || document.querySelector(`.cz-menu-item[data-secao="${secao}"]`);
    if (itemAtivo) itemAtivo.classList.add('ativo');

    const info = CZ_TITULOS_SECOES[secao] || CZ_TITULOS_SECOES.pedidos;
    const tituloEl = document.getElementById('cz-titulo-secao');
    const subtituloEl = document.getElementById('cz-subtitulo-secao');
    if (tituloEl) tituloEl.textContent = info.titulo;
    if (subtituloEl) subtituloEl.textContent = info.subtitulo;

    const arquivo = secao === 'historico' ? 'historicoPedidosCozinha' : 'pedidosCozinha';

    fetch(cz_caminhoView(arquivo))
        .then(res => res.text())
        .then(html => {
            area.innerHTML = html;
        })
        .catch(erro => {
            console.error('Erro ao carregar seção da cozinha:', erro);
            area.innerHTML = '<p>Erro ao carregar conteúdo.</p>';
        });
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
        headerComPerfil.style.display = 'none';
        headerComBotaoEntrar.style.display = '';
    }
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

/* =====================================================
   Envio dos formulários
   Aqui rodamos apenas a validação de frontend (campos
   preenchidos, formatos corretos etc). O envio real dos
   dados para a API é responsabilidade de quem for
   implementar a integração com o backend.
   ===================================================== */
document.addEventListener('submit', function(e) {
    if (e.target.id === 'formCadastrarReceita') {
        e.preventDefault();
        validarFormCadReceita();
        return;
    }

    if (e.target.id === 'formCadastrarMotoboy') {
        e.preventDefault();
        validarFormCadMotoboy();
        return;
    }

    if (e.target.id === 'formFinalCompra') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const opcaoPagamento = formData.get('opcaoPagamento');
        const erroPagamentoEl = document.getElementById('erro-opcaoPagamento');
        if (!opcaoPagamento) {
            if (erroPagamentoEl) erroPagamentoEl.textContent = 'Selecione uma forma de pagamento';
        } else if (erroPagamentoEl) {
            erroPagamentoEl.textContent = '';
        }
        return;
    }

    if (e.target.id === 'formCadastrarCliente') {
        e.preventDefault();
        validarFormCadCliente();
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

aplicarEstadoLogin();
carregarPagina('cardapio');
