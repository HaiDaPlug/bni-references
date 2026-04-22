"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context";
import { weekKeyToLabel } from "@/lib/week-utils";
import { SearchEntry } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface WeeklyOverviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekKey: string;
  onEditEntry?: (entry: SearchEntry) => void;
}

export function WeeklyOverviewModal({ open, onOpenChange, weekKey, onEditEntry }: WeeklyOverviewModalProps) {
  const { entries, members, deleteEntry } = useApp();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const weekEntries = entries.filter((e) => e.weekKey === weekKey);

  const grouped = new Map<string, SearchEntry[]>();
  for (const entry of weekEntries) {
    const list = grouped.get(entry.memberId) || [];
    list.push(entry);
    grouped.set(entry.memberId, list);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (confirmId === id) {
      deleteEntry(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); setConfirmId(null); }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{weekKeyToLabel(weekKey)}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {weekEntries.length} sökningar från {grouped.size} medlemmar
          </p>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {Array.from(grouped.entries()).map(([memberId, memberEntries]) => {
            const member = members.find((m) => m.id === memberId);
            return (
              <div key={memberId}>
                <div className="mb-2">
                  <p className="text-sm font-semibold">{member?.name || "Okänd"}</p>
                  <p className="text-xs text-muted-foreground">{member?.companyName}</p>
                </div>
                <div className="space-y-2">
                  {memberEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex items-start justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                      onClick={() => onEditEntry?.(entry)}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm">{entry.searchText}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {entry.geography && (
                            <Badge variant="secondary" className="text-[11px]">
                              {entry.geography}
                            </Badge>
                          )}
                          {entry.industry && (
                            <Badge variant="outline" className="text-[11px]">
                              {entry.industry}
                            </Badge>
                          )}
                          {entry.contactPerson && (
                            <span className="text-[11px] text-muted-foreground">
                              {entry.contactPerson}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[11px] text-muted-foreground">Redigera</span>
                        <button
                          onClick={(e) => handleDelete(e, entry.id)}
                          className={`flex items-center gap-1 text-[11px] transition-colors ${
                            confirmId === entry.id
                              ? "text-destructive font-semibold"
                              : "text-muted-foreground hover:text-destructive"
                          }`}
                        >
                          <Trash2 className="h-3 w-3" />
                          {confirmId === entry.id ? "Bekräfta" : ""}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {weekEntries.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Inga sökningar registrerade för denna vecka.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
