import { ServicesCatalogue } from "@/components/services-catalogue";

export const metadata = { title: "Droits & démarches", description: "Associations et services pour comprendre ses droits et être accompagnée dans ses démarches." };

export default async function DroitsDemarchesPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">Comprendre ses droits, se faire accompagner</p><h1 className="page-heading">Droits & démarches</h1><p>Des associations et services pour s’informer et avancer dans ses démarches administratives ou juridiques.</p></div>
    <ServicesCatalogue initialQuery={initialQuery} rubric="droits-demarches" />
    <p className="footer">Les conditions d’accueil varient selon les structures. Contacte-les pour confirmer les modalités et prendre rendez-vous si nécessaire.</p>
  </main>;
}
