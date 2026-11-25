import { redirect } from "next/navigation";

export default async function ServicesRedirect({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const term = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  const normalized = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr");
  const destination = /cidff|droit|demarche/.test(normalized) ? "/droits-demarches?search=CIDFF"
    : /cosmetique|produit|prix|reduction|sante|soin|bien etre/.test(normalized) ? `/vie-a-soi${term ? `?search=${encodeURIComponent(/sante|soin|bien etre/.test(normalized) ? "santé" : "cosmétiques")}` : ""}`
    : `/famille${term ? `?search=${encodeURIComponent(/solo|mamans solos/.test(normalized) ? "solo" : "enfant")}` : ""}`;
  redirect(destination);
}
