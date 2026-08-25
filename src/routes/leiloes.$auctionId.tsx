import { createFileRoute, notFound, Link } from "@tanstack/react-router";

import { CatalogButton } from "@/components/catalog/CatalogButton";
import { LotCard } from "@/components/catalog/LotCard";
import { StatusBadge } from "@/components/catalog/StatusBadge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { loadAuctionById, loadLotsByAuction } from "@/services";

export const Route = createFileRoute("/leiloes/$auctionId")({
  loader: async ({ params }) => {
    const auction = await loadAuctionById(params.auctionId);
    if (!auction) throw notFound();
    return { auction, lots: await loadLotsByAuction(auction.id) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Leilão indisponível — Terroir Remates" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { auction } = loaderData;
    const description = `${auction.offer} • ${auction.date} às ${auction.time} • ${auction.location}.`;
    return {
      meta: [
        { title: `${auction.title} — Terroir Remates` },
        { name: "description", content: description },
        { property: "og:title", content: `${auction.title} — Terroir Remates` },
        { property: "og:description", content: description },
      ],
    };
  },
  component: AuctionDetailPage,
});

function AuctionDetailPage() {
  const { auction, lots } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-end gap-10 px-4 py-16 md:grid-cols-12">
          <div className="animate-entry md:col-span-7">
            <div className="mb-4 flex items-center gap-4">
              <StatusBadge status={auction.status} />
              <Link to="/leiloes" className="eyebrow text-muted-foreground hover:text-foreground">
                ← Agenda
              </Link>
            </div>
            <h1 className="text-4xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl">
              {auction.title}
            </h1>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">{auction.summary}</p>
            <div className="mt-8 flex flex-wrap gap-8 border-l-2 border-primary pl-6 font-mono text-sm">
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Data</p>
                <p className="font-bold">
                  {auction.date} • {auction.time}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Local</p>
                <p className="font-bold uppercase">{auction.location}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Promotor</p>
                <p className="font-bold uppercase">{auction.promoter}</p>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <img
              src={auction.cover}
              alt={auction.title}
              width={1200}
              height={900}
              className="aspect-[4/3] w-full bg-surface-muted object-cover rounded-xl border border-border"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h2 className="mb-8 text-2xl font-black uppercase tracking-tighter">
              Catálogo do Remate — {lots.length} lote(s)
            </h2>
            {lots.length > 0 ? (
              <div className="grid gap-1 sm:grid-cols-2">
                {lots.map((lot, index) => (
                  <LotCard key={lot.id} lot={lot} delay={index * 40} />
                ))}
              </div>
            ) : (
              <p className="border border-border bg-surface p-8 text-sm text-muted-foreground">
                O catálogo desta edição será publicado em breve.
              </p>
            )}
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-surface p-6 rounded-xl border border-border">
              <h3 className="eyebrow mb-6 text-muted-foreground">Condições do Remate</h3>
              <ul className="space-y-4 text-sm leading-relaxed">
                {auction.terms.map((term) => (
                  <li key={term} className="border-l-2 border-primary pl-4">
                    {term}
                  </li>
                ))}
              </ul>
              <CatalogButton variant="accent" size="block" className="mt-8">
                Habilitar-se no Remate
              </CatalogButton>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Habilitação sujeita a análise cadastral
              </p>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}
