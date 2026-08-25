import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/leiloes", label: "Leilões" },
  { to: "/lotes", label: "Lotes" },
  { to: "/minha-conta", label: "Minha Conta" },
  { to: "/admin", label: "Painel" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-9 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-ember font-display text-lg font-black text-primary-foreground">
            T
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-lg font-black uppercase leading-none tracking-tight">
              Terroir
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Remates
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                activeProps={{ className: "bg-surface text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/cadastro"
            className="hidden rounded-full bg-gradient-ember px-5 py-2 eyebrow text-primary-foreground shadow-ember transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Habilitar-se
          </Link>
          <button
            type="button"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-border text-foreground md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-border bg-surface px-4 py-3 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-3 text-sm font-medium text-muted-foreground last:border-b-0"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
