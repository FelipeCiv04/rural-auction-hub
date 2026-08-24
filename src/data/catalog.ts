/**
 * Dados mock do catálogo.
 *
 * Esta camada existe para ser trocada depois por consultas reais (banco de
 * dados / server functions) sem alterar componentes ou páginas: mantenha as
 * assinaturas de `getAuctions`, `getAuctionById`, `getLotById`, etc.
 */

import heroTouro from "@/assets/hero-touro.jpg";
import loteNelore from "@/assets/lote-nelore.jpg";
import loteNovilhas from "@/assets/lote-novilhas.jpg";
import loteFazenda from "@/assets/lote-fazenda.jpg";

export type AuctionStatus = "ao-vivo" | "agendado" | "encerrado";
export type LotCategory = "elite" | "comercial" | "imovel";

export interface LotSpec {
  label: string;
  value: string;
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
  bidHistory: { bidder: string; amount: number; at: string }[];
}

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

export const auctions: Auction[] = [
  {
    id: "42-remate-outono",
    code: "42",
    title: "42º Remate de Outono",
    status: "ao-vivo",
    date: "24 MAIO, 2026",
    time: "19:00",
    location: "Estância Boa Vista, RS",
    offer: "50 Touros Angus",
    promoter: "Estância Boa Vista",
    cover: heroTouro,
    summary:
      "Oferta de touros Angus avaliados por índice de carcaça, com aptidão comprovada para cruzamento industrial em pasto de inverno.",
    terms: [
      "Pagamento em até 30 parcelas com carência de 90 dias.",
      "Frete por conta do arrematante, com apoio logístico da casa.",
      "Garantia de fertilidade de 12 meses para reprodutores.",
    ],
  },
  {
    id: "liquidacao-genetica-prime",
    code: "43",
    title: "Liquidação Genética Prime",
    status: "agendado",
    date: "12 JUNHO, 2026",
    time: "20:00",
    location: "Campo Grande, MS",
    offer: "60 Matrizes Nelore PO",
    promoter: "Fazenda Santa Clara",
    cover: loteNelore,
    summary:
      "Plantel completo de matrizes Nelore PO com registro definitivo, avaliação zootécnica individual e histórico reprodutivo auditado.",
    terms: [
      "Lances homologados após conferência documental do registro.",
      "Comissão de 5% sobre o valor de arremate.",
      "Retirada dos animais em até 15 dias após o remate.",
    ],
  },
  {
    id: "remate-recria-industrial",
    code: "44",
    title: "Remate Recria Industrial",
    status: "agendado",
    date: "28 JUNHO, 2026",
    time: "14:00",
    location: "Uberaba, MG",
    offer: "320 Bezerros e Novilhas",
    promoter: "Agropecuária Vale Verde",
    cover: loteNovilhas,
    summary:
      "Lotes fechados de recria com peso médio aferido na balança do parque, ideais para engorda em confinamento.",
    terms: [
      "Lotes vendidos por cabeça, sem desmembramento.",
      "Pesagem oficial no dia do embarque.",
      "Rastreabilidade SISBOV inclusa.",
    ],
  },
  {
    id: "imoveis-rurais-vale-do-ouro",
    code: "45",
    title: "Imóveis Rurais Vale do Ouro",
    status: "agendado",
    date: "10 JULHO, 2026",
    time: "10:00",
    location: "Dourados, MS",
    offer: "8 Propriedades",
    promoter: "Terroir Imóveis Rurais",
    cover: loteFazenda,
    summary:
      "Fazendas estruturadas para lavoura e pecuária, com matrícula regular, outorga de água e laudo de avaliação atualizado.",
    terms: [
      "Sinal de 20% no ato do arremate.",
      "Escritura em até 60 dias após quitação.",
      "Visita técnica agendada previamente.",
    ],
  },
  {
    id: "41-remate-de-verao",
    code: "41",
    title: "41º Remate de Verão",
    status: "encerrado",
    date: "18 FEVEREIRO, 2026",
    time: "19:00",
    location: "Estância Boa Vista, RS",
    offer: "44 Touros Angus",
    promoter: "Estância Boa Vista",
    cover: heroTouro,
    summary:
      "Edição encerrada com 100% dos lotes arrematados e média de R$ 61.400 por reprodutor.",
    terms: ["Resultados consolidados disponíveis no relatório da edição."],
  },
];

