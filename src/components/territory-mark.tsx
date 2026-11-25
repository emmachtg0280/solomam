import { territoryLabel } from "@/lib/territories";
import type { Aid } from "@/lib/types";

export function TerritoryMark({ coverage, compact = false }: { coverage: Aid["coverage"]; compact?: boolean }) {
  if (coverage === "national") return <div className={`territory-mark territory-national${compact ? " territory-mark-compact" : ""}`}><span>Partout en France</span></div>;
  if (coverage === "regional") return <div className={`territory-mark${compact ? " territory-mark-compact" : ""}`}><span>Région</span><strong>Occitanie</strong></div>;
  return <div className={`territory-mark${compact ? " territory-mark-compact" : ""}`}><span>Département</span><strong>{territoryLabel[coverage]}</strong></div>;
}
