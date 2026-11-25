import Link from "next/link";
import { notFound } from "next/navigation";
import { getService, publishedServices } from "@/lib/services";

export function generateStaticParams() { return publishedServices.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const service = getService(slug);
  return { title: service ? service.name : "Ressource introuvable", description: service?.description };
}
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const service = getService(slug); if (!service) notFound();
  return <main className="container page"><article className="detail-layout">
    <Link className="back-link" href="/services">Retour aux services</Link>
    <div className="detail-meta"><span className="badge">{service.category}</span><span className="badge">{service.kind === "private-platform" ? "Plateforme privée" : service.kind === "association" ? "Association" : service.kind === "public-directory" ? "Répertoire public" : "Service public"}</span></div>
    <h1 className="detail-title">{service.name}</h1><p className="detail-description">{service.description}</p>
    <section className="detail-section"><h2>Public concerné</h2><p>{service.audience}</p></section>
    <section className="detail-section"><h2>Territoire et accès</h2><p>{service.coverage}</p><p>{service.accessConditions}</p></section>
    <section className="detail-section"><h2>Tarification</h2><p>{service.pricing}</p></section>
    <section className="detail-section"><h2>Organisme</h2><p>{service.organization}</p></section>
    <p className="official-action"><a className="button button-primary" href={service.officialUrl} target="_blank" rel="noopener noreferrer">{service.accessLabel}</a></p>
    {service.kind === "private-platform" && <p className="note">Service privé indépendant; Solomam ne le finance ni ne le recommande officiellement. Vérifiez ses conditions avant inscription ou paiement.</p>}
    {service.kind === "association" && <p className="note">Structure associative indépendante. Les activités, conditions d’accueil et éventuels frais peuvent varier : vérifiez les modalités directement auprès de l’association.</p>}
    {service.remainingChecks.length > 0 && <section className="detail-section"><h2>À confirmer</h2><ul>{service.remainingChecks.map((item: string) => <li key={item}>{item}</li>)}</ul></section>}
    <section className="detail-section"><h2>Sources et vérification</h2><ul>{service.sources.map((source: { id: string; url: string; label: string; consultedAt: string }) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a> — consultée le {source.consultedAt}</li>)}</ul><p>Vérifié le {service.verifiedAt}.</p></section>
  </article></main>;
}
