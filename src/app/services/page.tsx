import { ServicesCatalogue } from "@/components/services-catalogue";

export const metadata = { title: "Ressources locales et services", description: "Des lieux et services utiles, avec leurs conditions d’accès et leur territoire." };

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">Ressources locales et nationales</p><h1 className="page-heading">Lieux, services et activités</h1><p>Des structures publiques, associatives et privées, avec leur statut et leurs conditions d’accès.</p></div>
    <ServicesCatalogue initialQuery={initialQuery} />
    <p className="footer">Les conditions d’accès et la disponibilité peuvent dépendre de chaque structure. Vérifie les informations auprès de l’organisme avant de te déplacer.</p>
  </main>;
}
