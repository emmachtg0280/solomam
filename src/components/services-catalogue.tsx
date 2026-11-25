"use client";

import Link from "next/link";
import { useMemo } from "react";
import { publishedServices } from "@/lib/services";
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

export function ServicesCatalogue({ initialQuery = "" }: { initialQuery?: string }) {
  const { territory } = useTerritory();
  const services = useMemo(() => publishedServices.filter((service) => {
    const normalized = initialQuery.trim().toLocaleLowerCase("fr");
    const matchesQuery = !normalized || `${service.name} ${service.description} ${service.category}`.toLocaleLowerCase("fr").includes(normalized);
    return matchesTerritory(service.coverage, territory) && matchesQuery;
  }), [initialQuery, territory]);

  const categories = ["Famille & accompagnement", "Santé & bien-être"] as const;
  const groupedServices = categories.map((category) => ({ category, items: services.filter((service) => service.category === category) })).filter((group) => group.items.length > 0);

  return services.length ? <div className="service-groups">{groupedServices.map(({ category, items }) => <section className="service-group" key={category} aria-labelledby={`service-group-${category}`}>
    <div className="service-group-heading"><h2 id={`service-group-${category}`}>{category}</h2><span>{items.length} {items.length > 1 ? "ressources" : "ressource"}</span></div>
    <div className="aid-grid">{items.map((service) => <Link className="aid-card" href={`/services/${service.slug}`} key={service.id}>
      <div className="aid-card-top"><span className="badge">{service.category}</span></div>
      <div><h2>{service.name}</h2><p>{service.description}</p></div>
      <div className="service-card-bottom"><span className="service-kind">{service.kind === "private-platform" ? "Service privé" : service.kind === "association" ? "Association" : service.kind === "public-directory" ? "Répertoire public" : "Service public"}</span><span className="service-location">{service.coverage}</span><span>{service.pricing}</span></div>
    </Link>)}</div>
  </section>)}</div> : <div className="empty-state"><h2>Pas encore de ressource vérifiée ici</h2><p>Les aides nationales restent accessibles dans <Link href="/aides">Aides et démarches</Link>.</p></div>;
}
