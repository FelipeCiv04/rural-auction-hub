import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { Lot } from "@/types/lot";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Pick<
  Database["public"]["Tables"]["profiles"]["Update"],
  "full_name" | "document" | "phone"
>;
type FavoriteRow = Database["public"]["Tables"]["lot_favorites"]["Row"];
type LotRow = Database["public"]["Tables"]["lots"]["Row"];
type BidRow = Database["public"]["Tables"]["bid_history"]["Row"];

export type BuyerBid = Pick<BidRow, "id" | "lot_id" | "amount" | "bidder_alias" | "created_at">;

function requireSupabase() {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error("Supabase não está configurado.");
  }

  return supabase;
}

function mapLot(row: LotRow): Lot {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    category: row.category,
    auctionId: row.auction_id,
    image: row.image_url ?? "",
    currentBid: row.current_bid,
    bidLabel: row.bid_label,
    increment: row.increment,
    specs: [],
    description: row.description,
    seller: row.seller,
    bidHistory: [],
  };
}

export async function updateOwnProfile(
  userId: string,
  payload: ProfileUpdate,
): Promise<ProfileRow> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getFavoriteLotIds(userId: string): Promise<string[]> {
  const client = requireSupabase();
  const { data, error } = await client.from("lot_favorites").select("lot_id").eq("user_id", userId);

  if (error) throw error;
  return (data ?? []).map((favorite) => favorite.lot_id);
}

export async function getFavoriteLots(userId: string): Promise<Lot[]> {
  const client = requireSupabase();
  const { data: favorites, error: favoriteError } = await client
    .from("lot_favorites")
    .select("lot_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (favoriteError) throw favoriteError;
  const lotIds = (favorites ?? []).map((favorite) => favorite.lot_id);
  if (lotIds.length === 0) return [];

  const { data: lots, error: lotError } = await client.from("lots").select("*").in("id", lotIds);
  if (lotError) throw lotError;

  const lotsById = new Map((lots ?? []).map((lot) => [lot.id, mapLot(lot)]));
  return lotIds.map((lotId) => lotsById.get(lotId)).filter((lot): lot is Lot => Boolean(lot));
}

export async function addFavoriteLot(userId: string, lotId: string): Promise<FavoriteRow> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("lot_favorites")
    .insert({ user_id: userId, lot_id: lotId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavoriteLot(userId: string, lotId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from("lot_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("lot_id", lotId);

  if (error) throw error;
}

export async function getOwnBids(userId: string): Promise<BuyerBid[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from("bid_history")
    .select("*")
    .eq("bidder_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((bid) => ({
    id: bid.id,
    lot_id: bid.lot_id,
    amount: bid.amount,
    bidder_alias: bid.bidder_alias,
    created_at: bid.created_at,
  }));
}
