"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/context";
import { getCurrentWeekKey, weekKeyToLabel, makeWeekKey, parseWeekKey } from "@/lib/week-utils";
import { ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface AddSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMemberId?: string;
  defaultWeekKey?: string;
}

function getWeeksInYear(year: number): number {
  const dec28 = new Date(year, 11, 28);
  const dayOfWeek = dec28.getDay() || 7;
  dec28.setDate(dec28.getDate() + 4 - dayOfWeek);
  const jan1 = new Date(dec28.getFullYear(), 0, 1);
  return Math.ceil(((dec28.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
}

interface WeekPickerProps {
  value: string;
  onChange: (v: string) => void;
}

function WeekPicker({ value, onChange }: WeekPickerProps) {
  const { year, weekNumber } = parseWeekKey(value);
  const [weekInput, setWeekInput] = useState<string>(String(weekNumber));
  const [dir, setDir] = useState<1 | -1>(1);
  const prefersReduced = useReducedMotion();
  const currentYear = new Date().getFullYear();

  function commitWeek(raw: string) {
    const parsed = parseInt(raw);
    const maxWeeks = getWeeksInYear(year);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= maxWeeks) {
      onChange(makeWeekKey(year, parsed));
      setWeekInput(String(parsed));
    } else {
      setWeekInput(String(weekNumber));
    }
  }

  function step(delta: number) {
    setDir(delta > 0 ? 1 : -1);
    let newWeek = weekNumber + delta;
    let newYear = year;
    const totalWeeks = getWeeksInYear(year);
    if (newWeek < 1) {
      newYear -= 1;
      newWeek = getWeeksInYear(newYear);
    } else if (newWeek > totalWeeks) {
      newYear += 1;
      newWeek = 1;
    }
    onChange(makeWeekKey(newYear, newWeek));
    setWeekInput(String(newWeek));
  }

  function stepYear(delta: number) {
    setDir(delta > 0 ? 1 : -1);
    const newYear = year + delta;
    const maxWeek = getWeeksInYear(newYear);
    const clampedWeek = Math.min(weekNumber, maxWeek);
    onChange(makeWeekKey(newYear, clampedWeek));
    setWeekInput(String(clampedWeek));
  }

  const slideVariants = prefersReduced
    ? { enter: {}, center: {}, exit: {} }
    : {
        enter: (d: number) => ({ opacity: 0, y: d > 0 ? -10 : 10 }),
        center: { opacity: 1, y: 0, transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
        exit: (d: number) => ({ opacity: 0, y: d > 0 ? 10 : -10, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] as [number, number, number, number] } }),
      };

  return (
    <div className="flex items-center gap-1 h-9 rounded-md border border-input bg-card px-2 w-full select-none">
      {/* Year */}
      <button type="button" onClick={() => stepYear(-1)}
        className="flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0">
        <ChevronDown className="h-3 w-3" />
      </button>
      <div className="overflow-hidden w-11 text-center">
        <AnimatePresence custom={dir} mode="popLayout" initial={false}>
          <motion.span key={year} custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit"
            className="block text-sm font-medium tabular-nums">
            {year}
          </motion.span>
        </AnimatePresence>
      </div>
      <button type="button" onClick={() => stepYear(1)} disabled={year >= currentYear + 1}
        className="flex items-center justify-center h-6 w-6 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 disabled:opacity-30">
        <ChevronUp className="h-3 w-3" />
      </button>

      <span className="text-border mx-1 text-sm shrink-0">·</span>

      {/* Week label */}
      <span className="text-xs text-muted-foreground shrink-0">V</span>

      {/* Typeable week input */}
      <input
        type="number"
        min={1}
        max={getWeeksInYear(year)}
        value={weekInput}
        onChange={(e) => setWeekInput(e.target.value)}
        onBlur={(e) => commitWeek(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commitWeek(weekInput);
          if (e.key === "ArrowUp") { e.preventDefault(); step(1); }
          if (e.key === "ArrowDown") { e.preventDefault(); step(-1); }
        }}
        className="w-8 bg-transparent text-sm font-medium tabular-nums text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <div className="flex flex-col ml-0.5 shrink-0">
        <button type="button" onClick={() => step(1)}
          className="flex items-center justify-center h-3.5 w-5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ChevronUp className="h-2.5 w-2.5" />
        </button>
        <button type="button" onClick={() => step(-1)}
          className="flex items-center justify-center h-3.5 w-5 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <ChevronDown className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );
}

export function AddSearchModal({ open, onOpenChange, defaultMemberId, defaultWeekKey }: AddSearchModalProps) {
  const { members, addEntry } = useApp();

  const sortedActiveMembers = members.filter(m => m.active).sort((a, b) => {
    const lastA = a.name.split(" ")[1] ?? a.name;
    const lastB = b.name.split(" ")[1] ?? b.name;
    const startsWithÅ = (s: string) => s.toUpperCase().startsWith("Å");
    if (startsWithÅ(lastA) && !startsWithÅ(lastB)) return -1;
    if (!startsWithÅ(lastA) && startsWithÅ(lastB)) return 1;
    return lastA.localeCompare(lastB, "sv");
  });

  const [memberId, setMemberId] = useState(defaultMemberId || "");
  const [weekKey, setWeekKey] = useState(defaultWeekKey || getCurrentWeekKey());
  const [searchText, setSearchText] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [geography, setGeography] = useState("");
  const [industry, setIndustry] = useState("");
  const [note, setNote] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  function resetForm() {
    setSearchText("");
    setContactPerson("");
    setGeography("");
    setIndustry("");
    setNote("");
    if (!defaultMemberId) setMemberId("");
    if (!defaultWeekKey) setWeekKey(getCurrentWeekKey());
  }

  async function handleSave(addAnother: boolean) {
    if (!memberId || !searchText.trim()) return;
    await addEntry({
      weekKey,
      weekLabel: weekKeyToLabel(weekKey),
      year: parseInt(weekKey.split("-W")[0]),
      weekNumber: parseInt(weekKey.split("-W")[1]),
      memberId,
      searchText: searchText.trim(),
      contactPerson: contactPerson.trim() || undefined,
      geography: geography.trim() || undefined,
      industry: industry.trim() || undefined,
      note: note.trim() || undefined,
      createdBy: createdBy.trim() || undefined,
    });
    if (addAnother) {
      setSearchText("");
      setContactPerson("");
      setGeography("");
      setIndustry("");
      setNote("");
      if (!defaultMemberId) {
        const idx = sortedActiveMembers.findIndex(m => m.id === memberId);
        const next = sortedActiveMembers[idx + 1];
        if (next) setMemberId(next.id);
      }
    } else {
      resetForm();
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lägg till sökning</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="member">Medlem *</Label>
              <select
                id="member"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="" className="bg-popover text-foreground">Välj medlem...</option>
                {sortedActiveMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-popover text-foreground">{m.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Vecka *</Label>
              <WeekPicker value={weekKey} onChange={setWeekKey} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="search">Sökning *</Label>
            <Input id="search" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact">Person / kontakt</Label>
              <Input id="contact" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="geo">Geografi</Label>
              <Input id="geo" value={geography} onChange={(e) => setGeography(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="industry">Bransch</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="createdBy">Tillagd av</Label>
              <Input id="createdBy" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Anteckning</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
            Avbryt
          </Button>
          <Button variant="secondary" onClick={() => handleSave(true)} disabled={!memberId || !searchText.trim()}>
            Spara & lägg till en till
          </Button>
          <Button onClick={() => handleSave(false)} disabled={!memberId || !searchText.trim()}>
            Spara
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
