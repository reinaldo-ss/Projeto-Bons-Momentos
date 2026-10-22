namespace ConfeitariaApi.Services
{
    public interface IMotoboyService
    {
        Task<Motoboy> CadastrarMotoboyAsync(Motoboy motoboy);
        Task<List<Motoboy>> ListarTodosAsync();
        Task<Motoboy?> ObterPorIdAsync(int id);
        Task<Motoboy> AtualizarMotoboyAsync(int id, Motoboy motoboyAtualizado);
        Task<bool> DeletarMotoboyAsync(int id);
    }
}