document.addEventListener('DOMContentLoaded', function () {

    /* ===== Acordeão do card de pedido ===== */
    const pedidoCard = document.getElementById('pedidoCard');
    const pedidoToggle = document.getElementById('pedidoToggle');

    pedidoToggle.addEventListener('click', function () {
        const aberto = pedidoCard.classList.toggle('aberto');
        pedidoToggle.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });

});
