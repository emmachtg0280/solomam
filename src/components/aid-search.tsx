"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type SearchDestination = { label: string; href: string };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
}

function searchParam(term: string) {
  return `?search=${encodeURIComponent(term)}`;
}

function getSearchDestination(value: string): SearchDestination {
  const query = value.trim();
  const normalized = normalize(query);

  if (/\b(droit|droits|demarche|demarches|juridique|cidff)\b/.test(normalized)) {
    return { label: "Droits & démarches", href: `/droits-demarches${searchParam("CIDFF")}` };
  }

  if (/\b(emploi|travail|formation|budget|facture|chomage|salaire|fin du mois|revenus?)\b/.test(normalized)) {
    const term = /emploi|travail/.test(normalized) ? "emploi" : /formation/.test(normalized) ? "formation" : "revenus";
    return { label: "Aides & budget", href: `/aides${searchParam(term)}` };
  }

  if (/\b(aide|aides|allocation|allocations|caf|logement|rentree|prime|subvention|pension|financier|financiere)\b/.test(normalized)) {
    const term = normalized.includes("rentree") ? "rentrée" : normalized.includes("logement") ? "logement" : /revenu|financier|budget|argent/.test(normalized) ? "revenus" : query;
    return { label: "Aides & budget", href: `/aides${searchParam(term)}` };
  }

  if (/\b(enfant|enfants|fille|fils|bebe|garde|parent|famille|separation|mediation|coparentalite|ecole|scolaire|entraide|reseau|reseaux|mamans solos)\b/.test(normalized)) {
    const term = /separation|mediation/.test(normalized) ? "médiation" : /mamans solos/.test(normalized) ? "solo" : /entraide|reseau/.test(normalized) ? "entraide" : "enfant";
    return { label: "Famille & enfants", href: `/famille${searchParam(term)}` };
  }

  if (/\b(cosmetique|cosmetiques|produit|produits|prix|reduction|reductions|bon plan|bons plans|sante|bien etre|soin|soins)\b/.test(normalized)) {
    const term = /sante|bien etre|soin/.test(normalized) ? "santé" : "cosmétiques";
    return { label: "Vie quotidienne", href: `/vie-a-soi${searchParam(term)}` };
  }

  if (/\b(association|associations|organisme)\b/.test(normalized)) {
    return { label: "Famille & enfants", href: `/famille${searchParam("entraide")}` };
  }

  return { label: "Aides & budget", href: `/aides${searchParam(query)}` };
}

export function AidSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const destination = query.trim() ? getSearchDestination(query) : null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    router.push(term ? getSearchDestination(term).href : "/aides");
  }

  return <>
    <form className={`aid-search${compact ? " aid-search-compact" : ""}`} onSubmit={submit} role="search">
      <label className="visually-hidden" htmlFor={compact ? "aid-search-compact" : "aid-search-home"}>Rechercher une aide ou une ressource</label>
      <input id={compact ? "aid-search-compact" : "aid-search-home"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Une aide, un sujet, un organisme…" />
      <button type="submit">Rechercher</button>
    </form>
    {!compact && destination && <p className="search-route-hint" aria-live="polite">Ta recherche ira dans <strong>{destination.label}</strong></p>}
  </>;
}
