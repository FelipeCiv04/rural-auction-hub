import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { LotCard } from "@/components/catalog/LotCard";
import { CatalogButton } from "@/components/catalog/CatalogButton";
import { PageIntro } from "@/components/catalog/PageIntro";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { SiteLayoutTabs } from "@/components/catalog/SectionTabs";
import { formatCurrency } from "@/lib/formatters";
import {
  getFavoriteLots,
  getOwnBids,
  getUpcomingAuctions,
  removeFavoriteLot,
  updateOwnProfile,
  type BuyerBid,
} from "@/services";
import type { Lot } from "@/types/lot";
import { useAuth } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase";

import { Link } from "@tanstack/react-router";

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

function AccountPage() {
  const enrolled = getUpcomingAuctions(2);
  const { loading, user, profile, refreshProfile } = useAuth();
  const [watched, setWatched] = useState<Lot[]>([]);
  const [bids, setBids] = useState<BuyerBid[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", document: "", phone: "" });
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      full_name: profile?.full_name ?? "",
      document: profile?.document ?? "",
      phone: profile?.phone ?? "",
    });
  }, [profile, user]);

  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    setDataLoading(true);
    Promise.all([getFavoriteLots(user.id), getOwnBids(user.id)])
      .then(([favoriteLots, ownBids]) => {
        setWatched(favoriteLots);
        setBids(ownBids);
      })
      .catch((error: unknown) => {
        console.error("[account] failed to load buyer data:", error);
        setFeedback("Não foi possível carregar os dados da conta.");
      })
      .finally(() => setDataLoading(false));
  }, [user]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !profileForm.full_name.trim()) {
      setFeedback("Informe seu nome completo.");
      return;
    }

    setSavingProfile(true);
    setFeedback(null);
    try {
      await updateOwnProfile(user.id, {
        full_name: profileForm.full_name.trim(),
        document: profileForm.document.trim() || null,
        phone: profileForm.phone.trim() || null,
      });
      await refreshProfile();
      setFeedback("Dados cadastrais atualizados.");
    } catch (error: unknown) {
      console.error("[account] failed to update profile:", error);
      setFeedback("Não foi possível atualizar seus dados. Tente novamente.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRemoveFavorite(lot: Lot) {
    if (!user) return;
    try {
      await removeFavoriteLot(user.id, lot.id);
      setWatched((current) => current.filter((item) => item.id !== lot.id));
      setFeedback("Lote removido dos acompanhados.");
    } catch (error: unknown) {
      console.error("[account] failed to remove favorite:", error);
      setFeedback("Não foi possível remover o lote dos acompanhados.");
    }
  }

  const summary = [
    { label: "Habilitações Ativas", value: String(enrolled.length).padStart(2, "0") },
    { label: "Lances Registrados", value: String(bids.length).padStart(2, "0") },
    { label: "Lotes Acompanhados", value: String(watched.length).padStart(2, "0") },
    {
      label: "Investido no Ano",
      value: formatCurrency(bids.reduce((total, bid) => total + bid.amount, 0)),
    },
  ];

  if (loading) {
    return (
      <SiteLayout>
        <PageIntro eyebrow="Área do Comprador" title="Minha Conta" description="Carregando..." />
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <PageIntro
          eyebrow="Área do Comprador"
          title="Minha Conta"
          description="Você precisa estar autenticado para acessar sua conta."
        />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="mb-6">Faça login para acessar seus dados.</p>
          <Link
            to="/login"
            className="inline-block rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Entrar
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Área do Comprador"
        title="Minha Conta"
        description="Acompanhe seus lotes, lances e dados cadastrais."
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        {feedback ? <p className="mb-8 text-sm text-primary">{feedback}</p> : null}
        {dataLoading ? (
          <p className="mb-8 text-sm text-muted-foreground">Carregando dados da conta...</p>
        ) : null}
        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="bg-surface p-6 rounded-xl border border-border">
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
                <form className="grid gap-6 sm:grid-cols-2" onSubmit={handleProfileSubmit}>
                  <AccountField
                    label="Nome"
                    value={profileForm.full_name}
                    onChange={(value) => setProfileForm({ ...profileForm, full_name: value })}
                    required
                  />
                  <AccountField
                    label="Documento"
                    value={profileForm.document}
                    onChange={(value) => setProfileForm({ ...profileForm, document: value })}
                  />
                  <AccountField
                    label="E-mail"
                    value={user?.email ?? "-"}
                    onChange={() => undefined}
                    disabled
                  />
                  <AccountField
                    label="Telefone"
                    value={profileForm.phone}
                    onChange={(value) => setProfileForm({ ...profileForm, phone: value })}
                  />
                  <div className="sm:col-span-2">
                    <CatalogButton type="submit" variant="accent" disabled={savingProfile}>
                      {savingProfile ? "Salvando..." : "Salvar dados"}
                    </CatalogButton>
                  </div>
                </form>
              ),
            },
            {
              id: "lances",
              title: "Meus Lances",
              content:
                bids.length > 0 ? (
                  <ul className="divide-y divide-border font-mono text-xs">
                    {bids.map((bid) => (
                      <li key={bid.id} className="flex flex-wrap justify-between gap-3 py-3">
                        <span className="text-muted-foreground">{bid.bidder_alias}</span>
                        <span className="font-bold">{formatCurrency(bid.amount)}</span>
                        <span className="text-muted-foreground">
                          {new Date(bid.created_at).toLocaleString("pt-BR")}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum lance registrado.</p>
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
              <div key={lot.id}>
                <LotCard lot={lot} delay={index * 40} />
                <button
                  type="button"
                  className="mt-2 eyebrow text-destructive underline"
                  onClick={() => void handleRemoveFavorite(lot)}
                >
                  Remover acompanhamento
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}

function AccountField({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="meta-label mb-2 block">{label}</span>
      <input
        className="w-full border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-primary disabled:opacity-60"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
      />
    </label>
  );
}
