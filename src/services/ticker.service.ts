import { mockLiveTicker } from "@/data/mock-ticker";
import type { LiveTickerData } from "@/types/ticker";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

let liveTickerCache: LiveTickerData | null = null;

async function fetchLiveTickerFromSupabase(): Promise<LiveTickerData | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    // Find an auction that is live
    const client = supabase as unknown as SupabaseClient<Database>;
    const auctionsRes = await client.from("auctions").select("*").eq("status", "ao-vivo").limit(1);
    const auctions = auctionsRes.data as Database["public"]["Tables"]["auctions"]["Row"][] | null;
    const auctionsError = auctionsRes.error as unknown | null;
    if (auctionsError) {
      console.error("[supabase] failed to fetch live auction:", auctionsError);
      return null;
    }
    const liveAuction = auctions && auctions.length > 0 ? auctions[0] : null;
    if (!liveAuction) return null;

    // Get lots for that auction and the current highest bid
    const lotsRes = await client
      .from("lots")
      .select("*")
      .eq("auction_id", liveAuction.id)
      .order("current_bid", { ascending: false })
      .limit(1);
    const lots = lotsRes.data as Database["public"]["Tables"]["lots"]["Row"][] | null;
    const lotsError = lotsRes.error as unknown | null;
    if (lotsError) {
      console.error("[supabase] failed to fetch lots for live auction:", lotsError);
      return null;
    }

    const topLot = lots && lots.length > 0 ? lots[0] : null;
    if (!topLot) return null;

    liveTickerCache = {
      auctionTitle: liveAuction.title ?? "",
      currentLot: topLot.title ?? "",
      currentBid: topLot.current_bid ?? 0,
    };
    return liveTickerCache;
  } catch (err) {
    console.error("[supabase] unexpected error fetching live ticker:", err);
    return null;
  }
}

if (isSupabaseConfigured()) {
  void fetchLiveTickerFromSupabase();
}

/**
 * Camada de serviço/acesso a dados para o Ticker ao vivo.
 */
export function getLiveTicker(): LiveTickerData {
  return liveTickerCache ?? mockLiveTicker;
}

export async function loadLiveTicker(): Promise<LiveTickerData> {
  if (!isSupabaseConfigured()) return mockLiveTicker;
  return liveTickerCache ?? (await fetchLiveTickerFromSupabase()) ?? mockLiveTicker;
}
