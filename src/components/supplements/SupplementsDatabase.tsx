import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Supplement } from "@/types/supplements";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";

interface SupplementsDatabaseProps {
  supplements: Supplement[];
  onAdd: (supplement: Omit<Supplement, "id">) => void;
  onUpdate: (id: string, updates: Partial<Supplement>) => void;
  onDelete: (id: string) => void;
}

export const SupplementsDatabase = ({
  supplements,
  onAdd,
  onUpdate,
  onDelete,
}: SupplementsDatabaseProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "g",
    notes: "",
  });

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error("Nome e categoria sono obbligatori");
      return;
    }
    onAdd(formData);
    setFormData({ name: "", category: "", unit: "g", notes: "" });
    setIsAdding(false);
    toast.success("Integratore aggiunto");
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingId(supplement.id);
    setFormData({
      name: supplement.name,
      category: supplement.category,
      unit: supplement.unit,
      notes: supplement.notes || "",
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error("Nome e categoria sono obbligatori");
      return;
    }
    onUpdate(editingId, formData);
    setEditingId(null);
    setFormData({ name: "", category: "", unit: "g", notes: "" });
    toast.success("Integratore aggiornato");
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", category: "", unit: "g", notes: "" });
  };

  const handleDelete = (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo integratore?")) {
      onDelete(id);
      toast.success("Integratore eliminato");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Database Integratori</CardTitle>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="h-4 w-4 mr-2" />
            Aggiungi Integratore
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Unità</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAdding && (
                <TableRow className="bg-muted/30">
                  <TableCell>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome integratore"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Categoria"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="g, mg, cpr..."
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Note opzionali"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="default" onClick={handleAdd}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {supplements.map((supplement) => (
                <TableRow key={supplement.id}>
                  {editingId === supplement.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="default" onClick={handleUpdate}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="font-medium">{supplement.name}</TableCell>
                      <TableCell>{supplement.category}</TableCell>
                      <TableCell>{supplement.unit}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {supplement.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(supplement)}
                            disabled={isAdding || editingId !== null}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(supplement.id)}
                            disabled={isAdding || editingId !== null}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
