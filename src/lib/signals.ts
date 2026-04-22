import { SearchEntry, Signal, Member } from "./types";

export function generateSignals(entries: SearchEntry[], members: Member[]): Signal[] {
  if (entries.length === 0) return [];

  const signals: Signal[] = [];
  let signalId = 0;

  // Count geographies
  const geoCounts = countField(entries, "geography");
  for (const [geo, count] of geoCounts) {
    if (count >= 2) {
      signals.push({
        id: `sig-${signalId++}`,
        text: `${geo} förekommer i ${count} sökningar denna vecka.`,
        type: "geography",
      });
    }
  }

  // Count industries
  const industryCounts = countField(entries, "industry");
  const topIndustries = Array.from(industryCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (topIndustries.length === 1) {
    const [industry, count] = topIndustries[0];
    signals.push({
      id: `sig-${signalId++}`,
      text: `${industry} är vanligast med ${count} sökningar.`,
      type: "industry",
    });
  } else if (topIndustries.length > 1) {
    const names = topIndustries.map(([name]) => name).join(" och ");
    signals.push({
      id: `sig-${signalId++}`,
      text: `${names} är återkommande teman denna vecka.`,
      type: "industry",
    });
  }

  // Most active members
  const memberCounts = new Map<string, number>();
  for (const entry of entries) {
    memberCounts.set(entry.memberId, (memberCounts.get(entry.memberId) || 0) + 1);
  }
  const topMembers = Array.from(memberCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1]);

  if (topMembers.length > 0) {
    const memberNames = topMembers
      .map(([id, count]) => {
        const member = members.find((m) => m.id === id);
        return member ? `${member.name.split(" ")[0]} (${count})` : null;
      })
      .filter(Boolean);

    if (memberNames.length > 0) {
      signals.push({
        id: `sig-${signalId++}`,
        text: `${memberNames.join(", ")} har flest sökningar denna vecka.`,
        type: "member",
      });
    }
  }

  // Common words in searchText (simple keyword extraction)
  const wordCounts = countSearchWords(entries);
  const commonWords = Array.from(wordCounts.entries())
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (commonWords.length > 0 && signals.length < 5) {
    const words = commonWords.map(([word]) => `"${word}"`).join(", ");
    signals.push({
      id: `sig-${signalId++}`,
      text: `Vanliga termer: ${words}.`,
      type: "general",
    });
  }

  return signals.slice(0, 5);
}

function countField(entries: SearchEntry[], field: "geography" | "industry"): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const value = entry[field];
    if (value && value.trim()) {
      counts.set(value.trim(), (counts.get(value.trim()) || 0) + 1);
    }
  }
  return counts;
}

const STOP_WORDS = new Set([
  "i", "på", "som", "och", "för", "att", "en", "ett", "av", "med",
  "till", "den", "det", "de", "är", "var", "har", "om", "eller",
  "runt", "inom", "behöver", "vill", "hjälp", "söker", "kontakt",
]);

function countSearchWords(entries: SearchEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const words = entry.searchText
      .toLowerCase()
      .replace(/[^a-zåäöé\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const unique = new Set(words);
    for (const word of unique) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }
  return counts;
}
