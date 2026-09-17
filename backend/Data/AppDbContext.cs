using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Receita> Receitas { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Transforma o Enum do C# em texto na hora do INSERT
        modelBuilder.Entity<Pedido>()
            .Property(p => p.OpcaoPagamento)
            .HasConversion<string>();

        modelBuilder.Entity<Pedido>()
            .Property(p => p.Status)
            .HasConversion<string>();
    }
}