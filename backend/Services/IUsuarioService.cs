namespace ConfeitariaApi.Services
{
    public interface IUsuarioService
    {
        Task<Usuario> CadastrarUsuarioAsync(Usuario usuario);
    }
}