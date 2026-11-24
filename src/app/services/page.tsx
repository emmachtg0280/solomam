import Link from "next/link";
import { publishedServices } from "@/lib/services";

export const metadata = { title: "Services d'accompagnement — Solomam", description: "Services de parentalité, de santé et ressources de vie amoureuse vérifiés." };

export default function ServicesPage() {
  return <main className="container page">
    <h1 className="page-heading">Services d&apos;accompagnement</h1>
    <p className="muted">Structures publiques et ressources privées, présentées séparément des aides financières.</p>
    {publishedServices.length ? <div className="aid-grid">{publishedServices.map((service) => <Link className="aid-card" href={`/services/${service.slug}`} key={service.id}>
      <div><div className="card-meta"><span className="badge">{service.category}</span><span>{service.kind === "private-platform" ? "Service privé" : "Service public"}</span></div><h2>{service.name}</h2><p>{service.description}</p></div>
      <div className="card-meta"><span>{service.organization}</span><span>{service.coverage}</span></div>
    </Link>)}</div> : <p className="empty-state">Aucun service vérifié n&apos;est disponible.</p>}
  </main>;
}
