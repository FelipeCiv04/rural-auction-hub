import { createFileRoute } from "@tanstack/react-router";

import { LotCard } from "@/components/catalog/LotCard";
import { PageIntro } from "@/components/catalog/PageIntro";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SiteLayoutTabs } from "@/components/catalog/SectionTabs";
import { formatCurrency, getFeaturedLots, getUpcomingAuctions } from "@/data/catalog";

export const Route = createFileRoute("/minha-conta")({
  head: () => ({
    meta: [
      { title: "Minha Conta — Terroir Remates" },
      {
        name: "description",
        content:
          "Acompanhe habilitações, lances registrados e lotes favoritos da sua conta na plataforma de leilões rurais.",
      },
      { property: "og:title", content: "Minha Conta — Terroir Remates" },
      {
        property: "og:description",
        content: "Painel do comprador: habilitações, lances e lotes acompanhados.",
      },
    ],
  }),
  component: AccountPage,
});

const summary = [
  { label: "Habilitações Ativas", value: "02" },
  { label: "Lances Registrados", value: "07" },
  { label: "Lotes Arrematados", value: "01" },
  { label: "Investido no Ano", value: formatCurrency(184500) },
];

function AccountPage() {
  const watched = getFeaturedLots().slice(0, 2);
  const enrolled = getUpcomingAuctions(2);

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Área do Comprador"
        title="Minha Conta"
        description="Dados demonstrativos. Nesta etapa a plataforma ainda não persiste informações reais."
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="bg-surface p-6 ring-1 ring-black/[0.05]">
              <p className="meta-label">{item.label}</p>
              <p className="mt-2 text-3xl font-black tracking-tighter">{item.value}</p>
            </div>
          ))}
        </div>

        <SiteLayoutTabs
          sections={[
            {
              id: "habilitacoes",
              title: "Habilitações",
              content: (
                <ul className="divide-y divide-border">
                  {enrolled.map((auction) => (
                    <li
                      key={auction.id}
                      className="flex flex-wrap items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <p className="text-sm font-bold uppercase">{auction.title}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {auction.date} • {auction.location}
                        </p>
                      </div>
                      <span className="border border-primary px-2 py-0.5 font-mono text-[10px] uppercase text-primary">
                        Aprovada
                      </span>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "dados",
              title: "Dados Cadastrais",
              content: (
                <dl className="grid gap-6 sm:grid-cols-2">
                  {[
                    ["Nome", "João da Silva"],
                    ["Documento", "000.000.000-00"],
                    ["E-mail", "joao@fazendaboavista.com.br"],
                    ["Telefone", "(67) 90000-0000"],
                    ["Propriedade", "Fazenda Boa Vista"],
                    ["Estado", "MS"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="meta-label">{label}</dt>
                      <dd className="text-sm font-bold">{value}</dd>
                    </div>
                  ))}
                </dl>
              ),
            },
          ]}
        />

        <section className="mt-16">
          <h2 className="eyebrow mb-6 border-b border-border pb-3 text-muted-foreground">
            Lotes Acompanhados
          </h2>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
            {watched.map((lot, index) => (
              <LotCard key={lot.id} lot={lot} delay={index * 40} />
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
