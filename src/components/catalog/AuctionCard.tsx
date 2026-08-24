import { Link } from "@tanstack/react-router";

import { StatusBadge } from "./StatusBadge";
import type { Auction } from "@/types";

export function AuctionCard({ auction, delay = 0 }: { auction: Auction; delay?: number }) {
  return (
    <Link
      to="/leiloes/$auctionId"
      params={{ auctionId: auction.id }}
      className="group flex flex-col bg-surface ring-1 ring-black/[0.05] transition-all animate-entry hover:ring-primary/30"
      style={{ animationDelay: `${delay}ms` }}
    >
      <img
        src={auction.cover}
        alt={auction.title}
        loading="lazy"
        width={800}
        height={450}
        className="aspect-video w-full bg-surface-muted object-cover grayscale transition-all group-hover:grayscale-0"
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="mb-1 block font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">
              {auction.date} • {auction.time}
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight">{auction.title}</h3>
          </div>
          <StatusBadge status={auction.status} className="shrink-0" />
        </div>
        <div className="mt-auto grid grid-cols-2 gap-y-4 border-t border-border pt-4">
          <div>
            <p className="meta-label">Local</p>
            <p className="text-sm font-bold">{auction.location}</p>
          </div>
          <div>
            <p className="meta-label">Oferta</p>
            <p className="text-sm font-bold">{auction.offer}</p>
          </div>
          <div className="col-span-2">
            <p className="meta-label">Promotor</p>
            <p className="text-sm font-bold">{auction.promoter}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
