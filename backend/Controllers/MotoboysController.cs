using Microsoft.AspNetCore.Mvc;
using ConfeitariaApi.Services;

[ApiController]
[Route("api/[controller]")]
public class MotoboysController : ControllerBase
{
    private readonly IMotoboyService _motoboyService;

    public MotoboysController(IMotoboyService motoboyService)
    {
        _motoboyService = motoboyService;
    }

    [HttpGet]
    public async Task<ActionResult<List<Motoboy>>> GetMotoboys()
    {
        var lista = await _motoboyService.ListarTodosAsync();
        return Ok(lista);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Motoboy>> GetMotoboy(int id)
    {
        var motoboy = await _motoboyService.ObterPorIdAsync(id);
        if (motoboy == null)
        {
            return NotFound(new { mensagem = "Motoboy não encontrado." });
        }
        return Ok(motoboy);
    }

    [HttpPost]
    public async Task<ActionResult<Motoboy>> PostMotoboy([FromBody] Motoboy motoboy)
    {
        try
        {
            var criado = await _motoboyService.CadastrarMotoboyAsync(motoboy);
            return CreatedAtAction(nameof(GetMotoboy), new { id = criado.Id }, criado);
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Motoboy>> PutMotoboy(int id, [FromBody] Motoboy motoboy)
    {
        try
        {
            var atualizado = await _motoboyService.AtualizarMotoboyAsync(id, motoboy);
            return Ok(atualizado);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { mensagem = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMotoboy(int id)
    {
        var deletado = await _motoboyService.DeletarMotoboyAsync(id);
        if (!deletado)
        {
            return NotFound(new { mensagem = "Motoboy não encontrado para exclusão." });
        }

        return NoContent(); // Retorna 204 No Content confirmando a exclusão
    }
}