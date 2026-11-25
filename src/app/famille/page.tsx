import { TopicPage } from "@/components/topic-page";

export const metadata = { title: "Famille & enfants" };

export default function FamillePage() {
  return <TopicPage topic={{
    title: "Famille & enfants",
    description: "Repères et ressources pour les enfants, les périodes de séparation et l’accompagnement familial.",
    subjects: [
      { id: "parents-enfants", title: "Parents et enfants", description: "Santé, développement, accueil et soutien autour des enfants.", href: "/services?search=enfant" },
      { id: "separation", title: "Séparation et médiation", description: "Un accompagnement familial pour traverser les désaccords et les séparations.", href: "/services?search=médiation" },
      { id: "ressources-famille", title: "Ressources familiales", description: "Services publics et associations pour les familles et les parents solos.", href: "/services?search=famille" },
    ],
  }} />;
}
