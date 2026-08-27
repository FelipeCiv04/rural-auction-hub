import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createClient } from "@supabase/supabase-js";
import { createServer, loadEnv } from "vite";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const env = loadEnv(process.env.NODE_ENV ?? "development", projectRoot, "");
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL não está configurada.");
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY não está configurada. O seed precisa de uma chave de servidor local para passar pelas policies RLS sem implementar autenticação.",
  );
}

function deterministicUuid(namespace, value) {
  const digest = createHash("sha256").update(`rural-auction-hub:${namespace}:${value}`).digest();
  const bytes = [...digest.subarray(0, 16)];
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const monthNumbers = {
  JANEIRO: "01",
  FEVEREIRO: "02",
  MARCO: "03",
  MARÇO: "03",
  ABRIL: "04",
  MAIO: "05",
  JUNHO: "06",
  JULHO: "07",
  AGOSTO: "08",
  SETEMBRO: "09",
  OUTUBRO: "10",
  NOVEMBRO: "11",
  DEZEMBRO: "12",
};

function toStartsAt(date, time) {
  const [dayMonth, year] = date.split(/\s*,\s*/);
  const [day, monthName] = dayMonth.split(" ");
  const month = monthNumbers[monthName];
  if (!month) throw new Error(`Mês não reconhecido no mock: ${date}`);
  return `${year}-${month}-${day.padStart(2, "0")}T${time}:00-03:00`;
}

function bidCreatedAt(auctionStartsAt, displayTime, index) {
  const amount = displayTime === "agora" ? 0 : Number(displayTime.match(/(\d+)/)?.[1] ?? 0);
  const minutesAgo = displayTime.includes(" h") ? amount * 60 : amount;
  const timestamp = new Date(auctionStartsAt);
  timestamp.setMinutes(timestamp.getMinutes() - minutesAgo - index);
  return timestamp.toISOString();
}

const storageImageByAsset = {
  "/src/assets/hero-touro.jpg": "hero-touro.jpg",
  "/src/assets/lote-fazenda.jpg": "lote-fazenda.jpg",
  "/src/assets/lote-nelore.jpg": "lote-nelore.jpg",
  "/src/assets/lote-novilhas.jpg": "lote-novilhas.jpg",
  "/src/assets/martelo.jpg": "martelo.jpg",
};

function assetReference(asset) {
  const filename = storageImageByAsset[asset];
  if (!filename) throw new Error(`Imagem não mapeada para o Storage: ${asset}`);
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/auction-images/${filename}`;
}

async function loadMocks() {
  const vite = await createServer({
    configFile: false,
    root: projectRoot,
    resolve: { alias: { "@": path.join(projectRoot, "src") } },
    server: { middlewareMode: true },
    ssr: { noExternal: ["@/data/mock-auctions.ts", "@/data/mock-lots.ts"] },
  });

  try {
    const auctionsModule = await vite.ssrLoadModule("/src/data/mock-auctions.ts");
    const lotsModule = await vite.ssrLoadModule("/src/data/mock-lots.ts");
    return {
      auctions: auctionsModule.mockAuctions,
      lots: lotsModule.mockLots,
      featuredLotIds: lotsModule.featuredLotIds,
    };
  } finally {
    await vite.close();
  }
}

async function requireSingle(client, table, filters) {
  let query = client.from(table).select("id");
  for (const [column, value] of filters) query = query.eq(column, value);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

async function upsertAuction(client, mockAuction) {
  const payload = {
    id: deterministicUuid("auction", mockAuction.id),
    code: mockAuction.code,
    title: mockAuction.title,
    status: mockAuction.status,
    starts_at: toStartsAt(mockAuction.date, mockAuction.time),
    location: mockAuction.location,
    offer: mockAuction.offer,
    promoter: mockAuction.promoter,
    cover_url: assetReference(mockAuction.cover),
    summary: mockAuction.summary,
    terms: mockAuction.terms,
  };
  const existing = await requireSingle(client, "auctions", [["code", mockAuction.code]]);
  if (existing) {
    const { id: _ignoredId, ...updatePayload } = payload;
    const { data, error } = await client
      .from("auctions")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }
  const { data, error } = await client.from("auctions").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

async function upsertLot(client, mockLot, auctionId, featuredLotIds) {
  const payload = {
    id: deterministicUuid("lot", mockLot.id),
    auction_id: auctionId,
    number: mockLot.number,
    title: mockLot.title,
    category: mockLot.category,
    image_url: assetReference(mockLot.image),
    current_bid: mockLot.currentBid,
    bid_label: mockLot.bidLabel,
    increment: mockLot.increment,
    description: mockLot.description,
    seller: mockLot.seller,
    is_featured: featuredLotIds.includes(mockLot.id),
  };
  const existing = await requireSingle(client, "lots", [
    ["auction_id", auctionId],
    ["number", mockLot.number],
  ]);
  if (existing) {
    const { id: _ignoredId, ...updatePayload } = payload;
    const { data, error } = await client
      .from("lots")
      .update(updatePayload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  }
  const { data, error } = await client.from("lots").insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

async function replaceLotChildren(client, mockLot, lotId, auctionStartsAt) {
  for (const table of ["lot_specs", "bid_history"]) {
    const { error } = await client.from(table).delete().eq("lot_id", lotId);
    if (error) throw error;
  }

  const specs = mockLot.specs.map((spec, index) => ({
    id: deterministicUuid("lot-spec", `${mockLot.id}:${index}`),
    lot_id: lotId,
    label: spec.label,
    value: spec.value,
    sort_order: index,
  }));
  if (specs.length) {
    const { error } = await client.from("lot_specs").insert(specs);
    if (error) throw error;
  }

  const bids = mockLot.bidHistory.map((bid, index) => ({
    id: deterministicUuid("bid-history", `${mockLot.id}:${index}`),
    lot_id: lotId,
    bidder_id: null,
    bidder_alias: bid.bidder,
    amount: bid.amount,
    created_at: bidCreatedAt(auctionStartsAt, bid.at, index),
  }));
  if (bids.length) {
    const { error } = await client.from("bid_history").insert(bids);
    if (error) throw error;
  }
}

async function main() {
  const { auctions, lots, featuredLotIds } = await loadMocks();
  const specCount = lots.reduce((count, lot) => count + lot.specs.length, 0);
  const bidCount = lots.reduce((count, lot) => count + lot.bidHistory.length, 0);
  if (auctions.length !== 5 || lots.length !== 6 || specCount !== 24 || bidCount !== 7) {
    throw new Error(
      `Contagem inesperada nos mocks: ${auctions.length} auctions, ${lots.length} lots, ${specCount} specs, ${bidCount} bids.`,
    );
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const auctionIds = new Map();
  for (const auction of auctions) {
    const auctionId = await upsertAuction(client, auction);
    auctionIds.set(auction.id, {
      id: auctionId,
      startsAt: toStartsAt(auction.date, auction.time),
    });
  }
  for (const lot of lots) {
    const auction = auctionIds.get(lot.auctionId);
    if (!auction) throw new Error(`Leilão não encontrado para o lote ${lot.id}.`);
    const lotId = await upsertLot(client, lot, auction.id, featuredLotIds);
    await replaceLotChildren(client, lot, lotId, auction.startsAt);
  }

  console.log(
    `Seed concluído: ${auctions.length} auctions, ${lots.length} lots, ${specCount} lot_specs, ${bidCount} bid_history.`,
  );
  console.log(
    "Imagens locais mantidas como referências /src/assets/...; nenhum upload ou URL do Storage foi criado.",
  );
}

await main();
