import { ServicesCatalogue } from "@/components/services-catalogue";

export const metadata = { title: "Vie quotidienne", description: "Des ressources de bien-être, d’entraide et des bons plans pour le quotidien." };

export default async function VieASoiPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  return <main className="container page">
    <div className="catalogue-intro"><p className="eyebrow">Des idées et des ressources pour soi</p><h1 className="page-heading">Vie quotidienne</h1><p>Bons plans, santé et ressources pour prendre soin de soi, sans pression.</p></div>
    <ServicesCatalogue initialQuery={initialQuery} rubric="vie-quotidienne" />
    <p className="footer">Les réductions, tarifs et conditions peuvent évoluer. Vérifie toujours les informations auprès de la structure.</p>
  </main>;
}
