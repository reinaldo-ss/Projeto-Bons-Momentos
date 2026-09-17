using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    // Rota GET: api/pedidos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pedido>>> GetPedidos()
    {
        var pedidos = await _context.Pedidos.ToListAsync();
        return Ok(pedidos);
    }

    // Rota GET por ID: api/pedidos/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Pedido>> GetPedido(int id)
    {
        var pedido = await _context.Pedidos.FindAsync(id);

        if (pedido == null)
        {
            return NotFound("Pedido não encontrado.");
        }

        return Ok(pedido);
    }

    // Rota POST
    [HttpPost]
    public async Task<ActionResult<Pedido>> PostPedido([FromBody] Pedido pedido)
    {
        // Garante que a data do pedido seja gerada caso venha vazia
        if (pedido.DataPedido == default)
        {
            pedido.DataPedido = DateTime.UtcNow;
        }
        //

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPedido), new { id = pedido.Id }, pedido);
    }

    // Rota PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> PutPedido(int id, [FromBody] Pedido pedido)
    {
        if (id != pedido.Id)
        {
            return BadRequest("O ID passado na URL é diferente do ID do pedido enviado.");
        }

        _context.Entry(pedido).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!PedidoExiste(id))
            {
                return NotFound("Pedido não encontrado no banco de dados.");
            }
            else
            {
                throw;
            }
        }

        return NoContent();
    }

    // Rota DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePedido(int id)
    {
        var pedido = await _context.Pedidos.FindAsync(id);

        if (pedido == null)
        {
            return NotFound("Pedido não encontrado para exclusão.");
        }

        _context.Pedidos.Remove(pedido);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool PedidoExiste(int id)
    {
        return _context.Pedidos.Any(e => e.Id == id);
    }
}