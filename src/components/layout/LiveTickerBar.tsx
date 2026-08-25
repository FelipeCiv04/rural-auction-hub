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
    <div className="sticky top-0 z-50 flex items-center justify-between gap-4 border-b border-white/10 bg-foreground px-4 py-2 text-background">
      <div className="flex min-w-0 items-center gap-6">
        <div className="flex min-w-0 items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-live animate-live" />
          <span className="truncate font-mono text-[11px] font-medium uppercase tracking-tighter">
            {liveTicker ? `Ao Vivo: ${liveTicker.auctionTitle}` : ""}
          </span>
        </div>
        <div className="hidden gap-4 font-mono text-[11px] text-background/50 md:flex">
          {liveTicker ? (
            <>
              <span>LOTE ATUAL: {liveTicker.currentLot}</span>
              <span>LANCE: {formatCurrency(liveTicker.currentBid)}</span>
            </>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-4 font-mono text-[10px] uppercase tracking-widest">
        <Link to="/cadastro" className="transition-colors hover:text-primary">
          Cadastrar
        </Link>
        <Link to="/login" className="transition-colors hover:text-primary">
          Entrar
        </Link>
      </div>
    </div>
  );
}
