using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("receitas")]
public class Receita
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; } = string.Empty;

    [Column("descricao")]
    public string? Descricao { get; set; }

    [Column("ingredientes")]
    public string? Ingredientes { get; set; }

    [Column("foto")]
    public string? Foto { get; set; }

    [Column("preco")]
    public decimal Preco { get; set; }
}