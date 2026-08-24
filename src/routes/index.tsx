import { createFileRoute, Link } from "@tanstack/react-router";

import heroTouro from "@/assets/hero-touro.jpg";
import martelo from "@/assets/martelo.jpg";
import { AuctionCard } from "@/components/catalog/AuctionCard";
import { CatalogButton } from "@/components/catalog/CatalogButton";
import { LotCard } from "@/components/catalog/LotCard";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getFeaturedLots, getUpcomingAuctions } from "@/data/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terroir Remates — Leilões de Gado e Propriedades Rurais" },
      {
        name: "description",
        content:
          "Plataforma de leilões rurais: remates de touros, matrizes, recria e imóveis rurais com catálogo digital e dados técnicos de cada lote.",
      },
      { property: "og:title", content: "Terroir Remates — Leilões Rurais" },
      {
        property: "og:description",
        content:
          "Catálogo digital de leilões de gado e propriedades rurais, com fichas técnicas completas de cada lote.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const upcoming = getUpcomingAuctions(3);
  const featured = getFeaturedLots();
  const highlight = upcoming[0]!;

  return (
    <SiteLayout>
      {/* Banner principal */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="animate-entry md:col-span-7">
            <div className="mb-4 inline-flex items-center gap-2 bg-primary/10 px-2 py-1 text-primary">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest">
                Próximo Grande Evento
              </span>
            </div>
            <h2 className="mb-6 text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl">
              Liquidação
              <br />
              <span className="text-muted-foreground/25">Genética</span> Prime
            </h2>
            <div className="flex flex-wrap gap-8 border-l-2 border-primary pl-6 font-mono text-sm">
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Data</p>
                <p className="font-bold">{highlight.date}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Local</p>
                <p className="font-bold uppercase">{highlight.location}</p>
              </div>
              <div>
                <p className="mb-1 text-[10px] uppercase text-muted-foreground">Oferta</p>
                <p className="font-bold uppercase">{highlight.offer}</p>
              </div>
            </div>
          </div>
          <div className="animate-entry [animation-delay:150ms] md:col-span-5">
            <div className="relative overflow-hidden ring-1 ring-black/5">
              <img
                src={heroTouro}
                alt="Touro Angus em pavilhão de remate"
                width={1200}
                height={1504}
                className="aspect-[4/5] w-full bg-surface-muted object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                <Link to="/leiloes/$auctionId" params={{ auctionId: highlight.id }}>
                  <CatalogButton variant="outline" size="block" className="border-none bg-surface">
                    Ver Catálogo Digital
                  </CatalogButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos leilões */}
      <section className="border-y border-border bg-surface-muted py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-end justify-between gap-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Próximos Leilões</h3>
            <Link to="/leiloes" className="eyebrow border-b border-foreground pb-0.5">
              Ver agenda completa
            </Link>
          </div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((auction, index) => (
              <AuctionCard key={auction.id} auction={auction} delay={200 + index * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* Lotes em destaque */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 flex items-end justify-between gap-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Lotes em Destaque</h3>
            <Link to="/lotes" className="eyebrow border-b border-foreground pb-0.5">
              Ver todos os lotes
            </Link>
          </div>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((lot, index) => (
              <LotCard key={lot.id} lot={lot} delay={200 + index * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* Institucional */}
      <section className="mx-auto max-w-7xl px-4 py-32">
        <div className="grid gap-16 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              História &amp; Tradição
            </h2>
            <h3 className="mb-8 text-5xl font-black uppercase leading-[0.9] tracking-tighter">
              Onde a martelada encontra a confiança.
            </h3>
            <p className="mb-6 max-w-md leading-relaxed text-muted-foreground">
              Há mais de três décadas, transformamos o mercado de leilões rurais em uma plataforma
              de precisão genética e transparência comercial. Unimos a tradição do campo com a
              tecnologia do pregão digital.
            </p>
            <div className="flex flex-wrap gap-4">
              <CatalogButton variant="solid">Nossa História</CatalogButton>
              <CatalogButton variant="outline">Relatório Anual</CatalogButton>
            </div>
          </div>
          <div className="relative">
            <img
              src={martelo}
              alt="Martelo de leilão sobre bloco de madeira"
              loading="lazy"
              width={1000}
              height={800}
              className="aspect-[4/3] w-full bg-surface-muted object-cover"
            />
            <div className="absolute -bottom-8 -left-4 max-w-[240px] bg-primary p-8 text-primary-foreground md:-left-8">
              <p className="text-3xl font-black tracking-tighter">+4.2k</p>
              <p className="font-mono text-[10px] uppercase tracking-widest opacity-80">
                Lotes arrematados este ano
              </p>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
