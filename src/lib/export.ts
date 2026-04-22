import { SearchEntry, Member } from "./types";
import { weekKeyToLabel } from "./week-utils";

export function generateWeeklyExportText(
  weekKey: string,
  entries: SearchEntry[],
  members: Member[]
): string {
  const weekEntries = entries.filter((e) => e.weekKey === weekKey);
  if (weekEntries.length === 0) return `${weekKeyToLabel(weekKey)}\n\nInga sökningar registrerade.`;

  const grouped = new Map<string, SearchEntry[]>();
  for (const entry of weekEntries) {
    const list = grouped.get(entry.memberId) || [];
    list.push(entry);
    grouped.set(entry.memberId, list);
  }

  const lines: string[] = [weekKeyToLabel(weekKey), ""];

  for (const [memberId, memberEntries] of grouped) {
    const member = members.find((m) => m.id === memberId);
    const name = member ? `${member.name} (${member.companyName})` : "Okänd medlem";
    lines.push(name);
    for (const e of memberEntries) {
      lines.push(`- ${e.searchText}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim();
}
