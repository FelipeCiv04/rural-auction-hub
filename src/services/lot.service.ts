import { featuredLotIds, mockLots } from "@/data/mock-lots";
import type { Lot, LotFilter } from "@/types/lot";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

let lotsCache: Lot[] | null = null;

async function fetchLotsFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    const client = supabase as unknown as SupabaseClient<Database>;
    const [lotsRes, specsRes, bidsRes] = await Promise.all([
      client.from("lots").select("*").order("number", { ascending: true }),
      client.from("lot_specs").select("*").order("sort_order", { ascending: true }),
      client.from("bid_history").select("*").order("created_at", { ascending: false }),
    ]);

    const lotsData = lotsRes.data as Database["public"]["Tables"]["lots"]["Row"][] | null;
    const lotsError = lotsRes.error as unknown | null;
    const specsData = specsRes.data as Database["public"]["Tables"]["lot_specs"]["Row"][] | null;
    const specsError = specsRes.error as unknown | null;
    const bidsData = bidsRes.data as Database["public"]["Tables"]["bid_history"]["Row"][] | null;
    const bidsError = bidsRes.error as unknown | null;

    if (lotsError) {
      console.error("[supabase] failed to fetch lots:", lotsError);
      return;
    }
    if (specsError) {
      console.error("[supabase] failed to fetch lot specs:", specsError);
    }
    if (bidsError) {
      console.error("[supabase] failed to fetch bid history:", bidsError);
    }

    const specsByLot: Record<string, { label: string; value: string }[]> = {};
    (specsData ?? []).forEach((s) => {
      const arr = specsByLot[s.lot_id] ?? [];
      arr.push({ label: s.label, value: s.value });
      specsByLot[s.lot_id] = arr;
    });

    const bidsByLot: Record<string, { bidder: string; amount: number; at: string }[]> = {};
    (bidsData ?? []).forEach((b) => {
      const arr = bidsByLot[b.lot_id] ?? [];
      arr.push({
        bidder: b.bidder_alias ?? "",
        amount: b.amount,
        at: new Date(b.created_at).toLocaleString(),
      });
      bidsByLot[b.lot_id] = arr;
    });

    lotsCache = (lotsData ?? []).map((row) => {
      return {
        id: row.id,
        number: row.number,
        title: row.title,
        category: row.category,
        auctionId: row.auction_id,
        image: row.image_url ?? "",
        currentBid: row.current_bid ?? null,
        bidLabel: row.bid_label ?? "",
        increment: row.increment ?? 0,
        specs: specsByLot[row.id] ?? [],
        description: row.description ?? "",
        seller: row.seller ?? "",
        bidHistory: bidsByLot[row.id] ?? [],
      } as Lot;
    });
  } catch (err) {
    console.error("[supabase] unexpected error fetching lots/specs/bids:", err);
  }
}

if (isSupabaseConfigured()) {
  void fetchLotsFromSupabase();
}

/**
 * Camada de serviço/acesso a dados de lotes (Lots).
 *
 * Atualmente consome os dados mockados como fallback e está preparada para
 * receber chamadas assíncronas / queries reais a banco de dados.
 */
export function getLots(filter?: LotFilter): Lot[] {
  let result = lotsCache ? [...lotsCache] : [...mockLots];

  if (filter?.category) {
    result = result.filter((lot) => lot.category === filter.category);
  }

  if (filter?.auctionId) {
    result = result.filter((lot) => lot.auctionId === filter.auctionId);
  }

  if (filter?.featured) {
    result = result.filter((lot) => featuredLotIds.includes(lot.id));
  }

  return result;
}

export function getLotById(id: string): Lot | undefined {
  const fromCache = lotsCache?.find((lot) => lot.id === id);
  if (fromCache) return fromCache;
  return mockLots.find((lot) => lot.id === id);
}

export function getLotsByAuction(auctionId: string): Lot[] {
  const source = lotsCache ?? mockLots;
  return source.filter((lot) => lot.auctionId === auctionId);
}

export function getFeaturedLots(): Lot[] {
  const source = lotsCache ?? mockLots;
  if (lotsCache) {
    return featuredLotIds
      .map((id) => source.find((l) => l.id === id))
      .filter((lot): lot is Lot => Boolean(lot));
  }

  return featuredLotIds.map((id) => getLotById(id)).filter((lot): lot is Lot => Boolean(lot));
}
