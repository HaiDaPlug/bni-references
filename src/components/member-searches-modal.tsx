"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/context";
import { SearchEntry, Member } from "@/lib/types";

interface MemberSearchesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
  onEditEntry?: (entry: SearchEntry) => void;
}

export function MemberSearchesModal({ open, onOpenChange, member, onEditEntry }: MemberSearchesModalProps) {
  const { entries } = useApp();

  if (!member) return null;

  const memberEntries = entries
    .filter((e) => e.memberId === member.id)
    .sort((a, b) => b.weekKey.localeCompare(a.weekKey));

  // Group by week
  const byWeek = new Map<string, SearchEntry[]>();
  for (const entry of memberEntries) {
    const list = byWeek.get(entry.weekKey) || [];
    list.push(entry);
    byWeek.set(entry.weekKey, list);
  }

  const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full h-full rounded-none sm:rounded-lg sm:max-w-xl sm:h-auto sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary shrink-0">
              {initials}
            </div>
            <div>
              <DialogTitle>{member.name}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{member.companyName}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            {memberEntries.length} sökningar &middot; {byWeek.size} veckor
          </p>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {memberEntries.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Inga sökningar registrerade.
            </p>
          )}
          {Array.from(byWeek.entries()).map(([weekKey, weekEntries]) => (
            <div key={weekKey}>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                {weekEntries[0].weekLabel}
              </p>
              <div className="space-y-1.5">
                {weekEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex items-start justify-between rounded-lg border border-border bg-background p-3 transition-colors hover:bg-accent/50 cursor-pointer"
                    onClick={() => onEditEntry?.(entry)}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-sm leading-snug">{entry.searchText}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.geography && (
                          <Badge variant="secondary" className="text-[10px]">{entry.geography}</Badge>
                        )}
                        {entry.industry && (
                          <Badge variant="outline" className="text-[10px]">{entry.industry}</Badge>
                        )}
                        {entry.contactPerson && (
                          <span className="text-[10px] text-muted-foreground">{entry.contactPerson}</span>
                        )}
                      </div>
                    </div>
                    <span className="ml-3 shrink-0 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      Redigera
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
