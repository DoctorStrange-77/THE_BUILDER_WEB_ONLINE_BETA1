import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SaveSplitDialog({ open, onOpenChange, onSave }: any) {
  const [name, setName] = useState("");
  useEffect(() => { if (!open) setName(""); }, [open]);
  const handleSaveClick = async () => {
    try {
      const ok = await onSave(name);
      if (ok) onOpenChange(false);
    } catch (e) {}
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salva Split</DialogTitle>
        </DialogHeader>
        <div className="my-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome split (lascia vuoto per data e ora)" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annulla</Button>
          </DialogClose>
          <Button onClick={handleSaveClick}>Salva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
