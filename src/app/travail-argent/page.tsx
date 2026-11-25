import { TopicPage } from "@/components/topic-page";

export const metadata = { title: "Travail et budget" };

export default function TravailArgentPage() {
  return <TopicPage topic={{
    title: "Travail & budget",
    description: "Aides financières, emploi et formation pour avancer dans ses projets professionnels.",
    subjects: [
      { id: "aides-financieres", title: "Aides financières", description: "Consulter les aides nationales et celles de ton territoire.", href: "/aides?search=revenus" },
      { id: "emploi-formation", title: "Emploi & formation", description: "Rechercher des aides et dispositifs liés à l’emploi et à la formation.", href: "/aides?search=emploi" },
      { id: "budget", title: "Budget du quotidien", description: "Trouver des informations et soutiens pour les ressources et dépenses courantes.", href: "/aides?search=revenus" },
    ],
  }} />;
}
