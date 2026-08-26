import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Menu,
  Package,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";

import { useAuth } from "@/lib/auth";
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
import { categoryLabels, statusLabels, type AuctionStatus, type LotCategory } from "@/types";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Painel Administrativo — Terroir Remates" }] }),
  component: AdminPage,
});

const auctionStatuses: AuctionStatus[] = ["ao-vivo", "agendado", "encerrado"];
const lotCategories: LotCategory[] = ["elite", "comercial", "imovel"];
type Tab = "overview" | "auctions" | "lots";
type Modal = "auction" | "lot" | null;
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
const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const timeLabel = (value: string) =>
  new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

function AdminPage() {
  const { loading, user, role } = useAuth();
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [lots, setLots] = useState<LotRow[]>([]);
  const [auctionForm, setAuctionForm] = useState<AuctionForm>(emptyAuction);
  const [lotForm, setLotForm] = useState<LotForm>(emptyLot);
  const [editingAuctionId, setEditingAuctionId] = useState<string | null>(null);
  const [editingLotId, setEditingLotId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState<"auction" | "lot" | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

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
  function closeModal() {
    setModal(null);
    setEditingAuctionId(null);
    setEditingLotId(null);
    setAuctionForm(emptyAuction);
    setLotForm(emptyLot);
  }
  function newAuction() {
    setFeedback(null);
    setEditingAuctionId(null);
    setAuctionForm(emptyAuction);
    setModal("auction");
  }
  function newLot() {
    setFeedback(null);
    setEditingLotId(null);
    setLotForm({ ...emptyLot, auction_id: auctions[0]?.id ?? "" });
    setModal("lot");
  }
  function editAuction(item: AuctionRow) {
    setEditingAuctionId(item.id);
    setAuctionForm({
      code: item.code,
      title: item.title,
      status: item.status,
      starts_at: item.starts_at.slice(0, 16),
      location: item.location,
      offer: item.offer,
      promoter: item.promoter,
      cover_url: item.cover_url ?? "",
      summary: item.summary,
      terms: item.terms.join("\n"),
    });
    setModal("auction");
  }
  function editLot(item: LotRow) {
    setEditingLotId(item.id);
    setLotForm({
      auction_id: item.auction_id,
      number: item.number,
      title: item.title,
      category: item.category,
      image_url: item.image_url ?? "",
      current_bid: item.current_bid?.toString() ?? "",
      bid_label: item.bid_label,
      increment: item.increment.toString(),
      description: item.description,
      seller: item.seller,
      is_featured: item.is_featured,
    });
    setModal("lot");
  }

  async function handleAuctionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auctionForm.code.trim() || !auctionForm.title.trim() || !auctionForm.starts_at) {
      setFeedback({ type: "error", text: "Informe código, título e data do leilão." });
      return;
    }
    setSaving("auction");
    const wasEditing = Boolean(editingAuctionId);
    const payload: AuctionInsert = {
      code: auctionForm.code.trim(),
      title: auctionForm.title.trim(),
      status: auctionForm.status,
      starts_at: new Date(auctionForm.starts_at).toISOString(),
      location: auctionForm.location.trim(),
      offer: auctionForm.offer.trim(),
      promoter: auctionForm.promoter.trim(),
      cover_url: auctionForm.cover_url.trim() || null,
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
      closeModal();
      setFeedback({ type: "success", text: wasEditing ? "Leilão atualizado." : "Leilão criado." });
    } catch (error) {
      setFeedback({
        type: "error",
        text: errorMessage(error, "Não foi possível salvar o leilão."),
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
    const currentBid = lotForm.current_bid.trim() ? Number(lotForm.current_bid) : null;
    const increment = Number(lotForm.increment);
    if ((currentBid !== null && !Number.isFinite(currentBid)) || !Number.isFinite(increment)) {
      setFeedback({ type: "error", text: "Informe valores numéricos válidos." });
      return;
    }
    setSaving("lot");
    const wasEditing = Boolean(editingLotId);
    const payload: LotInsert = {
      auction_id: lotForm.auction_id,
      number: lotForm.number.trim(),
      title: lotForm.title.trim(),
      category: lotForm.category,
      image_url: lotForm.image_url.trim() || null,
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
      closeModal();
      setFeedback({ type: "success", text: wasEditing ? "Lote atualizado." : "Lote criado." });
    } catch (error) {
      setFeedback({ type: "error", text: errorMessage(error, "Não foi possível salvar o lote.") });
    } finally {
      setSaving(null);
    }
  }
  async function handleDeleteAuction(item: AuctionRow) {
    if (!window.confirm(`Excluir o leilão "${item.title}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteAuction(item.id);
      await loadAdminData();
      setFeedback({ type: "success", text: "Leilão excluído." });
    } catch {
      setFeedback({
        type: "error",
        text: "Não foi possível excluir o leilão. Verifique se há registros relacionados.",
      });
    } finally {
      setDeletingId(null);
    }
  }
  async function handleDeleteLot(item: LotRow) {
    if (!window.confirm(`Excluir o lote "${item.title}"?`)) return;
    setDeletingId(item.id);
    try {
      await deleteLot(item.id);
      await loadAdminData();
      setFeedback({ type: "success", text: "Lote excluído." });
    } catch {
      setFeedback({ type: "error", text: "Não foi possível excluir o lote. Tente novamente." });
    } finally {
      setDeletingId(null);
    }
  }
  if (loading)
    return (
      <div className="min-h-screen bg-background p-8 text-muted-foreground">
        Carregando painel...
      </div>
    );
  if (!user || role !== "admin")
    return (
      <div className="min-h-screen bg-background p-8">
        <p className="mb-6">Esta área é restrita a administradores.</p>
        <Link to="/" className="text-primary underline">
          Voltar
        </Link>
      </div>
    );
  const filteredAuctions = auctions.filter((item) =>
    `${item.title} ${item.code} ${item.location}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredLots = lots.filter((item) =>
    `${item.title} ${item.number} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const nav = [
    { id: "overview" as Tab, label: "Visão geral", Icon: LayoutDashboard },
    { id: "auctions" as Tab, label: "Leilões", Icon: CalendarDays },
    { id: "lots" as Tab, label: "Lotes", Icon: Package },
  ];
  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar px-5 py-7 lg:block">
        <div className="mb-12 flex items-center gap-3 px-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-ember text-lg font-black text-primary-foreground">
            T
          </span>
          <div>
            <p className="font-display text-lg font-bold">terroir</p>
            <p className="meta-label">remates</p>
          </div>
        </div>
        <p className="meta-label mb-3 px-3">Console de gestão</p>
        <nav className="space-y-1">
          {nav.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${tab === id ? "bg-sidebar-accent text-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </nav>
        <div className="mt-24 rounded-lg border border-border bg-surface-muted/40 p-4 text-xs text-muted-foreground">
          <p className="mb-2 flex items-center gap-2 text-live">
            <span className="size-2 rounded-full bg-live animate-live" />
            Sistema online
          </p>
          Dados sincronizados com Supabase
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Menu className="size-5 lg:hidden" />
            <div>
              <p className="meta-label">Terroir / Administração</p>
              <h1 className="mt-1 font-display text-2xl font-bold">Painel de operação</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-semibold">Administrador</span>
              <span className="block text-xs text-muted-foreground">Acesso completo</span>
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
              A
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <p className="meta-label text-primary">Centro de comando</p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
                Visão da operação <span className="text-muted-foreground">em um só lugar.</span>
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={newLot}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 text-sm font-semibold"
              >
                <Plus className="size-4" />
                Novo lote
              </button>
              <button
                type="button"
                onClick={newAuction}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-ember px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-ember"
              >
                <Plus className="size-4" />
                Novo leilão
              </button>
            </div>
          </div>
          {feedback && (
            <div
              className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${feedback.type === "error" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-live/30 bg-live/10 text-live"}`}
            >
              <span className="flex items-center gap-2">
                {feedback.type === "success" && <Check className="size-4" />}
                {feedback.text}
              </span>
              <button type="button" title="Fechar" onClick={() => setFeedback(null)}>
                <X className="size-4" />
              </button>
            </div>
          )}
          <div className="mb-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={CalendarDays}
              label="Total de leilões"
              value={auctions.length}
              detail="cadastros ativos"
            />
            <Metric
              icon={CircleDollarSign}
              label="Ao vivo agora"
              value={auctions.filter((item) => item.status === "ao-vivo").length}
              detail="em operação"
            />
            <Metric
              icon={Package}
              label="Total de lotes"
              value={lots.length}
              detail="no catálogo"
            />
            <Metric
              icon={Star}
              label="Em destaque"
              value={lots.filter((item) => item.is_featured).length}
              detail="lotes promovidos"
            />
          </div>
          <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
            <div className="flex gap-1">
              {nav.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-3 py-2 text-sm font-semibold ${tab === id ? "border-b-2 border-primary" : "text-muted-foreground"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-muted-foreground md:w-72">
              <Search className="size-4" />
              <input
                className="w-full bg-transparent outline-none placeholder:text-muted-foreground/70"
                placeholder="Buscar na operação"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          {loadingData ? (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-28 animate-pulse rounded-lg bg-surface" />
              <div className="h-28 animate-pulse rounded-lg bg-surface" />
            </div>
          ) : tab === "overview" ? (
            <Overview
              auctions={filteredAuctions}
              lots={filteredLots}
              onAuction={editAuction}
              onLot={editLot}
              onDeleteAuction={handleDeleteAuction}
              onDeleteLot={handleDeleteLot}
              deletingId={deletingId}
              onAuctions={() => setTab("auctions")}
              onLots={() => setTab("lots")}
              allAuctions={auctions}
            />
          ) : tab === "auctions" ? (
            <ListPanel
              title="Gestão de leilões"
              count={filteredAuctions.length}
              action="Novo leilão"
              onAction={newAuction}
            >
              {filteredAuctions.map((item) => (
                <AuctionRow
                  key={item.id}
                  item={item}
                  onEdit={editAuction}
                  onDelete={handleDeleteAuction}
                  deleting={deletingId === item.id}
                />
              ))}
            </ListPanel>
          ) : (
            <ListPanel
              title="Gestão de lotes"
              count={filteredLots.length}
              action="Novo lote"
              onAction={newLot}
            >
              {filteredLots.map((item) => (
                <LotRow
                  key={item.id}
                  item={item}
                  auctions={auctions}
                  onEdit={editLot}
                  onDelete={handleDeleteLot}
                  deleting={deletingId === item.id}
                />
              ))}
            </ListPanel>
          )}
        </div>
      </main>
      {modal === "auction" && (
        <Modal
          title={editingAuctionId ? "Editar leilão" : "Novo leilão"}
          subtitle="Cadastre as informações do remate."
          onClose={closeModal}
        >
          <AuctionForm
            form={auctionForm}
            setForm={setAuctionForm}
            submit={handleAuctionSubmit}
            saving={saving === "auction"}
            editing={Boolean(editingAuctionId)}
            cancel={closeModal}
          />
        </Modal>
      )}
      {modal === "lot" && (
        <Modal
          title={editingLotId ? "Editar lote" : "Novo lote"}
          subtitle="Organize os dados do lote e do arremate."
          onClose={closeModal}
        >
          <LotForm
            form={lotForm}
            setForm={setLotForm}
            auctions={auctions}
            submit={handleLotSubmit}
            saving={saving === "lot"}
            editing={Boolean(editingLotId)}
            cancel={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="panel p-5">
      <Icon className="mb-5 size-5 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
function Overview({
  auctions,
  lots,
  onAuction,
  onLot,
  onDeleteAuction,
  onDeleteLot,
  deletingId,
  onAuctions,
  onLots,
  allAuctions,
}: {
  auctions: AuctionRow[];
  lots: LotRow[];
  onAuction: (item: AuctionRow) => void;
  onLot: (item: LotRow) => void;
  onDeleteAuction: (item: AuctionRow) => Promise<void>;
  onDeleteLot: (item: LotRow) => Promise<void>;
  deletingId: string | null;
  onAuctions: () => void;
  onLots: () => void;
  allAuctions: AuctionRow[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <ListPanel
        title="Próximos leilões"
        count={auctions.length}
        action="Ver todos"
        onAction={onAuctions}
      >
        {auctions.slice(0, 5).map((item) => (
          <AuctionRow
            key={item.id}
            item={item}
            onEdit={onAuction}
            onDelete={onDeleteAuction}
            deleting={deletingId === item.id}
          />
        ))}
      </ListPanel>
      <ListPanel title="Lotes recentes" count={lots.length} action="Ver todos" onAction={onLots}>
        {lots.slice(0, 5).map((item) => (
          <LotRow
            key={item.id}
            item={item}
            auctions={allAuctions}
            onEdit={onLot}
            onDelete={onDeleteLot}
            deleting={deletingId === item.id}
          />
        ))}
      </ListPanel>
    </div>
  );
}
function ListPanel({
  title,
  count,
  action,
  onAction,
  children,
}: {
  title: string;
  count: number;
  action: string;
  onAction: () => void;
  children: ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{count} registros</p>
        </div>
        <button type="button" onClick={onAction} className="text-xs font-bold text-primary">
          {action} <Plus className="ml-1 inline size-3" />
        </button>
      </div>
      {count ? (
        children
      ) : (
        <div className="px-5 py-14 text-center text-sm text-muted-foreground">
          <Package className="mx-auto mb-3 size-8 opacity-40" />
          Nenhum cadastro encontrado.
        </div>
      )}
    </section>
  );
}
function Actions({
  onEdit,
  onDelete,
  deleting,
}: {
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Editar"
        onClick={onEdit}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted"
      >
        <Pencil className="size-4" />
      </button>
      <button
        type="button"
        title="Excluir"
        disabled={deleting}
        onClick={onDelete}
        className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
function AuctionRow({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: AuctionRow;
  onEdit: (item: AuctionRow) => void;
  onDelete: (item: AuctionRow) => Promise<void>;
  deleting: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <CalendarDays className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{item.title}</p>
          <p className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="font-mono">{item.code}</span>
            <span>•</span>
            <span>
              {dateLabel(item.starts_at)} às {timeLabel(item.starts_at)}
            </span>
            {item.location && (
              <>
                <span>•</span>
                <span>
                  <MapPin className="mr-1 inline size-3" />
                  {item.location}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pl-15 sm:justify-end sm:pl-0">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === "ao-vivo" ? "bg-live/10 text-live" : item.status === "agendado" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
        >
          {statusLabels[item.status]}
        </span>
        <Actions
          onEdit={() => onEdit(item)}
          onDelete={() => void onDelete(item)}
          deleting={deleting}
        />
      </div>
    </div>
  );
}
function LotRow({
  item,
  auctions,
  onEdit,
  onDelete,
  deleting,
}: {
  item: LotRow;
  auctions: AuctionRow[];
  onEdit: (item: LotRow) => void;
  onDelete: (item: LotRow) => Promise<void>;
  deleting: boolean;
}) {
  const auction = auctions.find((entry) => entry.id === item.auction_id);
  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent">
          <Package className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">
            <span className="mr-2 font-mono text-primary">#{item.number}</span>
            {item.title}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {categoryLabels[item.category]}
            {auction && ` • ${auction.title}`}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between pl-15 sm:justify-end sm:pl-0">
        <span className="mr-3 font-mono text-xs font-bold">
          {item.current_bid !== null ? formatCurrency(item.current_bid) : "Sob consulta"}
        </span>
        {item.is_featured && <Star className="mr-3 size-4 fill-accent text-accent" />}
        <Actions
          onEdit={() => onEdit(item)}
          onDelete={() => void onDelete(item)}
          deleting={deleting}
        />
      </div>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-border bg-surface shadow-elevated sm:rounded-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-border bg-surface px-6 py-5">
          <div>
            <p className="meta-label text-primary">Console de gestão</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            title="Fechar"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
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
      <span className="meta-label mb-2 block">
        {label}
        {required && " *"}
      </span>
      <input
        className="w-full rounded-lg border border-input bg-background px-3.5 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
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
function Area({
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
        className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3.5 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
function Select({
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
      <span className="meta-label mb-2 block">
        {label}
        {required && " *"}
      </span>
      <span className="relative block">
        <select
          className="w-full appearance-none rounded-lg border border-input bg-background px-3.5 py-3 outline-none focus:border-primary"
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
        <ChevronDown className="pointer-events-none absolute right-3 top-3.5 size-4 text-muted-foreground" />
      </span>
    </label>
  );
}
function FormActions({
  saving,
  editing,
  cancel,
}: {
  saving: boolean;
  editing: boolean;
  cancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-3 border-t border-border px-6 py-5">
      <button
        type="button"
        onClick={cancel}
        className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-gradient-ember px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar cadastro"}
      </button>
    </div>
  );
}
function AuctionForm({
  form,
  setForm,
  submit,
  saving,
  editing,
  cancel,
}: {
  form: AuctionForm;
  setForm: (form: AuctionForm) => void;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  editing: boolean;
  cancel: () => void;
}) {
  const update = (key: keyof AuctionForm, value: string) => setForm({ ...form, [key]: value });
  return (
    <form onSubmit={submit}>
      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        <Field
          label="Código"
          value={form.code}
          onChange={(value) => update("code", value)}
          required
        />
        <Field
          label="Título do leilão"
          value={form.title}
          onChange={(value) => update("title", value)}
          required
        />
        <Field
          label="Data e horário"
          type="datetime-local"
          value={form.starts_at}
          onChange={(value) => update("starts_at", value)}
          required
        />
        <Select
          label="Status"
          value={form.status}
          options={auctionStatuses.map((status) => ({
            value: status,
            label: statusLabels[status],
          }))}
          onChange={(value) => update("status", value)}
        />
        <Field
          label="Local"
          value={form.location}
          onChange={(value) => update("location", value)}
        />
        <Field
          label="Oferta / seleção"
          value={form.offer}
          onChange={(value) => update("offer", value)}
        />
        <Field
          label="Promotor"
          value={form.promoter}
          onChange={(value) => update("promoter", value)}
        />
        <Field
          label="URL da capa"
          value={form.cover_url}
          onChange={(value) => update("cover_url", value)}
        />
        <Area label="Resumo" value={form.summary} onChange={(value) => update("summary", value)} />
        <Area
          label="Termos (um por linha)"
          value={form.terms}
          onChange={(value) => update("terms", value)}
        />
      </div>
      <MediaPlaceholder label="Mídia do remate" />
      <FormActions saving={saving} editing={editing} cancel={cancel} />
    </form>
  );
}
function LotForm({
  form,
  setForm,
  auctions,
  submit,
  saving,
  editing,
  cancel,
}: {
  form: LotForm;
  setForm: (form: LotForm) => void;
  auctions: AuctionRow[];
  submit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  editing: boolean;
  cancel: () => void;
}) {
  const update = (key: keyof LotForm, value: string | boolean) =>
    setForm({ ...form, [key]: value });
  return (
    <form onSubmit={submit}>
      <div className="grid gap-5 px-6 py-6 md:grid-cols-2">
        <Select
          label="Leilão"
          value={form.auction_id}
          options={auctions.map((item) => ({
            value: item.id,
            label: `${item.code} — ${item.title}`,
          }))}
          onChange={(value) => update("auction_id", value)}
          required
        />
        <Field
          label="Número do lote"
          value={form.number}
          onChange={(value) => update("number", value)}
          required
        />
        <Field
          label="Título"
          value={form.title}
          onChange={(value) => update("title", value)}
          required
        />
        <Select
          label="Categoria"
          value={form.category}
          options={lotCategories.map((category) => ({
            value: category,
            label: categoryLabels[category],
          }))}
          onChange={(value) => update("category", value)}
        />
        <Field
          label="URL da imagem"
          value={form.image_url}
          onChange={(value) => update("image_url", value)}
        />
        <Field
          label="Lance atual"
          type="number"
          min="0"
          step="0.01"
          value={form.current_bid}
          onChange={(value) => update("current_bid", value)}
        />
        <Field
          label="Incremento"
          type="number"
          min="0"
          step="0.01"
          value={form.increment}
          onChange={(value) => update("increment", value)}
          required
        />
        <Field
          label="Rótulo do lance"
          value={form.bid_label}
          onChange={(value) => update("bid_label", value)}
        />
        <Field label="Vendedor" value={form.seller} onChange={(value) => update("seller", value)} />
        <Area
          label="Descrição"
          value={form.description}
          onChange={(value) => update("description", value)}
        />
        <label className="flex items-center gap-3 self-end rounded-lg border border-border p-3 text-sm">
          <input
            className="size-4 accent-primary"
            type="checkbox"
            checked={form.is_featured}
            onChange={(event) => update("is_featured", event.target.checked)}
          />
          <span>
            <strong className="block">Lote em destaque</strong>
            <span className="text-xs text-muted-foreground">Promover no catálogo público</span>
          </span>
        </label>
      </div>
      <MediaPlaceholder label="Galeria do animal" />
      <FormActions saving={saving} editing={editing} cancel={cancel} />
    </form>
  );
}
function MediaPlaceholder({ label }: { label: string }) {
  return (
    <div className="mx-6 mb-2 flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/40 p-4 text-sm text-muted-foreground">
      <ImagePlus className="size-5 text-primary" />
      <span>
        <strong className="text-foreground">{label}</strong>
        <br />
        Área preparada para imagens e vídeos. Upload será adicionado futuramente.
      </span>
    </div>
  );
}
