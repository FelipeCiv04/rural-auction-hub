import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import { StatusBadge } from "./StatusBadge";
import type { Auction } from "@/types";

export function AuctionCard({ auction, delay = 0 }: { auction: Auction; delay?: number }) {
  return (
    <Link
      to="/leiloes/$auctionId"
      params={{ auctionId: auction.id }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all animate-entry hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative overflow-hidden">
        <img
          src={auction.cover}
          alt={auction.title}
          loading="lazy"
          width={800}
          height={450}
          className="aspect-video w-full bg-surface-muted object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-background/10 to-transparent" />
        <div className="absolute left-4 top-4">
          <StatusBadge status={auction.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <CalendarDays className="size-3 shrink-0" />
          <span className="truncate">
            {auction.date} · {auction.time}
          </span>
        </div>
        <h3 className="mb-3 font-display text-xl font-extrabold leading-tight">{auction.title}</h3>
        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{auction.location}</span>
        </div>
        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="min-w-0">
            <p className="meta-label">Oferta</p>
            <p className="truncate text-sm font-semibold">{auction.offer}</p>
          </div>
          <div className="min-w-0">
            <p className="meta-label">Promotor</p>
            <p className="truncate text-sm font-semibold">{auction.promoter}</p>
          </div>
        </div>
        <span className="mt-4 inline-flex items-center gap-1.5 eyebrow text-primary">
          Ver leilão
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
