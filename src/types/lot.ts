export type LotCategory = "elite" | "comercial" | "imovel";

export interface LotSpec {
  label: string;
  value: string;
}

export interface BidHistoryItem {
  bidder: string;
  amount: number;
  at: string;
}

export interface Lot {
  id: string;
  number: string;
  title: string;
  category: LotCategory;
  auctionId: string;
  image: string;
  currentBid: number | null;
  bidLabel: string;
  increment: number;
  specs: LotSpec[];
  description: string;
  seller: string;
  bidHistory: BidHistoryItem[];
}

export interface LotFilter {
  category?: LotCategory;
  auctionId?: string;
  featured?: boolean;
}

export const categoryLabels: Record<LotCategory, string> = {
  elite: "Elite",
  comercial: "Comercial",
  imovel: "Imóvel",
};
