import { ServicesCatalogue } from "@/components/services-catalogue";

export const metadata = { title: "Famille & enfants", description: "Lieux et associations pour accompagner les enfants et leurs parents." };

export default async function FamillePage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">Accompagnement des parents et des enfants</p><h1 className="page-heading">Famille & enfants</h1><p>Des lieux, services et associations pour la parentalité, les enfants et les liens familiaux.</p></div>
    <ServicesCatalogue initialQuery={initialQuery} rubric="famille-enfants" />
    <p className="footer">Les conditions d’accueil et les horaires varient selon chaque structure. Vérifie les informations avant de te déplacer.</p>
  </main>;
}
