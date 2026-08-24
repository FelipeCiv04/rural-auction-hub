/**
 * Camada de compatibilidade / Facade do Catálogo.
 *
 * Reexporta tipos, dados mock e funções de serviço para manter compatibilidade
 * retroativa com componentes e rotas existentes, servindo como ponto de transição
 * enquanto novas funcionalidades utilizam diretamente as camadas:
 * - `@/types`
 * - `@/services`
 * - `@/lib/formatters`
 * - `@/data/mock-*`
 */

import { mockAuctions } from "./mock-auctions";
import { featuredLotIds, mockLots } from "./mock-lots";
import { mockLiveTicker } from "./mock-ticker";

export * from "@/types";
export * from "@/services";
export { formatCurrency } from "@/lib/formatters";

// Alias de dados mockados para compatibilidade
export const auctions = mockAuctions;
export const lots = mockLots;
export { featuredLotIds };
export const liveTicker = mockLiveTicker;
