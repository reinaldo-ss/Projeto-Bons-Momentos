using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConfeitariaApi.Services;

[ApiController]
[Route("api/[controller]")]
public class ReceitasController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IReceitaService _receitaService;

    public ReceitasController(AppDbContext context, IReceitaService receitaService)
    {
        _context = context;
        _receitaService = receitaService;
    }

    // Rota GET: api/receitas
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Receita>>> GetReceitas()
    {
        var receitas = await _context.Receitas.ToListAsync();
        
        return Ok(receitas);
    }

    // Rota GET Específica: api/receitas/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Receita>> GetReceita(int id)
    {
        //Buscando a receita no banco de dados pela chave primária (ID)
        var receita = await _context.Receitas.FindAsync(id);

        //Se não encontrar no banco, retorna erro NotFound que equivale a um erro 404
        if (receita == null)
        {
            return NotFound("Receita não encontrada.");
        }

        // 3. Se encontrar, retorna status 200 (OK) junto com os dados da receita
        return Ok(receita);
    }

    // Rota POST
    [HttpPost]
    public async Task<ActionResult<Receita>> PostReceita([FromBody] Receita receita)
    {
        try
        {
            // O Service faz a validação e salva no banco
            var receitaCriada = await _receitaService.CadastrarReceitaAsync(receita);
            
            return CreatedAtAction(nameof(GetReceita), new { id = receitaCriada.Id }, receitaCriada);
        }
        catch (Exception ex)
        {
            // Se cair em alguma regra de negócio do Service, devolve o erro 400 com a mensagem
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    // Rota PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> PutReceita(int id, [FromBody] Receita receita)
    {
        // 1. Verificando se o id da url é o mesmo do body
        if (id != receita.Id)
        {
            return BadRequest("O ID passado na URL é diferente do ID da receita enviada.");
        }

        // 2. Avisa ao EF que esse objeto foi modificado
        _context.Entry(receita).State = EntityState.Modified;

        try
        {
            // 3. Executa o comando UPDATE
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            // 4. Caso dê erro ao atualizar
            if (!ReceitaExiste(id))
            {
                return NotFound("Receita não encontrada no banco de dados.");
            }
            else
            {
                throw;
            }
        }

        // 5. Retorna Status 204 porque é o padrão para PUT bem-sucedido
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteReceita(int id)
    {

        var receita = await _context.Receitas.FindAsync(id);

        if (receita == null)
        {
            return NotFound("Receita não encontrada para exclusão. ");
        }

        _context.Receitas.Remove(receita);

        await _context.SaveChangesAsync();

        return NoContent();
    }
    
    // Método auxiliar privado usado apenas para checar se a receita existe (usado no PUT e no DELETE)
    private bool ReceitaExiste(int id)
    {
        return _context.Receitas.Any(e => e.Id == id);
    }
}