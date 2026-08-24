import { createFileRoute, Link } from "@tanstack/react-router";

import { CatalogButton } from "@/components/catalog/CatalogButton";
import { PageIntro } from "@/components/catalog/PageIntro";
import { StatusBadge } from "@/components/catalog/StatusBadge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { categoryLabels, formatCurrency, getAuctions, getLots } from "@/data/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Terroir Remates" },
      {
        name: "description",
        content:
          "Painel de gestão de remates, lotes e habilitações da plataforma de leilões rurais Terroir Remates.",
      },
      { property: "og:title", content: "Painel Administrativo — Terroir Remates" },
      {
        property: "og:description",
        content: "Gestão de remates, catálogo de lotes e cadastro de compradores.",
      },
    ],
  }),
  component: AdminPage,
});

const metrics = [
  { label: "Remates Ativos", value: "03" },
  { label: "Lotes Publicados", value: "06" },
  { label: "Cadastros Pendentes", value: "12" },
  { label: "Volume Transacionado", value: formatCurrency(1284500) },
];

function AdminPage() {
  const auctions = getAuctions();
  const lots = getLots();

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Operação"
        title="Painel Administrativo"
        description="Estrutura preparada para receber gestão real de remates, lotes e habilitações."
        aside={<CatalogButton variant="accent">Novo Remate</CatalogButton>}
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-surface p-6 ring-1 ring-black/[0.05]">
              <p className="meta-label">{metric.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tighter">{metric.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="eyebrow mb-6 border-b border-border pb-3 text-muted-foreground">
            Remates
          </h2>
          <div className="overflow-x-auto bg-surface ring-1 ring-black/[0.05]">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="meta-label px-6 py-4">Remate</th>
                  <th className="meta-label px-6 py-4">Data</th>
                  <th className="meta-label px-6 py-4">Local</th>
                  <th className="meta-label px-6 py-4">Status</th>
                  <th className="meta-label px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {auctions.map((auction) => (
                  <tr key={auction.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-bold uppercase">{auction.title}</td>
                    <td className="px-6 py-4 font-mono text-xs">{auction.date}</td>
                    <td className="px-6 py-4 font-mono text-xs">{auction.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={auction.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/leiloes/$auctionId"
                        params={{ auctionId: auction.id }}
                        className="eyebrow border-b border-foreground pb-0.5"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="eyebrow mb-6 border-b border-border pb-3 text-muted-foreground">Lotes</h2>
          <div className="overflow-x-auto bg-surface ring-1 ring-black/[0.05]">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="meta-label px-6 py-4">Lote</th>
                  <th className="meta-label px-6 py-4">Categoria</th>
                  <th className="meta-label px-6 py-4">Vendedor</th>
                  <th className="meta-label px-6 py-4">Valor</th>
                  <th className="meta-label px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => (
                  <tr key={lot.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-bold uppercase">
                      #{lot.number} — {lot.title}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs uppercase">
                      {categoryLabels[lot.category]}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{lot.seller}</td>
                    <td className="px-6 py-4 font-mono text-xs font-bold">
                      {lot.currentBid ? formatCurrency(lot.currentBid) : "Sob consulta"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to="/lotes/$lotId"
                        params={{ lotId: lot.id }}
                        className="eyebrow border-b border-foreground pb-0.5"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
