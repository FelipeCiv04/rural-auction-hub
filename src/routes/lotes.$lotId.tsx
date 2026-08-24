import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { CatalogButton } from "@/components/catalog/CatalogButton";
import { SpecGrid } from "@/components/catalog/SpecGrid";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { formatCurrency } from "@/lib/formatters";
import { getAuctionById, getLotById } from "@/services";
import { categoryLabels } from "@/types";

export const Route = createFileRoute("/lotes/$lotId")({
  loader: ({ params }) => {
    const lot = getLotById(params.lotId);
    if (!lot) throw notFound();
    return { lot, auction: getAuctionById(lot.auctionId) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Lote indisponível — Terroir Remates" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { lot } = loaderData;
    const description = `Lote ${lot.number} — ${lot.title}. ${lot.description}`;
    return {
      meta: [
        { title: `Lote ${lot.number} — ${lot.title} — Terroir Remates` },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:title", content: `Lote ${lot.number} — ${lot.title}` },
        { property: "og:description", content: description.slice(0, 155) },
      ],
    };
  },
  component: LotDetailPage,
});

function LotDetailPage() {
  const { lot, auction } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <Link to="/lotes" className="eyebrow text-muted-foreground hover:text-foreground">
            ← Catálogo
          </Link>
          {auction ? (
            <Link
              to="/leiloes/$auctionId"
              params={{ auctionId: auction.id }}
              className="eyebrow border-b border-foreground pb-0.5"
            >
              {auction.title}
            </Link>
          ) : null}
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="animate-entry lg:col-span-7">
            <img
              src={lot.image}
              alt={lot.title}
              width={1200}
              height={1200}
              className="aspect-square w-full bg-surface-muted object-cover ring-1 ring-black/5"
            />
            <div className="mt-10 bg-surface p-6 ring-1 ring-black/[0.05]">
              <h2 className="eyebrow mb-4 text-muted-foreground">Descrição Técnica</h2>
              <p className="leading-relaxed">{lot.description}</p>
              <SpecGrid specs={lot.specs} columns={4} className="mt-8" />
            </div>
          </div>

          <div className="lg:col-span-5">
            <span className="mb-2 block font-mono text-[10px] uppercase tracking-tighter text-muted-foreground">
              Lote #{lot.number} • {categoryLabels[lot.category]}
            </span>
            <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-5xl">
              {lot.title}
            </h1>

            <div className="mt-8 border-l-2 border-primary bg-surface p-6">
              <p className="meta-label">{lot.bidLabel}</p>
              <p className="mt-1 text-3xl font-black tracking-tighter text-accent">
                {lot.currentBid ? formatCurrency(lot.currentBid) : "Sob Consulta"}
              </p>
              {lot.increment > 0 ? (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Incremento mínimo {formatCurrency(lot.increment)}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-2">
                <CatalogButton variant="accent" size="block">
                  Dar Lance
                </CatalogButton>
                <CatalogButton variant="outline" size="block">
                  Falar com Consultor
                </CatalogButton>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Pregão demonstrativo — lances não são processados nesta etapa
              </p>
            </div>

            <div className="mt-8 bg-surface p-6 ring-1 ring-black/[0.05]">
              <h2 className="eyebrow mb-4 text-muted-foreground">Vendedor</h2>
              <p className="text-sm font-bold uppercase">{lot.seller}</p>
            </div>

            <div className="mt-8 bg-surface p-6 ring-1 ring-black/[0.05]">
              <h2 className="eyebrow mb-4 text-muted-foreground">Histórico de Lances</h2>
              {lot.bidHistory.length > 0 ? (
                <ul className="divide-y divide-border font-mono text-xs">
                  {lot.bidHistory.map((bid) => (
                    <li key={`${bid.bidder}-${bid.amount}`} className="flex justify-between py-3">
                      <span className="text-muted-foreground">{bid.bidder}</span>
                      <span className="font-bold">{formatCurrency(bid.amount)}</span>
                      <span className="text-muted-foreground">{bid.at}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum lance registrado.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
