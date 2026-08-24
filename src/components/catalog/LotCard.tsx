import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { categoryLabels, type Lot, type LotCategory } from "@/types";

const categoryStyles: Record<LotCategory, string> = {
  elite: "border-primary text-primary",
  comercial: "border-border text-muted-foreground",
  imovel: "border-accent text-accent",
};

export function LotCard({ lot, delay = 0 }: { lot: Lot; delay?: number }) {
  return (
    <Link
      to="/lotes/$lotId"
      params={{ lotId: lot.id }}
      className="group block bg-surface p-6 ring-1 ring-black/[0.05] transition-all animate-entry hover:ring-primary/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-6">
        <img
          src={lot.image}
          alt={lot.title}
          loading="lazy"
          width={800}
          height={800}
          className="aspect-square w-full bg-surface-muted object-cover grayscale transition-all group-hover:grayscale-0"
        />
      </div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">
            Lote #{lot.number}
          </span>
          <h3 className="text-xl font-bold uppercase tracking-tight">{lot.title}</h3>
        </div>
        <span
          className={cn(
            "shrink-0 border px-2 py-0.5 font-mono text-[10px] uppercase",
            categoryStyles[lot.category],
          )}
        >
          {categoryLabels[lot.category]}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-y-4 border-t border-border pt-4">
        {lot.specs.slice(0, 3).map((spec) => (
          <div key={spec.label}>
            <p className="meta-label">{spec.label}</p>
            <p className="text-sm font-bold">{spec.value}</p>
          </div>
        ))}
        <div>
          <p className="meta-label">{lot.bidLabel}</p>
          <p className={cn("text-sm font-bold", lot.category === "elite" && "text-accent")}>
            {lot.currentBid ? formatCurrency(lot.currentBid) : "Sob Consulta"}
          </p>
        </div>
      </div>
    </Link>
  );
}
