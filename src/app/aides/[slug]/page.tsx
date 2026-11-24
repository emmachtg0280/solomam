import Link from "next/link";
import { notFound } from "next/navigation";
import { AidActions } from "@/components/aid-actions";
import { publishedAids, getAid } from "@/lib/aids";
import type { Aid } from "@/lib/types";

const coverageLabel: Record<Aid["coverage"], string> = {
  national: "France", regional: "Occitanie",
  "09": "Ariège (09)", "11": "Aude (11)", "12": "Aveyron (12)", "30": "Gard (30)",
  "31": "Haute-Garonne (31)", "32": "Gers (32)", "34": "Hérault (34)", "46": "Lot (46)",
  "48": "Lozère (48)", "65": "Hautes-Pyrénées (65)", "66": "Pyrénées-Orientales (66)",
  "81": "Tarn (81)", "82": "Tarn-et-Garonne (82)",
};

export const dynamicParams = false;
export function generateStaticParams() { return publishedAids.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const aid = getAid(slug);
  return { title: aid ? `${aid.name} — Solomam` : "Aide introuvable — Solomam", description: aid?.description };
}

export default async function AidPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const aid = getAid(slug);
  if (!aid) notFound();
  const hasSteps = aid.steps.length > 0;
  return <main className="container page"><article className="detail-layout">
    <Link className="back-link" href="/">Retour aux aides</Link>
    <div className="detail-meta"><span className="badge">{aid.category}</span><span className="badge">{coverageLabel[aid.coverage]}</span><span className="badge">Information vérifiée</span></div>
    <h1 className="detail-title">{aid.name}</h1>
    <p className="detail-description">{aid.description}</p>
    <AidActions aid={aid} />

    {aid.audience && <section className="detail-section"><h2>À qui s’adresse cette aide ?</h2><p>{aid.audience}</p></section>}
    {aid.conditions.length > 0 && <section className="detail-section"><h2>Conditions essentielles</h2><ul>{aid.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul></section>}
    {aid.amount && <section className="detail-section"><h2>Montant ou nature de l’aide</h2><p>{aid.amount}</p></section>}
    {aid.uncertainties.length > 0 && <section className="detail-section" aria-labelledby="uncertainties-title"><h2 id="uncertainties-title">Points à confirmer</h2><ul>{aid.uncertainties.map((uncertainty) => <li key={uncertainty}>{uncertainty}</li>)}</ul></section>}
    {aid.documents.length > 0 && <section className="detail-section"><h2>Documents indiqués par la source</h2><ul>{aid.documents.map((document) => <li key={document}>{document}</li>)}</ul></section>}
    <section className="detail-section"><h2>Organisme et territoire</h2><p>{aid.organization} — {coverageLabel[aid.coverage]}</p></section>
    <section className="detail-section"><h2>Comment faire la demande ?</h2>
      {hasSteps ? <>
        {aid.procedurePublicationStatus !== "complete" && <p className="muted">Étapes confirmées par les sources ci-dessous; certains cas ou canaux peuvent différer.</p>}
        <ol>{aid.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </> : <p>Les étapes détaillées ne sont pas encore documentées. La source officielle présente les informations disponibles.</p>}
      <p className="official-action">{aid.applicationUrl
        ? <a className="button button-primary" href={aid.applicationUrl} target="_blank" rel="noopener noreferrer">Faire la demande sur le site officiel</a>
        : <a className="button button-primary" href={aid.officialUrl} target="_blank" rel="noopener noreferrer">Consulter les informations officielles</a>}
      </p>
    </section>
    <section className="detail-section"><h2>Sources et vérification</h2>
      <ul>{aid.sources.map((source) => <li key={source.id ?? source.url}>
        <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
        {source.pageVerifiedAt ? ` — page vérifiée le ${source.pageVerifiedAt}` : ""}
        {source.consultedAt ? `; consultée le ${source.consultedAt}` : ""}
      </li>)}</ul>
      <p>Fiche d’information vérifiée le {aid.verifiedAt}.</p>
    </section>
  </article></main>;
}
