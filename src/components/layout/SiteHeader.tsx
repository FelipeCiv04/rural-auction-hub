import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/leiloes", label: "Leilões" },
  { to: "/lotes", label: "Lotes" },
  { to: "/minha-conta", label: "Minha Conta" },
  { to: "/admin", label: "Painel" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 py-6 md:flex-row md:items-end">
        <Link to="/" className="block">
          <span className="block text-4xl font-black uppercase leading-[0.85] tracking-tighter text-foreground">
            Terroir<span className="text-primary">.</span>
            <br />
            Remates
          </span>
        </Link>
        <nav className="flex flex-wrap gap-6 border-t border-border pt-4 md:gap-8 md:border-t-0 md:pt-0">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="eyebrow pb-1 text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground border-b-2 border-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
