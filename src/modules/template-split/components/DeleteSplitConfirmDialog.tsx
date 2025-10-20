import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteSplitConfirmDialog({ open, onOpenChange, onConfirm }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shadow-lg animate-in zoom-in/95">
        <DialogHeader>
          <DialogTitle>Conferma cancellazione Split</DialogTitle>
          <DialogDescription>Sei sicuro di voler cancellare lo split selezionato? Questa operazione è permanente.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">No</Button>
          </DialogClose>
          <Button variant="destructive" onClick={() => { onConfirm(); onOpenChange(false); }}>Sì, cancella</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
