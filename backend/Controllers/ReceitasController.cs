using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ReceitasController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReceitasController(AppDbContext context)
    {
        _context = context;
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
        // 1. Adiciona o objeto na memória do Entity Framework
        _context.Receitas.Add(receita);
        
        // 2. Executa o comando de INSERT no Supabase
        await _context.SaveChangesAsync();

        // 3. Retorna Status 201 junto com os dados da receita
        return CreatedAtAction(nameof(GetReceitas), new { id = receita.Id }, receita);
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