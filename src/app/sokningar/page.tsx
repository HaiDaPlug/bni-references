"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Topbar } from "@/components/topbar";
import { AddSearchModal } from "@/components/add-search-modal";
import { EditSearchModal } from "@/components/edit-search-modal";
import { WeeklyOverviewModal } from "@/components/weekly-overview-modal";
import { useApp } from "@/lib/context";
import { weekKeyToLabel, getCurrentWeekKey } from "@/lib/week-utils";
import { generateWeeklyExportText } from "@/lib/export";
import { SearchEntry } from "@/lib/types";
import { Copy, Search, CalendarDays, Users } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function SokningarPage() {
  const { entries, members } = useApp();
  const prefersReduced = useReducedMotion();

  const [addOpen, setAddOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SearchEntry | null>(null);
  const [weekOverview, setWeekOverview] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const weekKeys = useMemo(() => {
    const keys = new Set(entries.map((e) => e.weekKey));
    return Array.from(keys).sort().reverse();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedWeek !== "all" && e.weekKey !== selectedWeek) return false;
      if (selectedMember !== "all" && e.memberId !== selectedMember) return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const member = members.find((m) => m.id === e.memberId);
        const matchText = e.searchText.toLowerCase().includes(q);
        const matchMember = member?.name.toLowerCase().includes(q);
        const matchGeo = e.geography?.toLowerCase().includes(q);
        const matchIndustry = e.industry?.toLowerCase().includes(q);
        if (!matchText && !matchMember && !matchGeo && !matchIndustry) return false;
      }
      return true;
    });
  }, [entries, selectedWeek, selectedMember, searchFilter, members]);

  // Group by week
  const byWeek = useMemo(() => {
    const grouped = new Map<string, SearchEntry[]>();
    for (const e of filteredEntries) {
      const list = grouped.get(e.weekKey) || [];
      list.push(e);
      grouped.set(e.weekKey, list);
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredEntries]);

  // Group by member
  const byMember = useMemo(() => {
    const grouped = new Map<string, SearchEntry[]>();
    for (const e of filteredEntries) {
      const list = grouped.get(e.memberId) || [];
      list.push(e);
      grouped.set(e.memberId, list);
    }
    return Array.from(grouped.entries()).sort((a, b) => {
      const ma = members.find((m) => m.id === a[0]);
      const mb = members.find((m) => m.id === b[0]);
      return (ma?.name || "").localeCompare(mb?.name || "");
    });
  }, [filteredEntries, members]);

  function handleCopyWeek(weekKey: string, e: React.MouseEvent) {
    e.stopPropagation();
    const text = generateWeeklyExportText(weekKey, entries, members);
    navigator.clipboard.writeText(text);
    setCopied(weekKey);
    setTimeout(() => setCopied(null), 2000);
  }

  const currentWeek = getCurrentWeekKey();

  const cardVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.04 },
    },
  };
  const cardItem = prefersReduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
      };

  return (
    <div className="flex flex-col">
      <Topbar
        title="Sökningar"
        subtitle={`${entries.length} totalt`}
        onAdd={() => setAddOpen(true)}
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök bland sökningar..."
              className="pl-9"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
          </div>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all" className="bg-popover">Alla veckor</option>
            {weekKeys.map((wk) => (
              <option key={wk} value={wk} className="bg-popover">{weekKeyToLabel(wk)}</option>
            ))}
          </select>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="flex h-9 rounded-md border border-input bg-card text-foreground px-3 py-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all" className="bg-popover">Alla medlemmar</option>
            {members.filter(m => m.active).map((m) => (
              <option key={m.id} value={m.id} className="bg-popover">{m.name}</option>
            ))}
          </select>
        </div>

        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Per vecka</TabsTrigger>
            <TabsTrigger value="member">Per medlem</TabsTrigger>
          </TabsList>

          {/* ── PER VECKA: tile grid ── */}
          <TabsContent value="week" className="mt-4">
            {byWeek.length === 0 && (
              <p className="text-sm text-muted-foreground py-12 text-center">
                Inga sökningar matchar filtret.
              </p>
            )}
            <motion.div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
              variants={cardVariants}
              initial="hidden"
              animate="show"
            >
              {byWeek.map(([weekKey, weekEntries]) => {
                const memberCount = new Set(weekEntries.map((e) => e.memberId)).size;
                const isCurrentWeek = weekKey === currentWeek;
                return (
                  <motion.div
                    key={weekKey}
                    variants={cardItem}
                    whileHover={prefersReduced ? {} : { y: -2, transition: { duration: 0.15 } }}
                    className={`group relative flex flex-col rounded-xl border bg-card cursor-pointer overflow-hidden transition-colors hover:border-primary/40 hover:bg-card/80 ${
                      isCurrentWeek ? "border-primary/50" : "border-border"
                    }`}
                    onClick={() => setWeekOverview(weekKey)}
                  >
                    {isCurrentWeek && (
                      <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                    <div className="p-4 flex-1">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-0.5">
                        {weekKey.split("-W")[0]}
                      </p>
                      <p className="text-base font-bold leading-none">
                        Vecka {parseInt(weekKey.split("-W")[1])}
                      </p>
                    </div>
                    <div className="border-t border-border/60 px-4 py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Search className="h-3 w-3" />
                          {weekEntries.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {memberCount}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleCopyWeek(weekKey, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        <Copy className="h-3 w-3" />
                        {copied === weekKey ? "Kopierat!" : "Kopiera"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>

          {/* ── PER MEDLEM ── */}
          <TabsContent value="member" className="space-y-6 mt-4">
            {byMember.length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">Inga sökningar matchar filtret.</p>
            )}
            {byMember.map(([memberId, memberEntries]) => {
              const member = members.find((m) => m.id === memberId);
              const weekCount = new Set(memberEntries.map((e) => e.weekKey)).size;
              return (
                <div key={memberId} className="rounded-lg border border-border bg-card">
                  <div className="px-5 py-3.5 border-b border-border">
                    <p className="text-sm font-semibold">{member?.name || "Okänd"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {member?.companyName} &middot; {memberEntries.length} sökningar &middot; {weekCount} veckor
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {memberEntries
                        .sort((a, b) => b.weekKey.localeCompare(a.weekKey))
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-accent cursor-pointer"
                            onClick={() => setEditEntry(entry)}
                          >
                            <div>
                              <p className="text-sm">{entry.searchText}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{entry.weekLabel}</p>
                            </div>
                            <div className="flex gap-1.5 flex-shrink-0 ml-4">
                              {entry.geography && (
                                <Badge variant="secondary" className="text-[11px]">{entry.geography}</Badge>
                              )}
                              {entry.industry && (
                                <Badge variant="outline" className="text-[11px]">{entry.industry}</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </div>

      <AddSearchModal open={addOpen} onOpenChange={setAddOpen} />
      <EditSearchModal
        open={!!editEntry}
        onOpenChange={(open) => { if (!open) setEditEntry(null); }}
        entry={editEntry}
      />
      {weekOverview && (
        <WeeklyOverviewModal
          open={!!weekOverview}
          onOpenChange={(open) => { if (!open) setWeekOverview(null); }}
          weekKey={weekOverview}
          onEditEntry={(entry) => {
            setWeekOverview(null);
            setEditEntry(entry);
          }}
        />
      )}
    </div>
  );
}
