"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publishedAids, categories, organizations, pendingCount } from "@/lib/aids";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Aid } from "@/lib/types";

const coverageLabel: Record<Aid["coverage"], string> = {
  national: "National", regional: "Occitanie",
  "09": "Ariège (09)", "11": "Aude (11)", "12": "Aveyron (12)", "30": "Gard (30)",
  "31": "Haute-Garonne (31)", "32": "Gers (32)", "34": "Hérault (34)", "46": "Lot (46)",
  "48": "Lozère (48)", "65": "Hautes-Pyrénées (65)", "66": "Pyrénées-Orientales (66)",
  "81": "Tarn (81)", "82": "Tarn-et-Garonne (82)",
};

export function Catalogue() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Toutes");
  const [territory, setTerritory] = useState("34");
  const [organization, setOrganization] = useState("Toutes");
  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return publishedAids.filter((aid) => {
      const textMatch = !normalized || `${aid.name} ${aid.description} ${aid.organization} ${aid.category}`.toLocaleLowerCase("fr").includes(normalized);
      const territoryMatch = territory === "all" || (territory === "34" && ["national", "regional", "34"].includes(aid.coverage)) || (territory === "regional" && ["national", "regional"].includes(aid.coverage));
      return textMatch && territoryMatch && (category === "Toutes" || aid.category === category) && (organization === "Toutes" || aid.organization === organization);
    });
  }, [query, category, territory, organization]);
  const clearFilters = () => { setQuery(""); setCategory("Toutes"); setTerritory("34"); setOrganization("Toutes"); };

  return <main className="container page">
    <h1 className="page-heading">Aides et démarches pour mamans solos</h1>
    <div className="toolbar" aria-label="Filtres du catalogue">
      <Input className="search-field" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une aide" aria-label="Rechercher une aide" />
      <Select value={territory} onChange={(event) => setTerritory(event.target.value)} aria-label="Territoire">
        <option value="34">Hérault (34)</option><option value="regional">Occitanie</option><option value="all">Toutes les zones</option>
      </Select>
      <Select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Organisme">
        <option value="Toutes">Tous les organismes</option>{organizations.map((org) => <option key={org}>{org}</option>)}
      </Select>
      <Button type="button" onClick={clearFilters}>Effacer</Button>
    </div>
    <div className="filter-row" aria-label="Catégorie">
      <button type="button" className="filter-chip" aria-pressed={category === "Toutes"} onClick={() => setCategory("Toutes")}>Toutes</button>
      {categories.map((item) => <button type="button" className="filter-chip" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <p className="result-count" aria-live="polite">{results.length} aide{results.length === 1 ? "" : "s"} publiée{results.length === 1 ? "" : "s"}</p>
    {results.length ? <div className="aid-grid">{results.map((aid) => <Link className="aid-card" href={`/aides/${aid.slug}`} key={aid.id}>
      <div><h2>{aid.name}</h2><p>{aid.description}</p></div>
      <div className="card-meta"><span className="badge">{aid.category}</span><span>{coverageLabel[aid.coverage]}</span></div>
    </Link>)}</div> : <div className="empty-state" role="status">{pendingCount > 0 && category === "Toutes" && organization === "Toutes" && !query.trim() ? `${pendingCount} dispositifs ont été recensés. Leurs fiches restent masquées pendant la vérification des règles, démarches et sources officielles.` : "Aucune aide publiée ne correspond à ces filtres. Modifiez ou effacez les filtres."}</div>}
    <footer className="footer">Les conditions et informations sont à confirmer auprès des organismes responsables.</footer>
  </main>;
}
