import { ServicesCatalogue } from "@/components/services-catalogue";

export const metadata = { title: "Ressources locales et services", description: "Des lieux et services utiles, avec leurs conditions d’accès et leur territoire." };

function getServicesPageCopy(query: string) {
  const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  if (/cosmetique|produit|prix|reduction|bon plan/.test(normalized)) {
    return { eyebrow: "Bons plans du quotidien", title: "Vie quotidienne", description: "Des produits et des offres utiles, avec leurs prix et conditions d’accès." };
  }
  if (/cidff|droit|demarche/.test(normalized)) {
    return { eyebrow: "Associations et accompagnement", title: "Droits & démarches", description: "Des associations pour s’informer sur ses droits et être accompagnée dans ses démarches." };
  }
  if (/entraide|reseau|mamans solos/.test(normalized)) {
    return { eyebrow: "Associations et accompagnement", title: "Réseaux & entraide", description: "Des réseaux et des associations pour échanger et trouver du soutien." };
  }
  if (/sante|soin|bien etre/.test(normalized)) {
    return { eyebrow: "Ressources pour soi", title: "Santé & bien-être", description: "Des ressources pour prendre soin de soi, sans pression." };
  }
  if (/enfant|bebe|famille|parent|accueil/.test(normalized)) {
    return { eyebrow: "Famille et accompagnement", title: "Famille & enfants", description: "Des lieux et services pour les parents et leurs enfants." };
  }
  return query
    ? { eyebrow: "Ressources locales et nationales", title: "Ressources pour ton quotidien", description: "Les ressources correspondant à ta recherche, avec leurs conditions d’accès et leur territoire." }
    : { eyebrow: "Ressources locales et nationales", title: "Lieux, services et activités", description: "Des structures publiques, associatives et privées, avec leur statut et leurs conditions d’accès." };
}

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const copy = getServicesPageCopy(initialQuery);
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">{copy.eyebrow}</p><h1 className="page-heading">{copy.title}</h1><p>{copy.description}</p></div>
    <ServicesCatalogue initialQuery={initialQuery} />
    <p className="footer">Les conditions d’accès et la disponibilité peuvent dépendre de chaque structure. Vérifie les informations auprès de l’organisme avant de te déplacer.</p>
  </main>;
}
