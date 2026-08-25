import type { BidHistoryItem } from "@/types/lot";
import type { Database } from "@/types/database";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type BidRow = Database["public"]["Tables"]["bid_history"]["Row"];
type LotRow = Database["public"]["Tables"]["lots"]["Row"];

export type BidResult = BidRow;

function requireSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não está configurado.");
  }

  return supabase;
}

function mapBid(row: BidRow): BidHistoryItem {
  return {
    bidder: row.bidder_alias,
    amount: row.amount,
    at: new Date(row.created_at).toLocaleString("pt-BR"),
  };
}

export async function getBidHistory(lotId: string): Promise<BidHistoryItem[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .from("bid_history")
    .select("*")
    .eq("lot_id", lotId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapBid);
}

export async function getCurrentBid(lotId: string): Promise<number | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from("lots")
    .select("current_bid")
    .eq("id", lotId)
    .single();

  if (error) throw error;
  return data.current_bid;
}

export async function getBidState(
  lotId: string,
): Promise<{ currentBid: number | null; history: BidHistoryItem[] }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { currentBid: null, history: [] };
  }

  const [{ data: lot, error: lotError }, { data: bids, error: bidsError }] = await Promise.all([
    supabase.from("lots").select("current_bid").eq("id", lotId).single(),
    supabase
      .from("bid_history")
      .select("*")
      .eq("lot_id", lotId)
      .order("created_at", { ascending: false }),
  ]);

  if (lotError) throw lotError;
  if (bidsError) throw bidsError;
  return { currentBid: lot.current_bid, history: (bids ?? []).map(mapBid) };
}

export async function placeBid(lotId: string, amount: number): Promise<BidResult> {
  const client = requireSupabase();
  const { data, error } = await client.rpc("place_bid", {
    p_lot_id: lotId,
    p_amount: amount,
  });

  if (error) throw error;
  return data;
}

export function getMinimumBid(lot: Pick<LotRow, "current_bid" | "increment">): number {
  return (lot.current_bid ?? 0) + lot.increment;
}
