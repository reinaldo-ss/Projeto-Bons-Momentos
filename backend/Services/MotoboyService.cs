using Microsoft.EntityFrameworkCore;

namespace ConfeitariaApi.Services
{
    public class MotoboyService : IMotoboyService
    {
        private readonly AppDbContext _context;

        public MotoboyService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Motoboy> CadastrarMotoboyAsync(Motoboy motoboy)
        {
            if (string.IsNullOrWhiteSpace(motoboy.Nome) ||
                string.IsNullOrWhiteSpace(motoboy.Cpf) ||
                string.IsNullOrWhiteSpace(motoboy.Telefone) ||
                string.IsNullOrWhiteSpace(motoboy.Cnh) ||
                string.IsNullOrWhiteSpace(motoboy.Placa) ||
                string.IsNullOrWhiteSpace(motoboy.Senha))
            {
                throw new Exception("Todos os campos do cadastro de motoboy são obrigatórios.");
            }

            var cpfExiste = await _context.Motoboys.AnyAsync(m => m.Cpf == motoboy.Cpf);
            if (cpfExiste)
            {
                throw new Exception("Já existe um motoboy cadastrado com este CPF.");
            }

            var cnhExiste = await _context.Motoboys.AnyAsync(m => m.Cnh == motoboy.Cnh);
            if (cnhExiste)
            {
                throw new Exception("Já existe um motoboy cadastrado com esta CNH.");
            }

            _context.Motoboys.Add(motoboy);
            await _context.SaveChangesAsync();
            return motoboy;
        }

        public async Task<List<Motoboy>> ListarTodosAsync()
        {
            return await _context.Motoboys.ToListAsync();
        }

        public async Task<Motoboy?> ObterPorIdAsync(int id)
        {
            return await _context.Motoboys.FindAsync(id);
        }

        public async Task<Motoboy> AtualizarMotoboyAsync(int id, Motoboy motoboyAtualizado)
        {
            var motoboyExistente = await _context.Motoboys.FindAsync(id);
            if (motoboyExistente == null)
            {
                throw new KeyNotFoundException("Motoboy não encontrado.");
            }

            // Regra: Todos os campos continuam obrigatórios na atualização
            if (string.IsNullOrWhiteSpace(motoboyAtualizado.Nome) ||
                string.IsNullOrWhiteSpace(motoboyAtualizado.Cpf) ||
                string.IsNullOrWhiteSpace(motoboyAtualizado.Telefone) ||
                string.IsNullOrWhiteSpace(motoboyAtualizado.Cnh) ||
                string.IsNullOrWhiteSpace(motoboyAtualizado.Placa) ||
                string.IsNullOrWhiteSpace(motoboyAtualizado.Senha))
            {
                throw new Exception("Todos os campos do cadastro de motoboy são obrigatórios.");
            }

            // Checa duplicidade de CPF em outro registro diferente do atual
            var cpfExiste = await _context.Motoboys.AnyAsync(m => m.Cpf == motoboyAtualizado.Cpf && m.Id != id);
            if (cpfExiste)
            {
                throw new Exception("Já existe outro motoboy cadastrado com este CPF.");
            }

            // Checa duplicidade de CNH em outro registro diferente do atual
            var cnhExiste = await _context.Motoboys.AnyAsync(m => m.Cnh == motoboyAtualizado.Cnh && m.Id != id);
            if (cnhExiste)
            {
                throw new Exception("Já existe outro motoboy cadastrado com esta CNH.");
            }

            // Atualiza os dados
            motoboyExistente.Nome = motoboyAtualizado.Nome;
            motoboyExistente.Cpf = motoboyAtualizado.Cpf;
            motoboyExistente.Telefone = motoboyAtualizado.Telefone;
            motoboyExistente.Cnh = motoboyAtualizado.Cnh;
            motoboyExistente.Placa = motoboyAtualizado.Placa;
            motoboyExistente.Senha = motoboyAtualizado.Senha;

            await _context.SaveChangesAsync();
            return motoboyExistente;
        }

        public async Task<bool> DeletarMotoboyAsync(int id)
        {
            var motoboy = await _context.Motoboys.FindAsync(id);
            if (motoboy == null)
            {
                return false;
            }

            _context.Motoboys.Remove(motoboy);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}