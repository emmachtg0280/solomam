"use client";

import Link from "next/link";
import { publishedAids } from "@/lib/aids";
import { TerritoryMark } from "@/components/territory-mark";
import { useTerritory } from "@/components/territory-provider";
import { aidMatchesTerritory, territoryLabel, territoryPriority } from "@/lib/territories";

export function AidHighlights() {
  const { territory } = useTerritory();
  const featuredAids = publishedAids.filter((aid) => aidMatchesTerritory(aid.coverage, territory)).sort((a, b) => {
    if (territory !== "occitanie" && territory !== "all") {
      const localFirst = Number(b.coverage === territory) - Number(a.coverage === territory);
      if (localFirst) return localFirst;
    }
    return territoryPriority(a.coverage) - territoryPriority(b.coverage) || a.name.localeCompare(b.name, "fr");
  }).slice(0, 6);

  return <section className="aid-preview-section" id="coups-de-pouce">
    <div className="aid-preview-container">
      <div className="aid-preview-heading">
        <div><p className="eyebrow">Des informations fiables, plus faciles à comprendre</p><h2>Aides & budget</h2><p>Une première sélection de dispositifs, avec leurs conditions et leurs sources.</p></div>
        <Link className="button button-secondary" href="/aides">Voir toutes les aides</Link>
      </div>
      {featuredAids.length ? <div className="aid-preview-results">
        {featuredAids.map((aid) => <Link href={`/aides/${aid.slug}`} className="aid-preview-card" key={aid.id}>
          <strong>{aid.name}</strong>
          <span className="aid-preview-description">{aid.description}</span>
          <div className="aid-preview-card-footer"><TerritoryMark coverage={aid.coverage} compact /><span className="verified-mini">Information vérifiée</span></div>
        </Link>)}
      </div> : <p className="empty-state">Aucune aide publiée n’est encore disponible pour ce territoire.</p>}
      <p className="aid-preview-note"><span aria-hidden="true">✓</span> Les informations sont sourcées. Pense à confirmer ta situation auprès de l’organisme.</p>
    </div>
  </section>;
}

export function LocalDiscovery() {
  const { territory } = useTerritory();
  const localLabel = territory === "all" ? "Partout en France" : territory === "occitanie" ? "En Occitanie" : territoryLabel[territory as keyof typeof territoryLabel];

  return <section className="local-section" id="dans-le-coin">
    <div className="container local-layout">
      <div className="local-copy"><p className="eyebrow">{localLabel}</p><h2>Des soutiens près de chez toi</h2><p>Associations, services publics et réseaux d’entraide classés selon ton besoin. Choisis ton département dans le menu pour adapter les résultats.</p><Link className="button button-dark" href="/famille">Découvrir les accompagnements</Link></div>
    </div>
  </section>;
}
