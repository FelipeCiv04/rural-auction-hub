import { createFileRoute, Link } from "@tanstack/react-router";

import heroTouro from "@/assets/hero-touro.jpg";
import martelo from "@/assets/martelo.jpg";
import { AuctionCard } from "@/components/catalog/AuctionCard";
import { CatalogButton } from "@/components/catalog/CatalogButton";
import { LotCard } from "@/components/catalog/LotCard";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { loadAuctionById, loadFeaturedLots, loadUpcomingAuctions } from "@/services";

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
  loader: async () => ({
    upcoming: await loadUpcomingAuctions(3),
    featured: await loadFeaturedLots(),
    highlight: await loadAuctionById("liquidacao-genetica-prime"),
  }),
  component: HomePage,
});

function HomePage() {
  const { upcoming, featured, highlight: loadedHighlight } = Route.useLoaderData();
  // O banner destaca sempre a "Liquidação Genética Prime".
  const highlight = loadedHighlight ?? upcoming[0];

  if (!highlight) return null;

  return (
    <SiteLayout>
      {/* Banner principal */}
      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroTouro}
          alt="Touro Angus em pavilhão de remate"
          width={1200}
          height={1504}
          className="absolute inset-0 size-full object-cover object-center opacity-45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
          <div className="max-w-3xl animate-entry">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
              Próximo grande evento
            </p>
            <h1 className="mb-6 font-display text-5xl font-black leading-[0.98] md:text-7xl">
              Liquidação <span className="text-gradient-ember">Genética</span> Prime
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Remates de bovinos e caprinos de alto padrão com catálogo digital, ficha técnica
              completa e transmissão de pregão ao vivo.
            </p>
            <div className="mb-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "Data", value: highlight.date },
                { label: "Local", value: highlight.location },
                { label: "Oferta", value: highlight.offer },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-0 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur"
                >
                  <p className="meta-label">{item.label}</p>
                  <p className="truncate text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/leiloes/$auctionId" params={{ auctionId: highlight.id }}>
                <CatalogButton variant="solid">Ver catálogo digital</CatalogButton>
              </Link>
              <Link to="/lotes">
                <CatalogButton variant="outline">Explorar lotes</CatalogButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos leilões */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                Agenda
              </p>
              <h2 className="font-display text-3xl font-black md:text-4xl">Próximos leilões</h2>
            </div>
            <Link to="/leiloes" className="eyebrow shrink-0 text-primary hover:underline">
              Ver agenda
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((auction, index) => (
              <AuctionCard key={auction.id} auction={auction} delay={100 + index * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Lotes em destaque */}
      <section className="border-y border-border bg-surface/40 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
            <div className="min-w-0">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary">
                Catálogo
              </p>
              <h2 className="font-display text-3xl font-black md:text-4xl">Lotes em destaque</h2>
            </div>
            <Link to="/lotes" className="eyebrow shrink-0 text-primary hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((lot, index) => (
              <LotCard key={lot.id} lot={lot} delay={100 + index * 80} />
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
