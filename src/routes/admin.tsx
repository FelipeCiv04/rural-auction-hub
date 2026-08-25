import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { CatalogButton } from "@/components/catalog/CatalogButton";
import { PageIntro } from "@/components/catalog/PageIntro";
import { StatusBadge } from "@/components/catalog/StatusBadge";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { formatCurrency } from "@/lib/formatters";
import {
  createAuction,
  createLot,
  deleteAuction,
  deleteLot,
  listAuctionsAdmin,
  listLotsAdmin,
  updateAuction,
  updateLot,
  type AuctionInsert,
  type AuctionRow,
  type LotInsert,
  type LotRow,
} from "@/services";
import { useAuth } from "@/lib/auth";
import { categoryLabels, statusLabels, type AuctionStatus, type LotCategory } from "@/types";

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

const auctionStatuses: AuctionStatus[] = ["ao-vivo", "agendado", "encerrado"];
const lotCategories: LotCategory[] = ["elite", "comercial", "imovel"];

type AuctionForm = {
  code: string;
  title: string;
  status: AuctionStatus;
  starts_at: string;
  location: string;
  offer: string;
  promoter: string;
  cover_url: string;
  summary: string;
  terms: string;
};

type LotForm = {
  auction_id: string;
  number: string;
  title: string;
  category: LotCategory;
  image_url: string;
  current_bid: string;
  bid_label: string;
  increment: string;
  description: string;
  seller: string;
  is_featured: boolean;
};

const emptyAuction: AuctionForm = {
  code: "",
  title: "",
  status: "agendado",
  starts_at: "",
  location: "",
  offer: "",
  promoter: "",
  cover_url: "",
  summary: "",
  terms: "",
};

const emptyLot: LotForm = {
  auction_id: "",
  number: "",
  title: "",
  category: "comercial",
  image_url: "",
  current_bid: "",
  bid_label: "Lance Atual",
  increment: "0",
  description: "",
  seller: "",
  is_featured: false,
};

