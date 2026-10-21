using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("motoboy")]
public class Motoboy
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("cpf")]
    public string Cpf { get; set; } = string.Empty;

    [Column("telefone")]
    public string Telefone { get; set; } = string.Empty;

    [Column("cnh")]
    public string Cnh { get; set; } = string.Empty;

    [Column("placa")]
    public string Placa { get; set; } = string.Empty;

    [Column("senha")]
    public string Senha { get; set; } = string.Empty;
}