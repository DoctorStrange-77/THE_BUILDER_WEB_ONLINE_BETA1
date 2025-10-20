import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ExcelImporter() {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const handleClick = () => { inputRef.current?.click(); };
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      // @ts-ignore
      const XLSX = (await import("xlsx")) as any;
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const headerRow = json[0] as string[] | undefined;
      let colIndex = 0;
      if (headerRow && headerRow.length) {
        const found = headerRow.findIndex((h) => typeof h === "string" && h.toLowerCase().includes("distretto"));
        if (found >= 0) colIndex = found;
        else colIndex = 0;
      }
      const values = json.slice(1).map((r: any) => (Array.isArray(r) ? r[colIndex] : undefined)).filter(Boolean).map((v: any) => String(v).trim());
      const unique = Array.from(new Set(values)).filter(Boolean);
      localStorage.setItem("importedMuscleGroups", JSON.stringify(unique));
      toast.success(`Importati ${unique.length} distretti`);
    } catch (err) { console.error(err); toast.error("Errore importazione Excel"); } finally { if (inputRef.current) inputRef.current.value = ""; }
  };
  return (
    <div>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" onChange={handleFile} className="hidden" />
      <Button size="sm" variant="default" className="h-9 px-3 rounded-md border border-yellow-400 font-bold" onClick={handleClick}>IMPORTA EXCEL</Button>
    </div>
  );
}
