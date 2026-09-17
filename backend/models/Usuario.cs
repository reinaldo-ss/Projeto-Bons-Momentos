using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("usuarios")]
public class Usuario
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("senha")]
    public string Senha { get; set; } = string.Empty;

    [Column("data_nascimento")]
    public DateOnly DataNascimento { get; set; }

    [Column("cep")]
    public string? Cep { get; set; }

    [Column("endereco")]
    public string? Endereco { get; set; }

    [Column("cidade")]
    public string? Cidade { get; set; }

    [Column("bairro")]
    public string? Bairro { get; set; }

    [Column("numero")]
    public string? Numero { get; set; }

    [Column("complemento")]
    public string? Complemento { get; set; }

    [Column("telefone")]
    public string? Telefone { get; set; }

    [Column("tipo_usuario")]
    public string TipoUsuario { get; set; } = "cliente";
}
