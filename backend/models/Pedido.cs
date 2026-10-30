using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

[Table("pedidos")]
public class Pedido
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("id_usuario")]
    public int IdUsuario { get; set; }

    [Column("id_receita")]
    public int IdReceita { get; set; }

    [Column("observacao")]
    public string? Observacao { get; set; }

    [Column("endereco_entrega")]
    public string EnderecoEntrega { get; set; } = string.Empty;

    [Column("opcao_pagamento")]
    public string OpcaoPagamento { get; set; } = string.Empty;

    [Column("status")]
    public string Status { get; set; } = "a fazer";

    [Column("valor_total")]
    public decimal ValorTotal { get; set; }

    [Column("data_pedido")]
    public DateTime DataPedido { get; set; } = DateTime.Now;
}