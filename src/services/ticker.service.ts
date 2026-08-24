import { mockLiveTicker } from "@/data/mock-ticker";
import type { LiveTickerData } from "@/types/ticker";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

let liveTickerCache: LiveTickerData | null = null;

async function fetchLiveTickerFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured() || !supabase) return;

  try {
    // Find an auction that is live
    const client = supabase as unknown as SupabaseClient<Database>;
    const auctionsRes = await client.from("auctions").select("*").eq("status", "ao-vivo").limit(1);
    const auctions = auctionsRes.data as Database["public"]["Tables"]["auctions"]["Row"][] | null;
    const auctionsError = auctionsRes.error as unknown | null;
    if (auctionsError) {
      console.error("[supabase] failed to fetch live auction:", auctionsError);
      return;
    }
    const liveAuction = auctions && auctions.length > 0 ? auctions[0] : null;
    if (!liveAuction) return;

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
      return;
    }

    const topLot = lots && lots.length > 0 ? lots[0] : null;
    if (!topLot) return;

    liveTickerCache = {
      auctionTitle: liveAuction.title ?? "",
      currentLot: topLot.title ?? "",
      currentBid: topLot.current_bid ?? 0,
    };
  } catch (err) {
    console.error("[supabase] unexpected error fetching live ticker:", err);
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
