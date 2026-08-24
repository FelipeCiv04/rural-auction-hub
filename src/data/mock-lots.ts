import heroTouro from "@/assets/hero-touro.jpg";
import loteNelore from "@/assets/lote-nelore.jpg";
import loteNovilhas from "@/assets/lote-novilhas.jpg";
import loteFazenda from "@/assets/lote-fazenda.jpg";
import type { Lot } from "@/types/lot";

export const mockLots: Lot[] = [
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
