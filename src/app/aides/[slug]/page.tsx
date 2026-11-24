import Link from "next/link";
import { notFound } from "next/navigation";
import { AidActions } from "@/components/aid-actions";
import { publishedAids, getAid } from "@/lib/aids";

const coverageLabel = { national: "National", regional: "Occitanie", "34": "Hérault (34)" };

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
  return <main className="container page"><article className="detail-layout">
    <Link className="back-link" href="/">Retour au catalogue</Link>
    <div className="detail-meta"><span className="badge">{aid.category}</span><span className="badge">{coverageLabel[aid.coverage]}</span><span className="badge">Information vérifiée</span></div>
    <h1 className="detail-title">{aid.name}</h1>
    <p className="detail-description">{aid.description}</p>
    <section className="detail-section"><h2>Organisme responsable</h2><p>{aid.organization}</p></section>
    <section className="detail-section"><h2>Zone géographique</h2><p>{coverageLabel[aid.coverage]}</p></section>
    <section className="detail-section"><h2>Conditions d’accès</h2>{aid.conditions.length ? <ul>{aid.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul> : <p>Conditions essentielles en cours de vérification.</p>}</section>
    <section className="detail-section"><h2>Informations ou documents nécessaires</h2>{aid.documents.length ? <ul>{aid.documents.map((document) => <li key={document}>{document}</li>)}</ul> : <p>Les justificatifs n’ont pas été établis par les sources contrôlées.</p>}</section>
    <section className="detail-section"><h2>Étapes de demande</h2>
      {aid.procedurePublicationStatus === "complete" ? <ol>{aid.steps.map((step) => <li key={step}>{step}</li>)}</ol> : <>
        <p>Le parcours complet n’est pas encore vérifié. Les étapes ci-dessous sont celles confirmées par une source officielle et ne constituent pas une procédure exhaustive.</p>
        {aid.steps.length ? <ol>{aid.steps.map((step) => <li key={step}>{step}</li>)}</ol> : <p>Aucune étape de demande n’est publiée à ce stade.</p>}
      </>}
    </section>
    <section className="detail-section"><h2>Lien officiel</h2><p><a href={aid.officialUrl} target="_blank" rel="noopener noreferrer">Consulter le site officiel</a></p></section>
    <section className="detail-section"><h2>Sources et vérification</h2><ul>{aid.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>{source.pageVerifiedAt ? ` — page vérifiée le ${source.pageVerifiedAt}` : ""}{source.consultedAt ? `; consultée le ${source.consultedAt}` : ""}</li>)}</ul><p>Fiche d’information vérifiée le {aid.verifiedAt}.</p></section>
    <AidActions aid={aid} />
  </article></main>;
}
