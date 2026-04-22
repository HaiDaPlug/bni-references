"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/context";
import { SearchEntry } from "@/lib/types";

interface EditSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: SearchEntry | null;
}

export function EditSearchModal({ open, onOpenChange, entry }: EditSearchModalProps) {
  const { updateEntry, deleteEntry } = useApp();
  const [searchText, setSearchText] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [geography, setGeography] = useState("");
  const [industry, setIndustry] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (entry) {
      setSearchText(entry.searchText);
      setContactPerson(entry.contactPerson || "");
      setGeography(entry.geography || "");
      setIndustry(entry.industry || "");
      setNote(entry.note || "");
    }
  }, [entry]);

  async function handleSave() {
    if (!entry || !searchText.trim()) return;
    await updateEntry(entry.id, {
      searchText: searchText.trim(),
      contactPerson: contactPerson.trim() || undefined,
      geography: geography.trim() || undefined,
      industry: industry.trim() || undefined,
      note: note.trim() || undefined,
    });
    onOpenChange(false);
  }

  async function handleDelete() {
    if (!entry) return;
    await deleteEntry(entry.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Redigera sökning</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="edit-search">Sökning *</Label>
            <Input
              id="edit-search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-contact">Person / kontakt</Label>
              <Input
                id="edit-contact"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-geo">Geografi</Label>
              <Input
                id="edit-geo"
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-industry">Bransch</Label>
              <Input
                id="edit-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-note">Anteckning</Label>
            <Textarea
              id="edit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Ta bort
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={!searchText.trim()}>
              Spara
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
