import { mockLiveTicker } from "@/data/mock-ticker";
import type { LiveTickerData } from "@/types/ticker";

/**
 * Camada de serviço/acesso a dados para o Ticker ao vivo.
 */
export function getLiveTicker(): LiveTickerData {
  return mockLiveTicker;
}
