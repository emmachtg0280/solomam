import type { Aid } from "@/lib/types";

export const departmentCoverages: Aid["coverage"][] = ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"];

export const territoryLabel: Record<Aid["coverage"], string> = {
  national: "France entière",
  regional: "Occitanie",
  "09": "Ariège (09)",
  "11": "Aude (11)",
  "12": "Aveyron (12)",
  "30": "Gard (30)",
  "31": "Haute-Garonne (31)",
  "32": "Gers (32)",
  "34": "Hérault (34)",
  "46": "Lot (46)",
  "48": "Lozère (48)",
  "65": "Hautes-Pyrénées (65)",
  "66": "Pyrénées-Orientales (66)",
  "81": "Tarn (81)",
  "82": "Tarn-et-Garonne (82)",
};

export function aidMatchesTerritory(coverage: Aid["coverage"], territory: string) {
  if (territory === "all") return coverage === "national";
  if (territory === "occitanie") return coverage === "national" || coverage === "regional" || departmentCoverages.includes(coverage);
  return coverage === "national" || coverage === "regional" || coverage === territory;
}

export function territoryPriority(coverage: Aid["coverage"]) {
  if (coverage === "national") return 0;
  if (coverage === "regional") return 1;
  return 2;
}
