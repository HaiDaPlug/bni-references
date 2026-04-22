import { createClient } from "@/utils/supabase/client";
import { Member, SearchEntry } from "./types";
import { weekKeyToLabel, parseWeekKey } from "./week-utils";

const supabase = createClient();

// --- Mappers ---

function mapMember(row: Record<string, unknown>): Member {
  return {
    id: row.id as string,
    name: row.name as string,
    companyName: row.company_name as string,
    active: row.active as boolean,
  };
}

function mapEntry(row: Record<string, unknown>): SearchEntry {
  const weekKey = row.week_key as string;
  const { year, weekNumber } = parseWeekKey(weekKey);
  return {
    id: row.id as string,
    weekKey,
    weekLabel: weekKeyToLabel(weekKey),
    year,
    weekNumber,
    memberId: row.member_id as string,
    searchText: row.search_text as string,
    contactPerson: row.contact_person as string | undefined,
    geography: row.geography as string | undefined,
    industry: row.industry as string | undefined,
    note: row.note as string | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// --- Members ---

export async function getMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("name");
  if (error) throw error;
  return data.map(mapMember);
}

export async function getMember(id: string): Promise<Member | undefined> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return undefined;
  return mapMember(data);
}

// --- Search Entries ---

export async function getSearchEntries(): Promise<SearchEntry[]> {
  const { data, error } = await supabase
    .from("search_entries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapEntry);
}

export async function getSearchEntriesByWeek(weekKey: string): Promise<SearchEntry[]> {
  const { data, error } = await supabase
    .from("search_entries")
    .select("*")
    .eq("week_key", weekKey)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapEntry);
}

export async function getSearchEntriesByMember(memberId: string): Promise<SearchEntry[]> {
  const { data, error } = await supabase
    .from("search_entries")
    .select("*")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(mapEntry);
}

export async function addSearchEntry(
  entry: Omit<SearchEntry, "id" | "createdAt" | "updatedAt">
): Promise<SearchEntry> {
  const { data, error } = await supabase
    .from("search_entries")
    .insert({
      member_id: entry.memberId,
      week_key: entry.weekKey,
      search_text: entry.searchText,
      contact_person: entry.contactPerson ?? null,
      geography: entry.geography ?? null,
      industry: entry.industry ?? null,
      note: entry.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapEntry(data);
}

export async function updateSearchEntry(
  id: string,
  updates: Partial<SearchEntry>
): Promise<SearchEntry | null> {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.searchText !== undefined) payload.search_text = updates.searchText;
  if (updates.contactPerson !== undefined) payload.contact_person = updates.contactPerson ?? null;
  if (updates.geography !== undefined) payload.geography = updates.geography ?? null;
  if (updates.industry !== undefined) payload.industry = updates.industry ?? null;
  if (updates.note !== undefined) payload.note = updates.note ?? null;
  if (updates.weekKey !== undefined) payload.week_key = updates.weekKey;
  if (updates.memberId !== undefined) payload.member_id = updates.memberId;

  const { data, error } = await supabase
    .from("search_entries")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return null;
  return mapEntry(data);
}

export async function deleteSearchEntry(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("search_entries")
    .delete()
    .eq("id", id);
  return !error;
}

// --- Derived ---

export async function getAvailableWeekKeys(): Promise<string[]> {
  const { data, error } = await supabase
    .from("search_entries")
    .select("week_key");
  if (error) throw error;
  const keys = new Set(data.map((r) => r.week_key as string));
  return Array.from(keys).sort().reverse();
}

export async function getMemberSearchCount(memberId: string): Promise<number> {
  const { count, error } = await supabase
    .from("search_entries")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);
  if (error) return 0;
  return count ?? 0;
}

export async function getMemberLastActiveWeek(memberId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("search_entries")
    .select("week_key")
    .eq("member_id", memberId)
    .order("week_key", { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return weekKeyToLabel(data.week_key);
}
