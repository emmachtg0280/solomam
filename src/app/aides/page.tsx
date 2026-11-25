import { Catalogue } from "@/components/catalogue";

export const metadata = { title: "Aides & budget", description: "Parcourir les aides financières et les dispositifs pratiques pour mamans solos." };

export default async function AidesPage({ searchParams }: { searchParams: Promise<{ search?: string | string[] }> }) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.search) ? params.search[0] ?? "" : params.search ?? "";
  return <Catalogue initialQuery={initialQuery} />;
}
