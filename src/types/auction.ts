export type AuctionStatus = "ao-vivo" | "agendado" | "encerrado";

export interface Auction {
  id: string;
  code: string;
  title: string;
  status: AuctionStatus;
  date: string;
  time: string;
  location: string;
  offer: string;
  promoter: string;
  cover: string;
  summary: string;
  terms: string[];
}

export interface AuctionFilter {
  status?: AuctionStatus;
  search?: string;
  limit?: number;
}

export const statusLabels: Record<AuctionStatus, string> = {
  "ao-vivo": "Ao Vivo",
  agendado: "Agendado",
  encerrado: "Encerrado",
};
