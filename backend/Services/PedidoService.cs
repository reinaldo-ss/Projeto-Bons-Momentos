using Microsoft.EntityFrameworkCore;

namespace ConfeitariaApi.Services
{
    public class PedidoService : IPedidoService
    {
        private readonly AppDbContext _context;

        public PedidoService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Pedido> CriarPedidoAsync(Pedido pedido)
        {
            // Regra 1: Formas de pagamento permitidas
            var pagamentosPermitidos = new List<string> { "PIX", "VR ou VA", "Dinheiro", "Cartão" };
            if (!pagamentosPermitidos.Contains(pedido.OpcaoPagamento)) // Ajuste o nome da propriedade se for diferente
            {
                throw new Exception("Forma de pagamento inválida. Aceitamos apenas: PIX, VR, VA, Dinheiro, Cartão de Débito ou Crédito.");
            }

            // Regra 2: Só pode ser efetuado 1 pedido por vez (Verifica se já tem um pendente)
            var temPedidoPendente = await _context.Pedidos
                .AnyAsync(p => p.IdUsuario == pedido.IdUsuario && p.Status == "Em Preparo");
            
            if (temPedidoPendente)
            {
                throw new Exception("Você já possui um pedido em andamento. Aguarde a conclusão para fazer um novo.");
            }

            // A regra do login (avançar para compra) será tratada no Controller exigindo o token (Authorize), 
            // mas o simples fato de precisarmos do UsuarioId aqui já barra quem não está logado.

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();
            return pedido;
        }

        public async Task<List<Pedido>> ListarPedidosDoClienteAsync(int usuarioId)
        {
            // Regra 3: Clientes só veem pedidos que estão pendentes
            return await _context.Pedidos
                .Where(p => p.IdUsuario == usuarioId && p.Status == "Pendente")
                .ToListAsync();
        }
    }
}