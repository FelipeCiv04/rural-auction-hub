import { createFileRoute } from "@tanstack/react-router";

import { LotCard } from "@/components/catalog/LotCard";
import { PageIntro } from "@/components/catalog/PageIntro";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { loadLots } from "@/services";

export const Route = createFileRoute("/lotes/")({
  head: () => ({
    meta: [
      { title: "Lotes Disponíveis — Terroir Remates" },
      {
        name: "description",
        content:
          "Catálogo de lotes em oferta: touros e matrizes de elite, recria comercial e propriedades rurais com dados técnicos completos.",
      },
      { property: "og:title", content: "Lotes Disponíveis — Terroir Remates" },
      {
        property: "og:description",
        content: "Explore os lotes em oferta nos próximos remates rurais.",
      },
    ],
  }),
  loader: () => loadLots(),
  component: LotsPage,
});

function LotsPage() {
  const lots = Route.useLoaderData();

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Catálogo"
        title="Lotes Disponíveis"
        description="Fichas com raça, peso, idade e índices zootécnicos aferidos no parque de remate."
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {lots.map((lot, index) => (
            <LotCard key={lot.id} lot={lot} delay={index * 40} />
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
