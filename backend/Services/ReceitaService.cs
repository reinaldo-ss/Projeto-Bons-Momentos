using Microsoft.EntityFrameworkCore;

namespace ConfeitariaApi.Services
{
    public class ReceitaService : IReceitaService
    {
        private readonly AppDbContext _context;

        public ReceitaService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Receita> CadastrarReceitaAsync(Receita receita)
        {
            // Aqui assumimos que no banco há apenas um campo de texto/URL para a imagem
            if (string.IsNullOrWhiteSpace(receita.Foto)) // Ajuste o nome da propriedade da imagem se for diferente
            {
                throw new Exception("É obrigatório enviar 1 imagem para a receita.");
            }

            if (receita.Foto.Contains(",") || receita.Foto.Contains(";"))
            {
                throw new Exception("Apenas uma imagem é permitida por receita. Certifique-se de enviar apenas uma imagem.");
            }

            _context.Receitas.Add(receita);
            await _context.SaveChangesAsync();
            return receita;
        }
    }
}