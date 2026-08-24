import { featuredLotIds, mockLots } from "@/data/mock-lots";
import type { Lot, LotFilter } from "@/types/lot";

/**
 * Camada de serviço/acesso a dados de lotes (Lots).
 *
 * Atualmente consome os dados mockados como fallback e está preparada para
 * receber chamadas assíncronas / queries reais a banco de dados.
 */
export function getLots(filter?: LotFilter): Lot[] {
  let result = [...mockLots];

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
  return mockLots.find((lot) => lot.id === id);
}

export function getLotsByAuction(auctionId: string): Lot[] {
  return mockLots.filter((lot) => lot.auctionId === auctionId);
}

export function getFeaturedLots(): Lot[] {
  return featuredLotIds.map((id) => getLotById(id)).filter((lot): lot is Lot => Boolean(lot));
}
