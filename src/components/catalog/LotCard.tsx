import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { categoryLabels, type Lot, type LotCategory } from "@/types";

const categoryStyles: Record<LotCategory, string> = {
  elite: "border-primary/50 bg-primary/10 text-primary",
  comercial: "border-border bg-surface-muted text-muted-foreground",
  imovel: "border-accent/50 bg-accent/10 text-accent",
};

export function LotCard({ lot, delay = 0 }: { lot: Lot; delay?: number }) {
  return (
    <Link
      to="/lotes/$lotId"
      params={{ lotId: lot.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all animate-entry hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={lot.image}
          alt={lot.title}
          loading="lazy"
          width={800}
          height={800}
          className="aspect-[4/3] w-full bg-surface-muted object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] backdrop-blur">
          Lote #{lot.number}
        </span>
        <span
          className={cn(
            "absolute right-4 top-4 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] backdrop-blur",
            categoryStyles[lot.category],
          )}
        >
          {categoryLabels[lot.category]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-4 font-display text-xl font-extrabold leading-tight">{lot.title}</h3>
        <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
          {lot.specs.slice(0, 3).map((spec) => (
            <div key={spec.label} className="min-w-0">
              <p className="meta-label">{spec.label}</p>
              <p className="truncate text-sm font-semibold">{spec.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-end justify-between gap-4 rounded-lg bg-surface-muted px-4 py-3">
          <p className="meta-label">{lot.bidLabel}</p>
          <p className="font-display text-lg font-extrabold text-primary">
            {lot.currentBid ? formatCurrency(lot.currentBid) : "Sob consulta"}
          </p>
        </div>
      </div>
    </Link>
  );
}
