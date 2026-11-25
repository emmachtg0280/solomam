import Link from "next/link";
import Image from "next/image";
import { AidSearch } from "@/components/aid-search";
import { AidHighlights } from "@/components/home-discovery";

type SearchPrompt = { text: string; href: string; image: string };

function SearchPromptRow({ prompts, reverse = false }: { prompts: SearchPrompt[]; reverse?: boolean }) {
  return <div className={`search-prompt-row${reverse ? " search-prompt-row-reverse" : ""}`}>
    <div className="search-prompt-track">
      {[0, 1].map((copy) => <div className="search-prompt-group" aria-hidden={copy === 1 ? true : undefined} key={copy}>
        {prompts.map((prompt) => <Link className="search-prompt-chip" href={prompt.href} key={prompt.text} tabIndex={copy === 1 ? -1 : undefined}>
          <Image src={prompt.image} alt="" width={42} height={42} aria-hidden="true" />
          <span>«&nbsp;{prompt.text}&nbsp;»</span>
        </Link>)}
      </div>)}
    </div>
  </div>;
}

const firstSearchPrompts: SearchPrompt[] = [
  { text: "aide pour la rentrée de ma fille", href: "/aides?search=rentrée", image: "/inspiration/rentree.jpg" },
  { text: "où trouver une aide pour mon logement ?", href: "/aides?search=logement", image: "/inspiration/logement.jpg" },
  { text: "produits cosmétiques à petit prix", href: "/services?search=cosmétiques", image: "/brands/bumpy-homepage-preview.jpg" },
  { text: "trouver un lieu d’accueil pour mon enfant", href: "/services?search=accueil", image: "/inspiration/famille.jpg" },
  { text: "quelle aide financière pour ma famille ?", href: "/aides?search=revenus", image: "/inspiration/rentree.jpg" },
];

const secondSearchPrompts: SearchPrompt[] = [
  { text: "je voudrais parler à d’autres mamans solos", href: "/services?search=entraide", image: "/inspiration/entraide.jpg" },
  { text: "prendre soin de moi sans culpabiliser", href: "/services?search=santé", image: "/inspiration/bien-etre.jpg" },
  { text: "mes droits après une séparation", href: "/services?search=médiation", image: "/inspiration/famille.jpg" },
  { text: "une association pour mes démarches", href: "/services?search=CIDFF", image: "/inspiration/entraide.jpg" },
  { text: "un lieu d’accueil pour mon bébé", href: "/services?search=accueil", image: "/inspiration/famille.jpg" },
];

export const metadata = {
  title: "Aides, associations et vie quotidienne",
  description: "Aides, droits, associations et ressources du quotidien pour les mamans solos. Solomam rassemble des informations sourcées et adaptées à ton territoire.",
};

export default function HomePage() {
  return <main>
    <section className="home-hero">
      <div className="hero-photo" role="img" aria-label="Une mère et son enfant dans leur salon" />
      <div className="container hero-content">
        <div className="hero-copy">
          <p className="hero-label">Occitanie · Aides et ressources</p>
          <h1>Des aides et des ressources<br />pour les mamans solos</h1>
          <p className="hero-intro">Des infos fiables, des associations, des bons plans et des idées pour le quotidien.</p>
          <div className="hero-search-wrap"><AidSearch /><p className="search-note">Choisis un département dans le menu pour adapter les résultats.</p></div>
        </div>
      </div>
      <a className="photo-credit" href="https://unsplash.com/photos/a-woman-and-a-child-sitting-on-a-couch-EpV68ofNijM" target="_blank" rel="noopener noreferrer">Photo Helena Lopes / Unsplash</a>
    </section>

    <section className="search-inspiration" aria-label="Exemples de recherches à essayer">
      <SearchPromptRow prompts={firstSearchPrompts} />
      <SearchPromptRow prompts={secondSearchPrompts} reverse />
    </section>

    <AidHighlights />
  </main>;
}
