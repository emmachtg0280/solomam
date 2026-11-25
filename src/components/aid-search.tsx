"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

type SearchDestination = { label: string; href: (query: string) => string };

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
}

function getSearchDestination(value: string): SearchDestination {
  const query = value.trim();
  const normalized = normalize(query);
  const search = (term = query) => `?search=${encodeURIComponent(term)}`;

  if (/\b(emploi|travail|formation|budget|facture|chomage|salaire|fin du mois|revenus?)\b/.test(normalized)) {
    return { label: "Travail & budget", href: () => "/travail-argent" };
  }

  if (/\b(association|associations|organisme)\b/.test(normalized)) {
    const hint = /droit|demarche/.test(normalized) ? "CIDFF" : "entraide";
    return { label: hint === "CIDFF" ? "Droits & démarches" : "Réseaux & entraide", href: () => `/services${search(hint)}` };
  }

  if (/\b(aide|aides|allocation|allocations|droit|droits|demarche|demarches|caf|logement|rentee|prime|subvention|pension)\b/.test(normalized)) {
    const hint = normalized.includes("rentee") ? "rentrée" : normalized.includes("logement") ? "logement" : query;
    return { label: "Aides & démarches", href: () => `/aides${search(hint)}` };
  }

  if (/\b(enfant|enfants|fille|fils|bebe|garde|parent|famille|separation|mediation|coparentalite|ecole|scolaire)\b/.test(normalized)) {
    return { label: "Famille & enfants", href: () => "/famille" };
  }

  if (/\b(cosmetique|cosmetiques|produit|produits|prix|reduction|reductions|bon plan|bons plans|sante|bien etre|soin|soins|entraide|reseau|reseaux|association|associations|accueil|organisme|mamans solos)\b/.test(normalized)) {
    const hint = /cosmetique|produit|prix|reduction|bon plan/.test(normalized) ? "cosmétiques" : /droit|demarche|association/.test(normalized) ? "CIDFF" : /entraide|reseau|mamans solos/.test(normalized) ? "entraide" : /accueil|enfant|bebe/.test(normalized) ? "enfant" : /soin|sante|bien etre/.test(normalized) ? "santé" : query;
    const label = hint === "cosmétiques" ? "Vie quotidienne" : hint === "entraide" ? "Réseaux & entraide" : hint === "santé" ? "Santé & bien-être" : hint === "CIDFF" ? "Droits & démarches" : "Famille & enfants";
    return { label, href: () => `/services${search(hint)}` };
  }

  return { label: "Aides & démarches", href: () => `/aides${search()}` };
}

export function AidSearch({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) {
      router.push("/aides");
      return;
    }
    router.push(getSearchDestination(term).href(term));
  }

  const destination = query.trim() ? getSearchDestination(query) : null;

  return <>
    <form className={`aid-search${compact ? " aid-search-compact" : ""}`} onSubmit={submit} role="search">
      <label className="visually-hidden" htmlFor={compact ? "aid-search-compact" : "aid-search-home"}>Rechercher une aide ou une ressource</label>
      <input id={compact ? "aid-search-compact" : "aid-search-home"} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Une aide, un sujet, un organisme…" />
      <button type="submit">Rechercher</button>
    </form>
    {!compact && destination && <p className="search-route-hint" aria-live="polite">Ta recherche ira dans <strong>{destination.label}</strong></p>}
  </>;
}
