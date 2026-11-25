"use client";

import Link from "next/link";
import { useMemo } from "react";
import { publishedServices } from "@/lib/services";
import type { ServiceRubric } from "@/lib/services";
import { useTerritory } from "@/components/territory-provider";

function matchesTerritory(coverage: string, territory: string) {
  const normalized = coverage.toLocaleLowerCase("fr");
  const names: Record<string, string[]> = {
    "09": ["ariège"], "11": ["aude"], "12": ["aveyron"], "30": ["gard"], "31": ["haute-garonne", "toulouse"], "32": ["gers"], "34": ["hérault", "montpellier", "béziers", "frontignan", "lunel", "puisserguier"], "46": ["lot"], "48": ["lozère"], "65": ["hautes-pyrénées"], "66": ["pyrénées-orientales"], "81": ["tarn"], "82": ["tarn-et-garonne"],
  };
  if (territory === "occitanie") return /occitanie|en ligne|france entière/.test(normalized) || Object.values(names).flat().some((name) => normalized.includes(name));
  if (territory === "all") return /en ligne|france entière|service en ligne/.test(normalized);
  return /en ligne|france entière/.test(normalized) || (names[territory] ?? []).some((name) => normalized.includes(name));
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
}

function ServiceIcon({ rubric }: { rubric: ServiceRubric }) {
  return <span className={`resource-icon resource-icon-${rubric}`} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {rubric === "droits-demarches" ? <><path d="M7 3.75h7l3 3v13.5H7z"/><path d="M14 3.75v3h3M9.5 11h5M9.5 14.5h5"/></> : rubric === "famille-enfants" ? <><path d="M4 10.5 12 4l8 6.5v9H4z"/><path d="M9.5 19.5v-5h5v5"/><path d="M12 9.1c-.9-1.1-2.7-.5-2.5.8.2 1.1 2.5 2.4 2.5 2.4s2.3-1.3 2.5-2.4c.2-1.3-1.6-1.9-2.5-.8Z"/></> : <><path d="m12 3 1.6 5.3L19 10l-5.4 1.7L12 17l-1.6-5.3L5 10l5.4-1.7L12 3Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>}
  </svg></span>;
}

function serviceKindLabel(kind: string) {
  return kind === "private-platform" ? "Service privé" : kind === "association" ? "Association" : kind === "public-directory" ? "Répertoire public" : "Service public";
}

export function ServicesCatalogue({ initialQuery = "", rubric }: { initialQuery?: string; rubric: ServiceRubric }) {
  const { territory } = useTerritory();
  const services = useMemo(() => publishedServices.filter((service) => {
    const normalized = normalize(initialQuery.trim());
    const resourceText = normalize(`${service.name} ${service.description} ${service.category} ${service.organization} ${service.rubric}`);
    const matchesQuery = !normalized || normalized.split(/\s+/).some((word) => word.length > 2 && resourceText.includes(word));
    return service.rubric === rubric && matchesTerritory(service.coverage, territory) && matchesQuery;
  }), [initialQuery, rubric, territory]);

  return services.length ? <div className="resource-grid">{services.map((service) => <Link className="resource-card" href={`/services/${service.slug}`} key={service.id}>
      <div className="resource-card-heading"><ServiceIcon rubric={service.rubric} /><span className="resource-kind">{serviceKindLabel(service.kind)}</span></div>
      <h2>{service.name}</h2>
      <p>{service.description}</p>
      <div className="resource-card-footer"><span className="resource-location" title={service.coverage}>{service.coverage}</span><span className="resource-card-link">Voir la fiche</span></div>
    </Link>)}</div> : <div className="empty-state"><h2>Aucune ressource ne correspond à cette recherche</h2><p>Essaie un autre mot-clé ou change de rubrique.</p></div>;
}

