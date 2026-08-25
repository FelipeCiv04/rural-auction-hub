import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/formatters";
import { loadLiveTicker } from "@/services";
import type { LiveTickerData } from "@/types/ticker";

export function LiveTickerBar() {
  const [liveTicker, setLiveTicker] = useState<LiveTickerData | null>(null);

  useEffect(() => {
    void loadLiveTicker().then(setLiveTicker);
  }, []);

  return (
    <div className="sticky top-0 z-50 grid h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border bg-surface px-4">
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-live animate-live" />
          <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-foreground">
            {liveTicker ? `Ao vivo · ${liveTicker.auctionTitle}` : "Pregão"}
          </span>
        </div>
        <div className="hidden gap-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground md:flex">
          {liveTicker ? (
            <>
              <span>Lote {liveTicker.currentLot}</span>
              <span className="text-primary">Lance {formatCurrency(liveTicker.currentBid)}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 font-mono text-[10px] uppercase tracking-[0.16em]">
        <Link to="/cadastro" className="text-muted-foreground transition-colors hover:text-primary">
          Cadastrar
        </Link>
        <Link to="/login" className="text-muted-foreground transition-colors hover:text-primary">
          Entrar
        </Link>
      </div>
    </div>
  );
}
