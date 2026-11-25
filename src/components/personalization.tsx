"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publishedAids, categories } from "@/lib/aids";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useTerritory } from "@/components/territory-provider";
import { aidMatchesTerritory, departmentCoverages, territoryLabel, territoryPriority } from "@/lib/territories";
import { TerritoryMark } from "@/components/territory-mark";

export function Personalization() {
  const { territory, setTerritory } = useTerritory();
  const [category, setCategory] = useState("Toutes");
  const [showResults, setShowResults] = useState(false);
  const matches = useMemo(() => publishedAids.filter((aid) => {
    return aidMatchesTerritory(aid.coverage, territory) && (category === "Toutes" || aid.category === category);
  }).sort((a, b) => territory === "occitanie" || territory === "all" ? territoryPriority(a.coverage) - territoryPriority(b.coverage) : Number(b.coverage === territory) - Number(a.coverage === territory)), [territory, category]);
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">On cherche ensemble</p><h1 className="page-heading">Par où commencer ?</h1><p>Choisis un sujet pour repérer les aides qui peuvent correspondre. Tes réponses ne sont pas enregistrées.</p></div>
    <form className="profile-form" onSubmit={(event) => { event.preventDefault(); setShowResults(true); }}>
      <label>Où cherches-tu ?<Select value={territory} onChange={(event) => setTerritory(event.target.value)}><option value="occitanie">Toute l’Occitanie</option>{departmentCoverages.map((coverage) => <option key={coverage} value={coverage}>{territoryLabel[coverage]}</option>)}<option value="all">Partout en France</option></Select></label>
      <label>Quel sujet t’amène ici ?<Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="Toutes">Je préfère tout parcourir</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select></label>
      <Button variant="primary" type="submit">Voir les aides</Button>
    </form>
    {showResults && <section className="detail-section guided-results" aria-live="polite"><h2>{matches.length} piste{matches.length === 1 ? "" : "s"} à regarder</h2>{matches.length ? <div className="aid-grid">{matches.map((aid) => <Link className="aid-card" key={aid.id} href={`/aides/${aid.slug}`}><span className="badge">{aid.category}</span><div><h3>{aid.name}</h3><p>{aid.description}</p></div><TerritoryMark coverage={aid.coverage} compact /></Link>)}</div> : <p>Aucune aide publiée ne correspond à ces filtres. Essaie d’élargir le sujet ou le territoire.</p>}</section>}
    <p className="note">Ce parcours aide à repérer des pistes, mais ne calcule pas ton éligibilité. Vérifie les conditions sur chaque fiche et auprès de l’organisme.</p>
  </main>;
}
