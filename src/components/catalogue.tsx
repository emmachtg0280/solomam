"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publishedAids, categories, organizations, pendingCount } from "@/lib/aids";
import { Select, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { TerritoryMark } from "@/components/territory-mark";
import { useTerritory } from "@/components/territory-provider";
import { aidMatchesTerritory, territoryPriority } from "@/lib/territories";
import type { Aid } from "@/lib/types";

function aidSort(a: Aid, b: Aid, selectedTerritory: string) {
  const priority = selectedTerritory === "occitanie" || selectedTerritory === "all"
    ? territoryPriority(a.coverage) - territoryPriority(b.coverage)
    : (a.coverage === selectedTerritory ? -1 : 0) - (b.coverage === selectedTerritory ? -1 : 0);
  return priority || a.name.localeCompare(b.name, "fr");
}

export function Catalogue({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("Toutes");
  const [organization, setOrganization] = useState("Toutes");
  const { territory } = useTerritory();

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return publishedAids.filter((aid) => {
      const textMatch = !normalized || `${aid.name} ${aid.description} ${aid.organization} ${aid.category}`.toLocaleLowerCase("fr").includes(normalized);
      return textMatch && aidMatchesTerritory(aid.coverage, territory) && (category === "Toutes" || aid.category === category) && (organization === "Toutes" || aid.organization === organization);
    }).sort((a, b) => aidSort(a, b, territory));
  }, [query, category, organization, territory]);

  const clearFilters = () => { setQuery(""); setCategory("Toutes"); setOrganization("Toutes"); };

  return <main className="container page catalogue-page">
    <div className="catalogue-intro"><p className="eyebrow eyebrow-blue">Aides & démarches</p><h1 className="page-heading">Aides et démarches</h1><p>Des aides nationales et locales, présentées avec leurs conditions, leurs sources et les démarches connues.</p></div>
    <div className="catalogue-toolbar" aria-label="Filtres du catalogue">
      <Input className="search-field" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une aide, un besoin…" aria-label="Rechercher une aide" />
      <Select value={organization} onChange={(event) => setOrganization(event.target.value)} aria-label="Filtrer par organisme">
        <option value="Toutes">Tous les organismes</option>{organizations.map((org) => <option key={org}>{org}</option>)}
      </Select>
      <Button type="button" variant="secondary" onClick={clearFilters}>Effacer</Button>
    </div>
    <p className="filter-hint">Le territoire se règle dans le menu en haut de page. Un département affiche aussi les aides d’Occitanie et de France.</p>
    <div className="filter-row" aria-label="Filtrer par sujet">
      <button type="button" className="filter-chip" aria-pressed={category === "Toutes"} onClick={() => setCategory("Toutes")}>Tout voir</button>
      {categories.map((item) => <button type="button" className="filter-chip" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
    </div>
    <div className="results-heading"><p className="result-count" aria-live="polite"><strong>{results.length}</strong> aide{results.length === 1 ? "" : "s"} publiée{results.length === 1 ? "" : "s"}</p>{(query || category !== "Toutes" || organization !== "Toutes") && <button className="reset-link" onClick={clearFilters}>Réinitialiser la recherche</button>}</div>
    {results.length ? <div className="aid-grid">{results.map((aid) => <Link className="aid-card" href={`/aides/${aid.slug}`} key={aid.id}>
      <div className="aid-card-top"><span className="badge">{aid.category}</span></div>
      <div><h2>{aid.name}</h2><p>{aid.description}</p></div>
      <div className="aid-card-bottom"><TerritoryMark coverage={aid.coverage} compact /><span className="verified-mini">Information vérifiée</span></div>
    </Link>)}</div> : <div className="empty-state"><h2>Aucune aide publiée ne correspond</h2><p>{pendingCount > 0 && category === "Toutes" && organization === "Toutes" && !query.trim() ? `${pendingCount} dispositifs ont été recensés. Leurs fiches restent masquées pendant la vérification des règles, démarches et sources officielles.` : "Change tes mots-clés ou tes filtres pour élargir la recherche."}</p><Button type="button" variant="secondary" onClick={clearFilters}>Effacer les filtres</Button></div>}
    <footer className="footer">Les informations sont à confirmer auprès des organismes responsables. <Link href="/demarches">Retrouver mes favoris</Link>.</footer>
  </main>;
}
