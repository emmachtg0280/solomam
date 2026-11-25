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

  return services.length ? <div className="resource-grid">{services.map((service) => <Link className={"resource-card" + (service.cardImage ? " resource-card-with-image" : " resource-card-no-image")} href={`/services/${service.slug}`} key={service.id}>
      {service.cardImage ? <span className={`resource-card-image${service.cardImageFit === "contain" ? " resource-card-image-contain" : ""}`} style={{ backgroundImage: 'url("' + service.cardImage + '")' }} aria-hidden="true" /> : null}
      <div className="resource-card-copy">
        <div className="resource-card-heading"><span className="resource-kind">{serviceKindLabel(service.kind)}</span></div>
        <h2>{service.name}</h2>
        <p>{service.description}</p>
        <div className="resource-card-footer"><span className="resource-location" title={service.coverage}>{service.coverage}</span><span className="resource-card-link">Voir la fiche</span></div>
      </div>
    </Link>)}</div> : <div className="empty-state"><h2>Aucune ressource ne correspond à cette recherche</h2><p>Essaie un autre mot-clé ou change de rubrique.</p></div>;
}
