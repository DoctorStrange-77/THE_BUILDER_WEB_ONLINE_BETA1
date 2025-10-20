#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Usage: node ./scripts/convert-excel-to-json.mjs <input.xlsx> [output.json]
const input = process.argv[2];
const output = process.argv[3] || path.resolve(process.cwd(), 'src/data/exercises.json');

if (!input) {
  console.error('Usage: node ./scripts/convert-excel-to-json.mjs <input.xlsx> [output.json]');
  process.exit(1);
}

try {
  const workbook = XLSX.readFile(input, { cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON. defval ensures empty cells are represented as empty strings.
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  // Normalize keys and attempt to map common column names to the expected schema
  const normalized = rows.map((row) => {
    const obj = {};
    Object.entries(row).forEach(([k, v]) => {
      const key = String(k).trim().replace(/\s+/g, '_').toLowerCase();
      obj[key] = v;
    });

    // Map some common field names to canonical names if present
    if (!obj.name) {
      if (obj.esercizio) obj.name = obj.esercizio;
      else if (obj.exercise) obj.name = obj.exercise;
      else if (obj['nome']) obj.name = obj['nome'];
    }
    if (!obj.group) {
      if (obj.gruppo) obj.group = obj.gruppo;
      else if (obj.muscle_group) obj.group = obj.muscle_group;
      else if (obj.muscle) obj.group = obj.muscle;
      else if (obj.primari) obj.group = obj.primari;
      else if (obj.categoria) obj.group = obj.categoria;
    }
    if (!obj.video) {
      if (obj.link) obj.video = obj.link;
      else if (obj.url) obj.video = obj.url;
    }

    // Preserve any coefficient columns or other metadata as-is (e.g. coeff, coefficienti)
    return obj;
  });

  // Ensure output directory exists
  const outDir = path.dirname(output);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(output, JSON.stringify(normalized, null, 2), 'utf8');
  // eslint-disable-next-line no-console
  console.log(`[convert-excel] Wrote ${normalized.length} records to ${output}`);
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('[convert-excel] Error:', err);
  process.exit(2);
}
