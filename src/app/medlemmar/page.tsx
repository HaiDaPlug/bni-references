"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/topbar";
import { AddSearchModal } from "@/components/add-search-modal";
import { EditSearchModal } from "@/components/edit-search-modal";
import { MemberSearchesModal } from "@/components/member-searches-modal";
import { useApp } from "@/lib/context";
import { Member, SearchEntry } from "@/lib/types";
import { Plus, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export default function MedlemmarPage() {
  const { members, entries } = useApp();
  const prefersReduced = useReducedMotion();

  const [addOpen, setAddOpen] = useState(false);
  const [addForMember, setAddForMember] = useState<string | undefined>();
  const [editEntry, setEditEntry] = useState<SearchEntry | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const memberStats = useMemo(() => {
    const stats = new Map<string, { total: number; lastWeek: string | null }>();
    for (const m of members) {
      const memberEntries = entries
        .filter((e) => e.memberId === m.id)
        .sort((a, b) => b.weekKey.localeCompare(a.weekKey));
      stats.set(m.id, {
        total: memberEntries.length,
        lastWeek: memberEntries[0]?.weekLabel || null,
      });
    }
    return stats;
  }, [members, entries]);

  const gridVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.05 } },
  };
  const cardVariant = prefersReduced
    ? { hidden: {}, show: {} }
    : {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
      };

  return (
    <div className="flex flex-col">
      <Topbar
        title="Medlemmar"
        subtitle={`${members.filter(m => m.active).length} aktiva`}
        onAdd={() => { setAddForMember(undefined); setAddOpen(true); }}
      />

      <div className="p-6">
        <motion.div
          className="grid grid-cols-2 gap-4 lg:grid-cols-3"
          variants={gridVariants}
          initial="hidden"
          animate="show"
        >
          {members.filter(m => m.active).map((member) => {
            const stats = memberStats.get(member.id);
            const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2);

            return (
              <motion.div
                key={member.id}
                variants={cardVariant}
                whileHover={prefersReduced ? {} : { y: -2, transition: { duration: 0.15 } }}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:border-border/80 transition-colors"
              >
                <div
                  className="p-5 cursor-pointer flex-1"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.companyName}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddForMember(member.id);
                        setAddOpen(true);
                      }}
                      className="ml-2 shrink-0 flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {stats?.total || 0} sökningar
                    </span>
                    {stats?.lastWeek && (
                      <span className="truncate">Senast: {stats.lastWeek}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AddSearchModal
        open={addOpen}
        onOpenChange={(open) => { setAddOpen(open); if (!open) setAddForMember(undefined); }}
        defaultMemberId={addForMember}
      />
      <EditSearchModal
        open={!!editEntry}
        onOpenChange={(open) => { if (!open) setEditEntry(null); }}
        entry={editEntry}
      />
      <MemberSearchesModal
        open={!!selectedMember}
        onOpenChange={(open) => { if (!open) setSelectedMember(null); }}
        member={selectedMember}
        onEditEntry={(entry) => {
          setSelectedMember(null);
          setEditEntry(entry);
        }}
      />
    </div>
  );
}
