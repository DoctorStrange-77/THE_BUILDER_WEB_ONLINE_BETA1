import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ResetConfirmDialog({ open, onOpenChange, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg animate-in zoom-in/95">
        <DialogHeader>
          <DialogTitle>Conferma azione di reset</DialogTitle>
          <DialogDescription>L'operazione eliminerà tutti gli esercizi correnti dal blocco di allenamento e non potrà essere annullata.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annulla</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>Reset</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
