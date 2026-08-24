import { createFileRoute } from "@tanstack/react-router";

import { AuctionCard } from "@/components/catalog/AuctionCard";
import { PageIntro } from "@/components/catalog/PageIntro";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { getAuctions, statusLabels, type AuctionStatus } from "@/data/catalog";

export const Route = createFileRoute("/leiloes/")({
  head: () => ({
    meta: [
      { title: "Agenda de Leilões Rurais — Terroir Remates" },
      {
        name: "description",
        content:
          "Calendário completo de remates de gado, genética e imóveis rurais, com local, oferta e promotor de cada evento.",
      },
      { property: "og:title", content: "Agenda de Leilões Rurais — Terroir Remates" },
      {
        property: "og:description",
        content: "Todos os remates agendados, ao vivo e encerrados da Terroir Remates.",
      },
    ],
  }),
  component: AuctionsPage,
});

const groups: AuctionStatus[] = ["ao-vivo", "agendado", "encerrado"];

function AuctionsPage() {
  const auctions = getAuctions();

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Calendário"
        title="Agenda de Remates"
        description="Cada evento reúne um catálogo próprio de lotes com ficha técnica, condições de pagamento e promotor responsável."
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        {groups.map((status) => {
          const items = auctions.filter((auction) => auction.status === status);
          if (items.length === 0) return null;

          return (
            <section key={status} className="mb-16 last:mb-0">
              <h2 className="eyebrow mb-6 border-b border-border pb-3 text-muted-foreground">
                {statusLabels[status]} — {items.length}
              </h2>
              <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((auction, index) => (
                  <AuctionCard key={auction.id} auction={auction} delay={index * 50} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </SiteLayout>
  );
}
