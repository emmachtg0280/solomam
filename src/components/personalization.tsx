"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { publishedAids, categories } from "@/lib/aids";
import { Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function Personalization() {
  const [territory, setTerritory] = useState("34");
  const [category, setCategory] = useState("Toutes");
  const [showResults, setShowResults] = useState(false);
  const matches = useMemo(() => publishedAids.filter((aid) => {
    const territoryMatch = territory === "regional" ? ["regional", "national"].includes(aid.coverage) : ["34", "regional", "national"].includes(aid.coverage);
    return territoryMatch && (category === "Toutes" || aid.category === category);
  }), [territory, category]);
  return <main className="container page">
    <h1 className="page-heading">Parcours personnalisé</h1>
    <p className="detail-description">Affinez la liste selon votre territoire et votre besoin. Ces filtres ne calculent pas l’éligibilité et vos réponses ne sont pas enregistrées.</p>
    <form className="profile-form" onSubmit={(event) => { event.preventDefault(); setShowResults(true); }}>
      <label>Votre territoire<Select value={territory} onChange={(event) => setTerritory(event.target.value)}><option value="34">Hérault (34)</option><option value="regional">Autre département d’Occitanie</option></Select></label>
      <label>Le sujet qui vous concerne<Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="Toutes">Je préfère parcourir toutes les aides</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select></label>
      <Button variant="primary" type="submit">Afficher les aides correspondantes</Button>
    </form>
    {showResults && <section className="detail-section" aria-live="polite"><h2>{matches.length} aide{matches.length === 1 ? "" : "s"} à consulter</h2>{matches.length ? <ul>{matches.map((aid) => <li key={aid.id}><Link href={`/aides/${aid.slug}`}>{aid.name}</Link></li>)}</ul> : <p>Aucune aide ne correspond à ces filtres.</p>}</section>}
    <p className="note">Les conditions doivent être vérifiées sur chaque fiche et auprès de l’organisme responsable.</p>
  </main>;
}