export const lots: Lot[] = [
  {
    id: "012-dama-da-noite",
    number: "012",
    title: "Dama da Noite 452",
    category: "elite",
    auctionId: "liquidacao-genetica-prime",
    image: loteNelore,
    currentBid: 82000,
    bidLabel: "Lance Atual",
    increment: 2000,
    specs: [
      { label: "Raça", value: "Nelore PO" },
      { label: "Peso", value: "680 kg" },
      { label: "Idade", value: "32 Meses" },
      { label: "IABCZ", value: "+18.42" },
    ],
    description:
      "Matriz de estrutura profunda e ossatura correta, filha de reprodutor provado em central. Diagnóstico de gestação confirmado no último manejo.",
    seller: "Fazenda Santa Clara",
    bidHistory: [
      { bidder: "Comprador 214", amount: 82000, at: "há 4 min" },
      { bidder: "Comprador 088", amount: 80000, at: "há 11 min" },
      { bidder: "Comprador 145", amount: 76500, at: "há 26 min" },
    ],
  },
  {
    id: "045-combo-novilhas",
    number: "045",
    title: "Combo 05 Novilhas",
    category: "comercial",
    auctionId: "remate-recria-industrial",
    image: loteNovilhas,
    currentBid: 18500,
    bidLabel: "Lance Sugerido",
    increment: 500,
    specs: [
      { label: "Raça", value: "Cruzamento Industrial" },
      { label: "Peso Médio", value: "420 kg" },
      { label: "Era", value: "Sobreano" },
      { label: "Cabeças", value: "05" },
    ],
    description:
      "Lote homogêneo de novilhas criadas a pasto com suplementação proteica, aptas para cobertura na próxima estação de monta.",
    seller: "Agropecuária Vale Verde",
    bidHistory: [{ bidder: "Comprador 031", amount: 18500, at: "há 1 h" }],
  },
  {
    id: "102-fazenda-santa-cruz",
    number: "102",
    title: "Fazenda Santa Cruz",
    category: "imovel",
    auctionId: "imoveis-rurais-vale-do-ouro",
    image: loteFazenda,
    currentBid: null,
    bidLabel: "Avaliação",
    increment: 0,
    specs: [
      { label: "Área", value: "450 Hectares" },
      { label: "Uso", value: "Lavoura/Pecuária" },
      { label: "Local", value: "Dourados - MS" },
      { label: "Matrícula", value: "Regular" },
    ],
    description:
      "Propriedade com sede, dois galpões, 12 piquetes cercados e açude perene. Topografia plana, apta a duas safras por ano.",
    seller: "Terroir Imóveis Rurais",
    bidHistory: [],
  },
  {
    id: "084-touro-angus-528",
    number: "084",
    title: "Angus Prime 528",
    category: "elite",
    auctionId: "42-remate-outono",
    image: heroTouro,
    currentBid: 42500,
    bidLabel: "Lance Atual",
    increment: 1500,
    specs: [
      { label: "Raça", value: "Angus PO" },
      { label: "Peso", value: "810 kg" },
      { label: "Idade", value: "28 Meses" },
      { label: "Carcaça", value: "AA+" },
    ],
    description:
      "Reprodutor de biotipo pesado, avaliado em prova de ganho de peso, com exame andrológico apto emitido no mês da oferta.",
    seller: "Estância Boa Vista",
    bidHistory: [
      { bidder: "Comprador 102", amount: 42500, at: "agora" },
      { bidder: "Comprador 077", amount: 41000, at: "há 2 min" },
    ],
  },
  {
    id: "017-matriz-bravura",
    number: "017",
    title: "Bravura da Serra",
    category: "elite",
    auctionId: "liquidacao-genetica-prime",
    image: loteNelore,
    currentBid: 124000,
    bidLabel: "Lance Atual",
    increment: 4000,
    specs: [
      { label: "Raça", value: "Nelore PO" },
      { label: "Peso", value: "705 kg" },
      { label: "Idade", value: "36 Meses" },
      { label: "IABCZ", value: "+21.08" },
    ],
    description:
      "Matriz premiada em pista regional, com duas crias registradas e genealogia dupla de reprodutores de central.",
    seller: "Fazenda Santa Clara",
    bidHistory: [{ bidder: "Comprador 190", amount: 124000, at: "há 18 min" }],
  },
  {
    id: "058-bezerros-desmama",
    number: "058",
    title: "Bezerros Desmama",
    category: "comercial",
    auctionId: "remate-recria-industrial",
    image: loteNovilhas,
    currentBid: 96000,
    bidLabel: "Lance Sugerido",
    increment: 1000,
    specs: [
      { label: "Raça", value: "Nelore Comercial" },
      { label: "Peso Médio", value: "230 kg" },
      { label: "Era", value: "Desmama" },
      { label: "Cabeças", value: "50" },
    ],
    description:
      "Bezerros desmamados com protocolo vacinal completo e curva de peso registrada desde o nascimento.",
    seller: "Agropecuária Vale Verde",
    bidHistory: [],
  },
];

export const featuredLotIds = ["012-dama-da-noite", "045-combo-novilhas", "102-fazenda-santa-cruz"];

export const categoryLabels: Record<LotCategory, string> = {
  elite: "Elite",
  comercial: "Comercial",
  imovel: "Imóvel",
};

export const statusLabels: Record<AuctionStatus, string> = {
  "ao-vivo": "Ao Vivo",
  agendado: "Agendado",
  encerrado: "Encerrado",
};

export const liveTicker = {
  auctionTitle: "42º Remate de Outono",
  currentLot: "084",
  currentBid: 42500,
};

export function getAuctions(): Auction[] {
  return auctions;
}

export function getAuctionById(id: string): Auction | undefined {
  return auctions.find((auction) => auction.id === id);
}

export function getUpcomingAuctions(limit = 3): Auction[] {
  return auctions.filter((auction) => auction.status !== "encerrado").slice(0, limit);
}

export function getLots(): Lot[] {
  return lots;
}

export function getLotById(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

export function getLotsByAuction(auctionId: string): Lot[] {
  return lots.filter((lot) => lot.auctionId === auctionId);
}

export function getFeaturedLots(): Lot[] {
  return featuredLotIds
    .map((id) => getLotById(id))
    .filter((lot): lot is Lot => Boolean(lot));
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}
