import Link from "next/link";
import { notFound } from "next/navigation";
import { AidActions } from "@/components/aid-actions";
import { publishedAids, getAid } from "@/lib/aids";

const coverageLabel = { national: "National", regional: "Occitanie", "34": "Hérault (34)" };

export const dynamicParams = false;
export function generateStaticParams() { return publishedAids.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const aid = getAid(slug);
  return { title: aid ? `${aid.name} — Solomam` : "Aide introuvable — Solomam", description: aid?.description };
}

export default async function AidPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const aid = getAid(slug);
  if (!aid) notFound();
  return <main className="container page"><article className="detail-layout">
    <Link className="back-link" href="/">Retour au catalogue</Link>
    <div className="detail-meta"><span className="badge">{aid.category}</span><span className="badge">{coverageLabel[aid.coverage]}</span><span className="badge">{aid.validationStatus}</span></div>
    <h1 className="detail-title">{aid.name}</h1>
    <p className="detail-description">{aid.description}</p>
    <section className="detail-section"><h2>Organisme responsable</h2><p>{aid.organization}</p></section>
    <section className="detail-section"><h2>Zone géographique</h2><p>{coverageLabel[aid.coverage]}</p></section>
    <section className="detail-section"><h2>Conditions d’accès</h2><ul>{aid.conditions.map((condition) => <li key={condition}>{condition}</li>)}</ul></section>
    <section className="detail-section"><h2>Informations ou documents nécessaires</h2><ul>{aid.documents.map((document) => <li key={document}>{document}</li>)}</ul></section>
    <section className="detail-section"><h2>Étapes de demande</h2><ol>{aid.steps.map((step) => <li key={step}>{step}</li>)}</ol></section>
    <section className="detail-section"><h2>Lien officiel</h2><p><a href={aid.officialUrl} target="_blank" rel="noopener noreferrer">Consulter le site officiel</a></p></section>
    <section className="detail-section"><h2>Source et vérification</h2><p>Source : {aid.sources.map((source) => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.label}</a>)}.</p><p>{aid.verifiedAt ? `Vérifiée le ${aid.verifiedAt}` : "Date de vérification : non renseignée. Informations à vérifier auprès de l’organisme."}</p></section>
    <AidActions aid={aid} />
  </article></main>;
}
