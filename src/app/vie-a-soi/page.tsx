import { TopicPage } from "@/components/topic-page";

export const metadata = { title: "Vie quotidienne" };

export default function VieASoiPage() {
  return <TopicPage topic={{
    title: "Vie quotidienne",
    description: "Des bons plans, des repères et des ressources pour te faciliter le quotidien, sans pression.",
    subjects: [
      { id: "bons-plans", title: "Bons plans", description: "Découvrir des offres et ressources utiles pour les petits budgets.", href: "/services?search=prix" },
      { id: "sante", title: "Prendre soin de soi", description: "Des services et informations pour ta santé, sans injonction à tout faire parfaitement.", href: "/services?search=santé" },
      { id: "logement", title: "Logement", description: "Aides et démarches pour trouver ou garder un logement.", href: "/aides?search=logement" },
      { id: "entraide", title: "Réseaux & entraide", description: "Associations et communautés pour échanger et trouver du soutien.", href: "/services?search=entraide" },
    ],
  }} />;
}
