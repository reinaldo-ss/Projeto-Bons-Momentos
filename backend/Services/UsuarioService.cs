using Microsoft.EntityFrameworkCore;

namespace ConfeitariaApi.Services
{
    public class UsuarioService : IUsuarioService
    {
        private readonly AppDbContext _context;

        public UsuarioService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Usuario> CadastrarUsuarioAsync(Usuario usuario)
        {
            // Valida se algum campo de texto principal veio vazio
            if (string.IsNullOrWhiteSpace(usuario.Nome) || 
                string.IsNullOrWhiteSpace(usuario.Email) || 
                string.IsNullOrWhiteSpace(usuario.Senha) || 
                string.IsNullOrWhiteSpace(usuario.Cep) || 
                string.IsNullOrWhiteSpace(usuario.Endereco))
            {
                throw new Exception("Todos os campos do cadastro são obrigatórios.");
            }

            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return usuario;
        }
    }
}