function inputDateValue(value: string) {
  return value ? value.slice(0, 16) : "";
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function AdminPage() {
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [auctionForm, setAuctionForm] = useState<AuctionForm>(emptyAuction);
  const [lotForm, setLotForm] = useState<LotForm>(emptyLot);
  const [editingAuctionId, setEditingAuctionId] = useState<string | null>(null);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState<"auction" | "lot" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const { loading, user, role } = useAuth();

  async function loadAdminData() {
    setLoadingData(true);
    try {
      const [auctionRows, lotRows] = await Promise.all([listAuctionsAdmin(), listLotsAdmin()]);
      setAuctions(auctionRows);
      setLots(lotRows);
    } catch (error) {
      console.error("[admin] failed to load data:", error);
      setFeedback({ type: "error", text: "Não foi possível carregar os dados administrativos." });
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    if (!loading && user && role === "admin") void loadAdminData();
  }, [loading, role, user]);

  function resetAuctionForm() {
    setAuctionForm(emptyAuction);
    setEditingAuctionId(null);
  }

  function resetLotForm() {
    setLotForm(emptyLot);
    setEditingLotId(null);
  }

  function editAuction(auction: AuctionRow) {
    setEditingAuctionId(auction.id);
    setAuctionForm({
      code: auction.code,
      title: auction.title,
      status: auction.status,
      starts_at: inputDateValue(auction.starts_at),
      location: auction.location,
      offer: auction.offer,
      promoter: auction.promoter,
      cover_url: auction.cover_url ?? "",
      summary: auction.summary,
      terms: auction.terms.join("\n"),
    });
    setFeedback(null);
  }

  function editLot(lot: LotRow) {
    setEditingLotId(lot.id);
    setLotForm({
      auction_id: lot.auction_id,
      number: lot.number,
      title: lot.title,
      category: lot.category,
      image_url: lot.image_url ?? "",
      current_bid: lot.current_bid?.toString() ?? "",
      bid_label: lot.bid_label,
      increment: lot.increment.toString(),
      description: lot.description,
      seller: lot.seller,
      is_featured: lot.is_featured,
    });
    setFeedback(null);
  }

  async function handleAuctionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auctionForm.code.trim() || !auctionForm.title.trim() || !auctionForm.starts_at) {
      setFeedback({ type: "error", text: "Informe código, título e data do leilão." });
      return;
    }

    setSaving("auction");
    setFeedback(null);
    const payload: AuctionInsert = {
      code: auctionForm.code.trim(),
      title: auctionForm.title.trim(),
      status: auctionForm.status,
      starts_at: new Date(auctionForm.starts_at).toISOString(),
      location: auctionForm.location.trim(),
      offer: auctionForm.offer.trim(),
      promoter: auctionForm.promoter.trim(),
      cover_url: auctionForm.cover_url?.trim() || null,
      summary: auctionForm.summary.trim(),
      terms: auctionForm.terms
        .split("\n")
        .map((term) => term.trim())
        .filter(Boolean),
    };

    try {
      if (editingAuctionId) await updateAuction(editingAuctionId, payload);
      else await createAuction(payload);
      await loadAdminData();
      resetAuctionForm();
      setFeedback({
        type: "success",
        text: editingAuctionId ? "Leilão atualizado." : "Leilão criado.",
      });
    } catch (error) {
      console.error("[admin] auction save failed:", error);
      setFeedback({
        type: "error",
        text: errorMessage(
          error,
          "Não foi possível salvar o leilão. Verifique os dados e tente novamente.",
        ),
      });
    } finally {
      setSaving(null);
    }
  }

  async function handleLotSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!lotForm.auction_id || !lotForm.number.trim() || !lotForm.title.trim()) {
      setFeedback({
        type: "error",
        text: "Selecione um leilão e informe número e título do lote.",
      });
      return;
    }
    if (!auctions.some((auction) => auction.id === lotForm.auction_id)) {
      setFeedback({ type: "error", text: "O leilão selecionado não está disponível." });
      return;
    }

    setSaving("lot");
    setFeedback(null);
    const currentBid = lotForm.current_bid.trim() ? Number(lotForm.current_bid) : null;
    const increment = Number(lotForm.increment);
    if ((currentBid !== null && !Number.isFinite(currentBid)) || !Number.isFinite(increment)) {
      setFeedback({
        type: "error",
        text: "Informe valores numéricos válidos para os valores do lote.",
      });
      setSaving(null);
      return;
    }

    const payload: LotInsert = {
      auction_id: lotForm.auction_id,
      number: lotForm.number.trim(),
      title: lotForm.title.trim(),
      category: lotForm.category,
      image_url: lotForm.image_url?.trim() || null,
      current_bid: currentBid,
      bid_label: lotForm.bid_label.trim() || "Lance Atual",
      increment,
      description: lotForm.description.trim(),
      seller: lotForm.seller.trim(),
      is_featured: lotForm.is_featured,
    };

    try {
      if (editingLotId) await updateLot(editingLotId, payload);
      else await createLot(payload);
      await loadAdminData();
      resetLotForm();
      setFeedback({ type: "success", text: editingLotId ? "Lote atualizado." : "Lote criado." });
    } catch (error) {
      console.error("[admin] lot save failed:", error);
      setFeedback({
        type: "error",
        text: errorMessage(
          error,
          "Não foi possível salvar o lote. Verifique os dados e tente novamente.",
        ),
      });
    } finally {
      setSaving(null);
    }
  }

  async function handleDeleteAuction(auction: AuctionRow) {
    if (!window.confirm(`Excluir o leilão "${auction.title}"?`)) return;
    setDeletingId(auction.id);
    setFeedback(null);
    try {
      await deleteAuction(auction.id);
      await loadAdminData();
      if (editingAuctionId === auction.id) resetAuctionForm();
      setFeedback({ type: "success", text: "Leilão excluído." });
    } catch (error) {
      console.error("[admin] auction delete failed:", error);
      setFeedback({
        type: "error",
        text: "Não foi possível excluir o leilão. Verifique se há registros relacionados.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteLot(lot: LotRow) {
    if (!window.confirm(`Excluir o lote "${lot.title}"?`)) return;
    setDeletingId(lot.id);
    setFeedback(null);
    try {
      await deleteLot(lot.id);
      await loadAdminData();
      if (editingLotId === lot.id) resetLotForm();
      setFeedback({ type: "success", text: "Lote excluído." });
    } catch (error) {
      console.error("[admin] lot delete failed:", error);
      setFeedback({ type: "error", text: "Não foi possível excluir o lote. Tente novamente." });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <PageIntro eyebrow="Operação" title="Painel Administrativo" description="Carregando..." />
      </SiteLayout>
    );
  }

  if (!user || role !== "admin") {
    return (
      <SiteLayout>
        <PageIntro
          eyebrow="Operação"
          title="Acesso Negado"
          description="Você não possui permissões para acessar o painel administrativo."
        />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="mb-6">Esta área é restrita a administradores.</p>
          <Link
            to="/"
            className="inline-block rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            Voltar
          </Link>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageIntro
        eyebrow="Operação"
        title="Painel Administrativo"
        description="Gestão de remates e lotes armazenados no Supabase."
        aside={
          <CatalogButton variant="accent" onClick={resetAuctionForm}>
            Novo Remate
          </CatalogButton>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-16">
        {feedback && (
          <p
            className={
              feedback.type === "error"
                ? "mb-8 text-sm text-destructive"
                : "mb-8 text-sm text-primary"
            }
          >
            {feedback.text}
          </p>
        )}
        {loadingData && <p className="mb-8 text-sm text-muted-foreground">Carregando dados...</p>}

        <section className="space-y-8">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <h2 className="eyebrow text-muted-foreground">Remates</h2>
            <span className="font-mono text-xs text-muted-foreground">
              {auctions.length} registros
            </span>
          </div>
          <form
            className="grid gap-4 bg-surface p-6 rounded-xl border border-border md:grid-cols-2"
            onSubmit={handleAuctionSubmit}
          >
            <h3 className="eyebrow md:col-span-2">
              {editingAuctionId ? "Editar remate" : "Novo remate"}
            </h3>
            <AdminField
              label="Código"
              value={auctionForm.code}
              onChange={(value) => setAuctionForm({ ...auctionForm, code: value })}
              required
            />
            <AdminField
              label="Título"
              value={auctionForm.title}
              onChange={(value) => setAuctionForm({ ...auctionForm, title: value })}
              required
            />
            <AdminField
              label="Início"
              type="datetime-local"
              value={auctionForm.starts_at}
              onChange={(value) => setAuctionForm({ ...auctionForm, starts_at: value })}
              required
            />
            <AdminSelect
              label="Status"
              value={auctionForm.status}
              options={auctionStatuses.map((status) => ({
                value: status,
                label: statusLabels[status],
              }))}
              onChange={(value) =>
                setAuctionForm({ ...auctionForm, status: value as AuctionStatus })
              }
            />
            <AdminField
              label="Local"
              value={auctionForm.location ?? ""}
              onChange={(value) => setAuctionForm({ ...auctionForm, location: value })}
            />
            <AdminField
              label="Oferta"
              value={auctionForm.offer ?? ""}
              onChange={(value) => setAuctionForm({ ...auctionForm, offer: value })}
            />
            <AdminField
              label="Promotor"
              value={auctionForm.promoter ?? ""}
              onChange={(value) => setAuctionForm({ ...auctionForm, promoter: value })}
            />
            <AdminField
              label="URL da capa"
              value={auctionForm.cover_url ?? ""}
              onChange={(value) => setAuctionForm({ ...auctionForm, cover_url: value })}
            />
            <AdminTextArea
              label="Resumo"
              value={auctionForm.summary ?? ""}
              onChange={(value) => setAuctionForm({ ...auctionForm, summary: value })}
            />
            <AdminTextArea
              label="Termos (um por linha)"
              value={auctionForm.terms}
              onChange={(value) => setAuctionForm({ ...auctionForm, terms: value })}
            />
            <div className="flex gap-3 md:col-span-2">
              <CatalogButton type="submit" variant="accent" disabled={saving !== null}>
                {saving === "auction"
                  ? "Salvando..."
                  : editingAuctionId
                    ? "Salvar alterações"
                    : "Criar remate"}
              </CatalogButton>
              {editingAuctionId && (
                <CatalogButton type="button" variant="outline" onClick={resetAuctionForm}>
                  Cancelar
                </CatalogButton>
              )}
            </div>
          </form>
          <AdminAuctionTable
            auctions={auctions}
            deletingId={deletingId}
            onEdit={editAuction}
            onDelete={handleDeleteAuction}
          />
        </section>

        <section className="mt-16 space-y-8">
          <div className="flex items-end justify-between border-b border-border pb-3">
            <h2 className="eyebrow text-muted-foreground">Lotes</h2>
            <span className="font-mono text-xs text-muted-foreground">{lots.length} registros</span>
          </div>
          <form
            className="grid gap-4 bg-surface p-6 rounded-xl border border-border md:grid-cols-2"
            onSubmit={handleLotSubmit}
          >
            <h3 className="eyebrow md:col-span-2">{editingLotId ? "Editar lote" : "Novo lote"}</h3>
            <AdminSelect
              label="Leilão"
              value={lotForm.auction_id}
              options={auctions.map((auction) => ({
                value: auction.id,
                label: `${auction.code} — ${auction.title}`,
              }))}
              onChange={(value) => setLotForm({ ...lotForm, auction_id: value })}
              required
            />
            <AdminField
              label="Número"
              value={lotForm.number}
              onChange={(value) => setLotForm({ ...lotForm, number: value })}
              required
            />
            <AdminField
              label="Título"
              value={lotForm.title}
              onChange={(value) => setLotForm({ ...lotForm, title: value })}
              required
            />
            <AdminSelect
              label="Categoria"
              value={lotForm.category}
              options={lotCategories.map((category) => ({
                value: category,
                label: categoryLabels[category],
              }))}
              onChange={(value) => setLotForm({ ...lotForm, category: value as LotCategory })}
            />
            <AdminField
              label="URL da imagem"
              value={lotForm.image_url ?? ""}
              onChange={(value) => setLotForm({ ...lotForm, image_url: value })}
            />
            <AdminField
              label="Lance atual"
              type="number"
              min="0"
              step="0.01"
              value={lotForm.current_bid}
              onChange={(value) => setLotForm({ ...lotForm, current_bid: value })}
            />
            <AdminField
              label="Incremento"
              type="number"
              min="0"
              step="0.01"
              value={lotForm.increment}
              onChange={(value) => setLotForm({ ...lotForm, increment: value })}
              required
            />
            <AdminField
              label="Rótulo do lance"
              value={lotForm.bid_label ?? ""}
              onChange={(value) => setLotForm({ ...lotForm, bid_label: value })}
            />
            <AdminField
              label="Vendedor"
              value={lotForm.seller ?? ""}
              onChange={(value) => setLotForm({ ...lotForm, seller: value })}
            />
            <AdminTextArea
              label="Descrição"
              value={lotForm.description ?? ""}
              onChange={(value) => setLotForm({ ...lotForm, description: value })}
            />
            <label className="flex items-center gap-3 self-end pb-3 text-sm">
              <input
                type="checkbox"
                checked={lotForm.is_featured}
                onChange={(event) => setLotForm({ ...lotForm, is_featured: event.target.checked })}
              />
              Lote em destaque
            </label>
            <div className="flex gap-3 md:col-span-2">
              <CatalogButton type="submit" variant="accent" disabled={saving !== null}>
                {saving === "lot"
                  ? "Salvando..."
                  : editingLotId
                    ? "Salvar alterações"
                    : "Criar lote"}
              </CatalogButton>
              {editingLotId && (
                <CatalogButton type="button" variant="outline" onClick={resetLotForm}>
                  Cancelar
                </CatalogButton>
              )}
            </div>
          </form>
          <AdminLotTable
            lots={lots}
            auctions={auctions}
            deletingId={deletingId}
            onEdit={editLot}
            onDelete={handleDeleteLot}
          />
        </section>
      </div>
    </SiteLayout>
  );
}

function AdminField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="meta-label mb-2 block">{label}</span>
      <input
        className="w-full border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        min={min}
        step={step}
      />
    </label>
  );
}

function AdminTextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="meta-label mb-2 block">{label}</span>
      <textarea
        className="min-h-28 w-full border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AdminSelect({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="meta-label mb-2 block">{label}</span>
      <select
        className="w-full border border-border bg-background px-4 py-3 outline-none focus:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">Selecione</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function AdminAuctionTable({
  auctions,
  deletingId,
  onEdit,
  onDelete,
}: {
  auctions: AuctionRow[];
  deletingId: string | null;
  onEdit: (auction: AuctionRow) => void;
  onDelete: (auction: AuctionRow) => Promise<void>;
}) {
  return (
    <div className="overflow-x-auto bg-surface rounded-xl border border-border">
      <table className="w-full min-w-[780px] text-left">
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
              <td className="px-6 py-4 text-sm font-bold uppercase">
                {auction.title}
                <span className="mt-1 block font-mono text-xs font-normal text-muted-foreground">
                  {auction.code}
                </span>
              </td>
              <td className="px-6 py-4 font-mono text-xs">
                {new Date(auction.starts_at).toLocaleString("pt-BR")}
              </td>
              <td className="px-6 py-4 font-mono text-xs">{auction.location}</td>
              <td className="px-6 py-4">
                <StatusBadge status={auction.status} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-4">
                  <Link
                    to="/leiloes/$auctionId"
                    params={{ auctionId: auction.id }}
                    className="eyebrow border-b border-foreground pb-0.5"
                  >
                    Abrir
                  </Link>
                  <button
                    type="button"
                    className="eyebrow border-b border-foreground pb-0.5"
                    onClick={() => onEdit(auction)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="eyebrow border-b border-destructive pb-0.5 text-destructive disabled:opacity-50"
                    disabled={deletingId === auction.id}
                    onClick={() => void onDelete(auction)}
                  >
                    {deletingId === auction.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminLotTable({
  lots,
  auctions,
  deletingId,
  onEdit,
  onDelete,
}: {
  lots: LotRow[];
  auctions: AuctionRow[];
  deletingId: string | null;
  onEdit: (lot: LotRow) => void;
  onDelete: (lot: LotRow) => Promise<void>;
}) {
  const auctionNames = new Map(auctions.map((auction) => [auction.id, auction.title]));
  return (
    <div className="overflow-x-auto bg-surface rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="meta-label px-6 py-4">Lote</th>
            <th className="meta-label px-6 py-4">Leilão</th>
            <th className="meta-label px-6 py-4">Categoria</th>
            <th className="meta-label px-6 py-4">Valor</th>
            <th className="meta-label px-6 py-4">Destaque</th>
            <th className="meta-label px-6 py-4 text-right">Ação</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => (
            <tr key={lot.id} className="border-b border-border last:border-0">
              <td className="px-6 py-4 text-sm font-bold uppercase">
                #{lot.number} — {lot.title}
              </td>
              <td className="px-6 py-4 font-mono text-xs">
                {auctionNames.get(lot.auction_id) ?? "Leilão indisponível"}
              </td>
              <td className="px-6 py-4 font-mono text-xs uppercase">
                {categoryLabels[lot.category]}
              </td>
              <td className="px-6 py-4 font-mono text-xs font-bold">
                {lot.current_bid !== null ? formatCurrency(lot.current_bid) : "Sob consulta"}
              </td>
              <td className="px-6 py-4 font-mono text-xs">{lot.is_featured ? "Sim" : "Não"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="eyebrow border-b border-foreground pb-0.5"
                    onClick={() => onEdit(lot)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="eyebrow border-b border-destructive pb-0.5 text-destructive disabled:opacity-50"
                    disabled={deletingId === lot.id}
                    onClick={() => void onDelete(lot)}
                  >
                    {deletingId === lot.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
