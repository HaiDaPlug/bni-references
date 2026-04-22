import { Member, SearchEntry } from "./types";
import { makeWeekKey, weekKeyToLabel } from "./week-utils";

export const seedMembers: Member[] = [
  { id: "m1", name: "Andreas Åkervall", companyName: "HELkom i Borås AB", active: true },
  { id: "m2", name: "Andreas Lycken", companyName: "Gear Shift AB", active: true },
  { id: "m3", name: "Anna Wollin", companyName: "Care by Wollin", active: true },
  { id: "m4", name: "Camilla Ekberg Åsbogård", companyName: "Topline New Wave Profile AB", active: true },
  { id: "m5", name: "Camilla Palm Hjälmeby", companyName: "Hjäl-Pa Coach & Konsult AB", active: true },
  { id: "m6", name: "Carl-Johan Rydman", companyName: "Energiplan Väst AB", active: true },
  { id: "m7", name: "Elina Åhlén", companyName: "Framtida Trädgårdar", active: true },
  { id: "m8", name: "Erika Andersson", companyName: "Vivo Projekt AB", active: true },
  { id: "m9", name: "Hai Bui", companyName: "Khyte Automations", active: true },
  { id: "m10", name: "Ida Wilhelmsson", companyName: "IDWI Studio", active: true },
  { id: "m11", name: "Jeanette Isaksson", companyName: "AKISA", active: true },
  { id: "m12", name: "Jimmy Ridderstedt", companyName: "JIA Byggtjänst I Borås AB", active: true },
  { id: "m13", name: "Joakim Törnblad", companyName: "Magnus Målarn", active: true },
  { id: "m14", name: "Johan Arvidsson", companyName: "SEEL Energy AB", active: true },
  { id: "m15", name: "Johan Kallén", companyName: "VS Truck AB", active: true },
  { id: "m16", name: "Jonas Emilsson", companyName: "Skandia", active: true },
  { id: "m17", name: "Jonas Livered", companyName: "Dammråttan", active: true },
  { id: "m18", name: "Malin Hedberg", companyName: "Söderberg & Partners AB", active: true },
  { id: "m19", name: "Marie Nyström-Rahner", companyName: "Etcetera Offset AB", active: true },
  { id: "m20", name: "Nadja Törnblad", companyName: "Hovaliden AB", active: true },
  { id: "m21", name: "Rasmus Karlsson", companyName: "Rörbolaget i väst", active: true },
  { id: "m22", name: "Tomas Eklöf", companyName: "ToEk Entreprenad AB", active: true },
  { id: "m23", name: "Waddah Almouhanna", companyName: "Rithörnan Aw", active: true },
];

const w15 = makeWeekKey(2026, 15);
const w14 = makeWeekKey(2026, 14);
const w13 = makeWeekKey(2026, 13);

function entry(
  id: string,
  weekKey: string,
  memberId: string,
  searchText: string,
  opts: Partial<SearchEntry> = {}
): SearchEntry {
  return {
    id,
    weekKey,
    weekLabel: weekKeyToLabel(weekKey),
    year: parseInt(weekKey.split("-W")[0]),
    weekNumber: parseInt(weekKey.split("-W")[1]),
    memberId,
    searchText,
    createdAt: "2026-04-06T10:00:00Z",
    updatedAt: "2026-04-06T10:00:00Z",
    ...opts,
  };
}

export const seedSearchEntries: SearchEntry[] = [
  // Vecka 15
  entry("s1",  w15, "m1",  "Telefonilösning för medelstora företag i Borås", { geography: "Borås", industry: "Telefoni" }),
  entry("s2",  w15, "m3",  "Kontorsbolag som behöver företagsmassage", { industry: "Hälsa" }),
  entry("s3",  w15, "m6",  "Fastighetsägare med höga energikostnader", { industry: "Energi" }),
  entry("s4",  w15, "m9",  "Företag som vill automatisera med AI", { industry: "IT" }),
  entry("s5",  w15, "m10", "Nystartade företag som behöver professionella foton", { geography: "Borås" }),
  entry("s6",  w15, "m12", "Villabyggare i Mark eller Ulricehamn", { geography: "Mark", industry: "Bygg" }),
  entry("s7",  w15, "m14", "Bostadsrättsföreningar som behöver elektriker", { industry: "El" }),
  entry("s8",  w15, "m18", "Företag som är oförsäkrade eller underförsäkrade", { industry: "Försäkring" }),
  entry("s9",  w15, "m21", "Villabyggare med VVS-behov i Sjúhärad", { geography: "Sjúhärad", industry: "VVS" }),

  // Vecka 14
  entry("s10", w14, "m2",  "Sportklubbar som behöver profilkläder", { industry: "Detaljhandel", createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),
  entry("s11", w14, "m5",  "Chefer på mellannivå som känner sig fast", { contactPerson: "Chef/mellanchef", createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),
  entry("s12", w14, "m8",  "Tillverkningsbolag som behöver projektstyrning", { industry: "Tillverkning", createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),
  entry("s13", w14, "m11", "Småföretag som behöver redovisningshjälp", { createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),
  entry("s14", w14, "m16", "Nära pensionärer utan tjänstepension", { industry: "Försäkring", createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),
  entry("s15", w14, "m20", "Nya företag som behöver sin första hemsida", { industry: "Marknadsföring", createdAt: "2026-03-30T10:00:00Z", updatedAt: "2026-03-30T10:00:00Z" }),

  // Vecka 13
  entry("s16", w13, "m4",  "Företag som vill ha profilkläder till personalen", { industry: "Profilreklam", createdAt: "2026-03-23T10:00:00Z", updatedAt: "2026-03-23T10:00:00Z" }),
  entry("s17", w13, "m7",  "Villabyggare som vill ha trädgårdsritning", { geography: "Borås", createdAt: "2026-03-23T10:00:00Z", updatedAt: "2026-03-23T10:00:00Z" }),
  entry("s18", w13, "m13", "Fastighetsägare med måleribehov i Borås", { geography: "Borås", industry: "Hantverk", createdAt: "2026-03-23T10:00:00Z", updatedAt: "2026-03-23T10:00:00Z" }),
  entry("s19", w13, "m17", "Kontorsbolag med städavtal i Borås", { geography: "Borås", industry: "Fastighetsservice", createdAt: "2026-03-23T10:00:00Z", updatedAt: "2026-03-23T10:00:00Z" }),
  entry("s20", w13, "m22", "Fastighetsägare som behöver besiktning", { industry: "Fastighetsservice", createdAt: "2026-03-23T10:00:00Z", updatedAt: "2026-03-23T10:00:00Z" }),
];
