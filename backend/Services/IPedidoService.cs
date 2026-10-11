namespace ConfeitariaApi.Services
{
    public interface IPedidoService
    {
        Task<Pedido> CriarPedidoAsync(Pedido pedido);
        Task<List<Pedido>> ListarPedidosDoClienteAsync(int usuarioId);
    }
}