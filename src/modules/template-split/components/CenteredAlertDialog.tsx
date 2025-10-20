import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function CenteredAlertDialog({ open, onOpenChange, title, message }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg shadow-xl animate-in zoom-in/95">
        <DialogHeader>
          {title && <DialogTitle className="text-lg">{title}</DialogTitle>}
        </DialogHeader>
        <div className="py-6">
          <div className="text-center text-2xl font-bold text-foreground">{message}</div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
