import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-foreground py-20 text-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-20 grid gap-12 md:grid-cols-4">
          <div>
            <h4 className="mb-6 text-xl font-black uppercase tracking-tighter text-background">
              Terroir.
            </h4>
            <p className="text-xs leading-loose">
              Matriz: R. da Genética, 1500
              <br />
              Campo Grande - MS
              <br />
              CEP 79000-000
            </p>
          </div>
          <div>
            <h5 className="eyebrow mb-6 text-background">Navegação</h5>
            <ul className="space-y-4 text-xs">
              <li>
                <Link to="/leiloes" className="transition-colors hover:text-background">
                  Próximos Leilões
                </Link>
              </li>
              <li>
                <Link to="/lotes" className="transition-colors hover:text-background">
                  Lotes Disponíveis
                </Link>
              </li>
              <li>
                <Link to="/admin" className="transition-colors hover:text-background">
                  Anunciar
                </Link>
              </li>
              <li>
                <Link to="/leiloes" className="transition-colors hover:text-background">
                  Regulamentos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="eyebrow mb-6 text-background">Suporte</h5>
            <ul className="space-y-4 text-xs">
              <li>
                <Link to="/minha-conta" className="transition-colors hover:text-background">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="transition-colors hover:text-background">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/cadastro" className="transition-colors hover:text-background">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link to="/minha-conta" className="transition-colors hover:text-background">
                  Ouvidoria
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="eyebrow mb-6 text-background">Newsletter</h5>
            <p className="mb-4 text-xs">Receba avisos de novos lotes e remates.</p>
            <form
              className="flex border-b border-white/20 pb-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <label htmlFor="newsletter-email" className="sr-only">
                E-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="seu@email.com"
                className="w-full border-none bg-transparent text-xs text-background placeholder:text-background/40 focus:outline-none"
              />
              <button type="submit" className="text-[10px] font-bold uppercase text-background">
                Ok
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-10 font-mono text-[9px] uppercase tracking-[0.2em] md:flex-row">
          <p>© 2026 Terroir Remates S.A. — Todos os direitos reservados.</p>
          <p>Leilões rurais de gado e propriedades</p>
        </div>
      </div>
    </footer>
  );
}
