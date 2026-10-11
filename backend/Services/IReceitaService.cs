namespace ConfeitariaApi.Services
{
    public interface IReceitaService
    {
        Task<Receita> CadastrarReceitaAsync(Receita receita);
    }
}