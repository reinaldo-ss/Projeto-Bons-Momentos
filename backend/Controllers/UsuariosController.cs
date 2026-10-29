using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ConfeitariaApi.Services;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(AppDbContext context, IUsuarioService usuarioService)
    {
        _context = context;
        _usuarioService = usuarioService;
    }

    // Rota GET: api/usuarios
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
    {
        var usuarios = await _context.Usuarios.ToListAsync();
        return Ok(usuarios);
    }

    // Rota GET por ID: api/usuarios/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Usuario>> GetUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound("Usuário não encontrado.");
        }

        return Ok(usuario);
    }

    [HttpPost("login")]
    public async Task<ActionResult<Usuario>> Login([FromBody] LoginRequest loginRequest)
    {
        var usuario = await _context.Usuarios
        .FirstOrDefaultAsync(u => u.Email == loginRequest.Email && u.Senha == loginRequest.Senha);
    
        if (usuario == null)
        {
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });
        }

        return Ok(usuario);
    }

    // Rota POST
    [HttpPost]
    public async Task<ActionResult<Usuario>> PostUsuario([FromBody] Usuario usuario)
    {
        try
        {
            // O Service valida os campos obrigatórios e salva no banco
            var usuarioCriado = await _usuarioService.CadastrarUsuarioAsync(usuario);
            
            // Retorna o Status 201
            return CreatedAtAction("GetUsuario", new { id = usuarioCriado.Id }, usuarioCriado);
        }
        catch (Exception ex)
        {
            // Retorna Status 400 se faltar algum campo
            return BadRequest(new { mensagem = ex.Message });
        }
    }

    // Rota PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> PutUsuario(int id, [FromBody] Usuario usuario)
    {
        if (id != usuario.Id)
        {
            return BadRequest("O ID passado na URL é diferente do ID do usuário enviado.");
        }

        _context.Entry(usuario).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!UsuarioExiste(id))
            {
                return NotFound("Usuário não encontrado no banco de dados.");
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
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);

        if (usuario == null)
        {
            return NotFound("Usuário não encontrado para exclusão.");
        }

        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool UsuarioExiste(int id)
    {
        return _context.Usuarios.Any(e => e.Id == id);
    }

}

public class LoginRequest
{
    public string Email { get; set; }
    public string Senha { get; set; }
}