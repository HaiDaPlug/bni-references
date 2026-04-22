"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Member, SearchEntry } from "./types";
import * as store from "./store";
import { createClient } from "@/utils/supabase/client";
import { getCurrentWeekKey } from "./week-utils";

interface AppState {
  members: Member[];
  entries: SearchEntry[];
  selectedWeek: string;
  loading: boolean;
  refresh: () => Promise<void>;
  setSelectedWeek: (weekKey: string) => void;
  addEntry: (entry: Omit<SearchEntry, "id" | "createdAt" | "updatedAt">) => Promise<SearchEntry>;
  updateEntry: (id: string, updates: Partial<SearchEntry>) => Promise<SearchEntry | null>;
  deleteEntry: (id: string) => Promise<boolean>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekKey());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [m, e] = await Promise.all([store.getMembers(), store.getSearchEntries()]);
    setMembers(m);
    setEntries(e);
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));

    const supabase = createClient();
    const channel = supabase
      .channel("search_entries_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "search_entries" }, () => {
        refresh();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const addEntry = useCallback(
    async (entry: Omit<SearchEntry, "id" | "createdAt" | "updatedAt">) => {
      const newEntry = await store.addSearchEntry(entry);
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    },
    []
  );

  const updateEntry = useCallback(async (id: string, updates: Partial<SearchEntry>) => {
    const updated = await store.updateSearchEntry(id, updates);
    if (updated) setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    const result = await store.deleteSearchEntry(id);
    if (result) setEntries((prev) => prev.filter((e) => e.id !== id));
    return result;
  }, []);

  return (
    <AppContext.Provider
      value={{
        members,
        entries,
        selectedWeek,
        loading,
        refresh,
        setSelectedWeek,
        addEntry,
        updateEntry,
        deleteEntry,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
