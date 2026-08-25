import { mockAuctions } from "@/data/mock-auctions";
import type { Auction, AuctionFilter } from "@/types/auction";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AuctionRow = Database["public"]["Tables"]["auctions"]["Row"];
export type AuctionInsert = Database["public"]["Tables"]["auctions"]["Insert"];
export type AuctionUpdate = Database["public"]["Tables"]["auctions"]["Update"];

let auctionsCache: Auction[] | null = null;

async function fetchAuctionsFromSupabase(): Promise<Auction[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const client = supabase as unknown as SupabaseClient<Database>;
    const res = await client.from("auctions").select("*");
    const data = res.data as Database["public"]["Tables"]["auctions"]["Row"][] | null;
    const error = res.error as unknown | null;

    if (error) {
      console.error("[supabase] failed to fetch auctions:", error);
      return null;
    }

    if (!data) return null;

    auctionsCache = data.map((row) => {
      const startsAt = new Date(row.starts_at);
      const date = startsAt
        .toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
        .toUpperCase();

      const time = startsAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return {
        id: row.id,
        code: row.code,
        title: row.title,
        status: row.status,
        date,
        time,
        location: row.location ?? "",
        offer: row.offer ?? "",
        promoter: row.promoter ?? "",
        cover: row.cover_url ?? "",
        summary: row.summary ?? "",
        terms: row.terms ?? [],
      } as Auction;
    });
    return auctionsCache;
  } catch (err) {
    console.error("[supabase] unexpected error fetching auctions:", err);
    return null;
  }
}

if (isSupabaseConfigured()) {
  void fetchAuctionsFromSupabase();
}

/**
 * Camada de serviço/acesso a dados de leilões (Auctions).
 *
 * Atualmente consome os dados mockados como fallback e está preparada para
 * receber chamadas assíncronas / queries reais a banco de dados.
 */
export function getAuctions(filter?: AuctionFilter): Auction[] {
  let result = auctionsCache ? [...auctionsCache] : [...mockAuctions];

  if (filter?.status) {
    result = result.filter((auction) => auction.status === filter.status);
  }

  if (filter?.search) {
    const query = filter.search.toLowerCase();
    result = result.filter(
      (auction) =>
        auction.title.toLowerCase().includes(query) ||
        auction.location.toLowerCase().includes(query) ||
        auction.offer.toLowerCase().includes(query) ||
        auction.promoter.toLowerCase().includes(query),
    );
  }

  if (filter?.limit && filter.limit > 0) {
    result = result.slice(0, filter.limit);
  }

  return result;
}

export function getAuctionById(id: string): Auction | undefined {
  const fromCache = auctionsCache?.find((auction) => auction.id === id);
  if (fromCache) return fromCache;
  return mockAuctions.find((auction) => auction.id === id);
}

export function getUpcomingAuctions(limit = 3): Auction[] {
  const source = auctionsCache ?? mockAuctions;
  return source.filter((auction) => auction.status !== "encerrado").slice(0, limit);
}

function filterAuctions(source: Auction[], filter?: AuctionFilter): Auction[] {
  let result = [...source];

  if (filter?.status) result = result.filter((auction) => auction.status === filter.status);
  if (filter?.search) {
    const query = filter.search.toLowerCase();
    result = result.filter(
      (auction) =>
        auction.title.toLowerCase().includes(query) ||
        auction.location.toLowerCase().includes(query) ||
        auction.offer.toLowerCase().includes(query) ||
        auction.promoter.toLowerCase().includes(query),
    );
  }
  if (filter?.limit && filter.limit > 0) result = result.slice(0, filter.limit);
  return result;
}

export async function loadAuctions(filter?: AuctionFilter): Promise<Auction[]> {
  if (!isSupabaseConfigured()) return filterAuctions(mockAuctions, filter);
  const source = auctionsCache ?? (await fetchAuctionsFromSupabase()) ?? mockAuctions;
  return filterAuctions(source, filter);
}

export async function loadAuctionById(id: string): Promise<Auction | undefined> {
  const auctions = await loadAuctions();
  return auctions.find((auction) => auction.id === id);
}

export async function loadUpcomingAuctions(limit = 3): Promise<Auction[]> {
  const auctions = await loadAuctions();
  return auctions.filter((auction) => auction.status !== "encerrado").slice(0, limit);
}

async function getAdminClient(): Promise<SupabaseClient<Database>> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não está configurado.");
  }

  return supabase;
}

export async function listAuctionsAdmin(): Promise<AuctionRow[]> {
  const client = await getAdminClient();
  const { data, error } = await client
    .from("auctions")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createAuction(payload: AuctionInsert): Promise<AuctionRow> {
  const client = await getAdminClient();
  const { data, error } = await client.from("auctions").insert(payload).select().single();

  if (error) throw error;
  return data;
}

export async function updateAuction(id: string, payload: AuctionUpdate): Promise<AuctionRow> {
  const client = await getAdminClient();
  const { data, error } = await client
    .from("auctions")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAuction(id: string): Promise<void> {
  const client = await getAdminClient();
  const { error } = await client.from("auctions").delete().eq("id", id);

  if (error) throw error;
}
