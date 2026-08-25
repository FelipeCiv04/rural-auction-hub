import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { CatalogButton } from "@/components/catalog/CatalogButton";
import { SpecGrid } from "@/components/catalog/SpecGrid";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { formatCurrency } from "@/lib/formatters";
import { getBidState, loadAuctionById, loadLotById, placeBid } from "@/services";
import { addFavoriteLot, getFavoriteLotIds, removeFavoriteLot } from "@/services";
import type { BidHistoryItem } from "@/types/lot";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { categoryLabels } from "@/types";

export const Route = createFileRoute("/lotes/$lotId")({
  loader: async ({ params }) => {
    const lot = await loadLotById(params.lotId);
    if (!lot) throw notFound();
    return { lot, auction: await loadAuctionById(lot.auctionId) };
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
  const { user } = useAuth();
  const [currentBid, setCurrentBid] = useState(lot.currentBid);
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>(lot.bidHistory);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [bidLoading, setBidLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const minimumBid = (currentBid ?? 0) + lot.increment;

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    void getBidState(lot.id)
      .then((state) => {
        setCurrentBid(state.currentBid);
        setBidHistory(state.history);
      })
      .catch((error: unknown) => {
        console.error("[bid] failed to load bid state:", error);
        setBidError("Não foi possível carregar o histórico de lances.");
      });
  }, [lot.id]);

  useEffect(() => {
    if (!user) return;
    void getFavoriteLotIds(user.id)
      .then((favoriteIds) => setIsFavorite(favoriteIds.includes(lot.id)))
      .catch((error: unknown) => console.error("[account] failed to load favorite state:", error));
  }, [lot.id, user]);

  async function handleFavoriteToggle() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavoriteLot(user.id, lot.id);
        setIsFavorite(false);
      } else {
        await addFavoriteLot(user.id, lot.id);
        setIsFavorite(true);
      }
    } catch (error: unknown) {
      console.error("[account] failed to update favorite:", error);
      setBidError("Não foi possível atualizar os lotes acompanhados.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handlePlaceBid() {
    if (!user) {
      window.location.href = "/login";
      return;
    }

    const amount = Number(bidAmount);
    setBidError(null);
    setBidSuccess(null);

    if (!Number.isFinite(amount) || amount <= 0) {
      setBidError("Informe um valor de lance válido.");
      return;
    }
    if (amount < minimumBid) {
      setBidError(`O valor mínimo para este lance é ${formatCurrency(minimumBid)}.`);
      return;
    }
    if (auction?.status !== "ao-vivo") {
      setBidError("Este leilão não está aceitando lances.");
      return;
    }

    setBidLoading(true);
    try {
      await placeBid(lot.id, amount);
      const state = await getBidState(lot.id);
      setCurrentBid(state.currentBid);
      setBidHistory(state.history);
      setBidAmount("");
      setBidSuccess("Lance registrado com sucesso.");
    } catch (error: unknown) {
      console.error("[bid] failed to place bid:", error);
      const message = error instanceof Error ? error.message : "";
      if (message.includes("BID_BELOW_MINIMUM:")) {
        const minimum = Number(message.split(":")[1]);
        setBidError(
          `O valor mínimo para este lance é ${formatCurrency(Number.isFinite(minimum) ? minimum : minimumBid)}.`,
        );
      } else if (message.includes("AUCTION_NOT_OPEN")) {
        setBidError("Este leilão já está encerrado ou não está aceitando lances.");
      } else if (message.includes("LOT_NOT_FOUND")) {
        setBidError("Este lote não está disponível.");
      } else if (message.includes("AUTHENTICATION_REQUIRED")) {
        setBidError("Você precisa estar logado para dar um lance.");
      } else {
        setBidError("Não foi possível registrar o lance. Tente novamente.");
      }
    } finally {
      setBidLoading(false);
    }
  }

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
              className="aspect-square w-full bg-surface-muted object-cover rounded-xl border border-border"
            />
            <div className="mt-10 bg-surface p-6 rounded-xl border border-border">
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
                {currentBid ? formatCurrency(currentBid) : "Sob Consulta"}
              </p>
              {lot.increment > 0 ? (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Incremento mínimo {formatCurrency(lot.increment)}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-2">
                <CatalogButton
                  variant="outline"
                  size="block"
                  type="button"
                  onClick={() => void handleFavoriteToggle()}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading
                    ? "Atualizando..."
                    : isFavorite
                      ? "Remover dos acompanhados"
                      : "Acompanhar lote"}
                </CatalogButton>
                <label className="meta-label" htmlFor="bid-amount">
                  Próximo lance mínimo: {formatCurrency(minimumBid)}
                </label>
                <input
                  id="bid-amount"
                  type="number"
                  min={minimumBid}
                  step="0.01"
                  value={bidAmount}
                  onChange={(event) => setBidAmount(event.target.value)}
                  placeholder={minimumBid.toFixed(2)}
                  className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                  disabled={bidLoading}
                />
                <CatalogButton
                  variant="accent"
                  size="block"
                  type="button"
                  onClick={() => void handlePlaceBid()}
                  disabled={bidLoading || auction?.status !== "ao-vivo"}
                >
                  {bidLoading ? "Registrando..." : "Dar Lance"}
                </CatalogButton>
                <CatalogButton variant="outline" size="block">
                  Falar com Consultor
                </CatalogButton>
              </div>
              {bidError ? <p className="mt-3 text-sm text-destructive">{bidError}</p> : null}
              {bidSuccess ? <p className="mt-3 text-sm text-primary">{bidSuccess}</p> : null}
            </div>

            <div className="mt-8 bg-surface p-6 rounded-xl border border-border">
              <h2 className="eyebrow mb-4 text-muted-foreground">Vendedor</h2>
              <p className="text-sm font-bold uppercase">{lot.seller}</p>
            </div>

            <div className="mt-8 bg-surface p-6 rounded-xl border border-border">
              <h2 className="eyebrow mb-4 text-muted-foreground">Histórico de Lances</h2>
              {bidHistory.length > 0 ? (
                <ul className="divide-y divide-border font-mono text-xs">
                  {bidHistory.map((bid) => (
                    <li
                      key={`${bid.bidder}-${bid.amount}-${bid.at}`}
                      className="flex justify-between py-3"
                    >
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
