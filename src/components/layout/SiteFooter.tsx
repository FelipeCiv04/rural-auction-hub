import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface py-16 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-gradient-ember font-display text-lg font-black text-primary-foreground">
                T
              </span>
              <span>
                <span className="block font-display text-lg font-black uppercase leading-none tracking-tight text-foreground">
                  Terroir
                </span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.28em]">
                  Remates
                </span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Matriz: R. da Genética, 1500
              <br />
              Campo Grande - MS
              <br />
              CEP 79000-000
            </p>
          </div>
          <div>
            <h5 className="eyebrow mb-5 text-foreground">Navegação</h5>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/leiloes" className="transition-colors hover:text-primary">
                  Próximos Leilões
                </Link>
              </li>
              <li>
                <Link to="/lotes" className="transition-colors hover:text-primary">
                  Lotes Disponíveis
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-primary">
                  Anunciar
                </Link>
              </li>
              <li>
                <Link to="/leiloes" className="transition-colors hover:text-primary">
                  Regulamentos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="eyebrow mb-5 text-foreground">Suporte</h5>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/minha-conta" className="transition-colors hover:text-primary">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="transition-colors hover:text-primary">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="transition-colors hover:text-primary">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/minha-conta" className="transition-colors hover:text-primary">
                  Ouvidoria
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="eyebrow mb-5 text-foreground">Newsletter</h5>
            <p className="mb-4 text-sm">Receba avisos de novos lotes e remates.</p>
            <form
              className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                E-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="seu@email.com"
                className="min-w-0 flex-1 border-none bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gradient-ember px-4 py-2 eyebrow text-primary-foreground"
              >
                Ok
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-8 font-mono text-[10px] uppercase tracking-[0.18em] md:flex-row">
          <p>© 2026 Terroir Remates S.A. — Todos os direitos reservados.</p>
          <p>Leilões de bovinos, caprinos e propriedades</p>
        </div>
      </div>
    </footer>
  );
}
