import heroTouro from "@/assets/hero-touro.jpg";
import loteNelore from "@/assets/lote-nelore.jpg";
import loteNovilhas from "@/assets/lote-novilhas.jpg";
import loteFazenda from "@/assets/lote-fazenda.jpg";
import type { Auction } from "@/types/auction";

export const mockAuctions: Auction[] = [
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
    summary: "Edição encerrada com 100% dos lotes arrematados e média de R$ 61.400 por reprodutor.",
    terms: ["Resultados consolidados disponíveis no relatório da edição."],
  },
];
