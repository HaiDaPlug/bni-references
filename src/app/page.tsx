"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddSearchModal } from "@/components/add-search-modal";
import { EditSearchModal } from "@/components/edit-search-modal";
import { WeeklyOverviewModal } from "@/components/weekly-overview-modal";
import { useApp } from "@/lib/context";
import { getCurrentWeekKey, weekKeyToLabel } from "@/lib/week-utils";
import { generateSignals } from "@/lib/signals";
import { generateWeeklyExportText } from "@/lib/export";
import { SearchEntry } from "@/lib/types";
import { Plus, Copy, ArrowUpRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { entries, members } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<SearchEntry | null>(null);
  const [copied, setCopied] = useState(false);

  const currentWeek = getCurrentWeekKey();
  const [, weekNum] = currentWeek.split("-W");
  const year = currentWeek.split("-W")[0];

  const weekEntries = useMemo(() => entries.filter((e) => e.weekKey === currentWeek), [entries, currentWeek]);
  const activeMembers = useMemo(() => new Set(weekEntries.map((e) => e.memberId)).size, [weekEntries]);
  const signals = useMemo(() => generateSignals(weekEntries, members), [weekEntries, members]);
  const totalActive = members.filter(m => m.active).length;
  const participationPct = totalActive > 0 ? Math.round((activeMembers / totalActive) * 100) : 0;
  const missing = totalActive - activeMembers;

  // Members who haven't posted this week
  const inactiveMembers = useMemo(() => {
    const activeIds = new Set(weekEntries.map((e) => e.memberId));
    return members.filter(m => m.active && !activeIds.has(m.id));
  }, [weekEntries, members]);

  // Group this week's entries by member
  const byMember = useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const e of weekEntries) {
      const list = map.get(e.memberId) || [];
      list.push(e);
      map.set(e.memberId, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [weekEntries]);

  function handleCopyExport() {
    const text = generateWeeklyExportText(currentWeek, entries, members);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero header — week identity */}
      <div className="border-b border-border px-8 pt-10 pb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">{year}</p>
          <h1 className="text-5xl font-bold tracking-tight leading-none">
            Vecka <span className="text-primary">{parseInt(weekNum)}</span>
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {weekEntries.length === 0
              ? "Inga sökningar registrerade ännu."
              : `${weekEntries.length} sökningar från ${activeMembers} av ${totalActive} medlemmar`}
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleCopyExport}>
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Kopierat!" : "Exportera vecka"}
          </Button>
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
            whileHover={{ x: 2 }}
          >
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Lägg till sökning
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="flex flex-1 divide-x divide-border">
        {/* Left — main feed */}
        <div className="flex-1 px-8 py-7 space-y-8">

          {/* Participation bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Deltagande</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                <span className="text-foreground font-semibold">{activeMembers}</span> / {totalActive}
              </span>
            </div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: participationPct + "%" }}
                transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
              />
            </div>
            {missing > 0 && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {missing} {missing === 1 ? "medlem saknas" : "medlemmar saknas"} —{" "}
                {inactiveMembers.slice(0, 3).map(m => m.name.split(" ")[0]).join(", ")}
                {inactiveMembers.length > 3 && ` +${inactiveMembers.length - 3} till`}
              </p>
            )}
          </div>

          {/* This week's entries grouped by member */}
          {weekEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-2xl font-bold mb-2">Ingen data ännu</p>
              <p className="text-sm text-muted-foreground mb-6">Starta veckan genom att lägga till den första sökningen.</p>
              <Button onClick={() => setAddOpen(true)} size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Lägg till sökning
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sökningar</span>
                <button onClick={() => setOverviewOpen(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Visa alla <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              {byMember.map(([memberId, memberEntries]) => {
                const member = members.find(m => m.id === memberId);
                const initials = member?.name.split(" ").map(n => n[0]).join("").slice(0, 2) || "?";
                return (
                  <div key={memberId}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <span className="text-xs font-semibold">{member?.name}</span>
                      <span className="text-[10px] text-muted-foreground">{member?.companyName}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground tabular-nums">{memberEntries.length}</span>
                    </div>
                    <div className="ml-8 space-y-1">
                      {memberEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="group flex items-center justify-between rounded-md px-3 py-2 hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => setEditEntry(entry)}
                        >
                          <span className="text-sm">{entry.searchText}</span>
                          <div className="flex items-center gap-1.5 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            {entry.geography && <Badge variant="secondary" className="text-[10px] h-5">{entry.geography}</Badge>}
                            {entry.industry && <Badge variant="outline" className="text-[10px] h-5">{entry.industry}</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right — signals + missing members */}
        <div className="w-72 shrink-0 px-6 py-7 space-y-8">

          {/* Signals */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Signaler</span>
            </div>
            {signals.length > 0 ? (
              <div className="space-y-4">
                {signals.map((signal) => (
                  <p key={signal.id} className="text-sm text-muted-foreground leading-relaxed border-l-2 border-amber-400/40 pl-3">
                    {signal.text}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Fler sökningar behövs för att se mönster.</p>
            )}
          </div>

          {/* Missing this week */}
          {inactiveMembers.length > 0 && (
            <div>
              <div className="mb-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Saknas denna vecka</span>
              </div>
              <div className="space-y-2">
                {inactiveMembers.slice(0, 8).map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">
                      {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{member.name}</span>
                  </div>
                ))}
                {inactiveMembers.length > 8 && (
                  <p className="text-[11px] text-muted-foreground pl-7">+{inactiveMembers.length - 8} till</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AddSearchModal open={addOpen} onOpenChange={setAddOpen} />
      <WeeklyOverviewModal
        open={overviewOpen}
        onOpenChange={setOverviewOpen}
        weekKey={currentWeek}
        onEditEntry={(entry) => { setOverviewOpen(false); setEditEntry(entry); }}
      />
      <EditSearchModal
        open={!!editEntry}
        onOpenChange={(open) => { if (!open) setEditEntry(null); }}
        entry={editEntry}
      />
    </div>
  );
}
