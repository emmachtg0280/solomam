import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repairTree } from "./lib/repair-text.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const paths = [
  "src/data/catalogue.json",
  "src/data/review.json",
  "src/data/source-registry.json",
  "src/data/imports/occitanie/normalized/qualifications.json",
  "docs/catalogue-enrichment.md",
  "docs/occitanie-qualification.md",
  "scripts/qualify-occitanie.mjs",
];

for (const relative of paths) {
  const file = path.join(root, relative);
  const text = (await readFile(file, "utf8")).replace(/^\uFEFF/, "");
  const original = relative.endsWith(".json") ? JSON.parse(text) : text;
  const repaired = repairTree(original);
  await writeFile(file, relative.endsWith(".json") ? `${JSON.stringify(repaired, null, 2)}\n` : repaired, "utf8");
}
console.log("Repaired reversible mojibake in normalized data, catalogue, review, source registry and documentation; raw source snapshots were not modified.");
