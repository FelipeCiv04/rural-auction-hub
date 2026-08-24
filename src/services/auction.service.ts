import { mockAuctions } from "@/data/mock-auctions";
import type { Auction, AuctionFilter } from "@/types/auction";

/**
 * Camada de serviço/acesso a dados de leilões (Auctions).
 *
 * Atualmente consome os dados mockados como fallback e está preparada para
 * receber chamadas assíncronas / queries reais a banco de dados.
 */
export function getAuctions(filter?: AuctionFilter): Auction[] {
  let result = [...mockAuctions];

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
  return mockAuctions.find((auction) => auction.id === id);
}

export function getUpcomingAuctions(limit = 3): Auction[] {
  return mockAuctions.filter((auction) => auction.status !== "encerrado").slice(0, limit);
}
