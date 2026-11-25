import Link from "next/link";

type Topic = {
  title: string;
  description: string;
  subjects: { id: string; title: string; description: string; href: string }[];
};

export function TopicPage({ topic }: { topic: Topic }) {
  return <main className="container page topic-page">
    <div className="catalogue-intro">
      <p className="eyebrow">Solomam · Ressources pratiques</p>
      <h1 className="page-heading">{topic.title}</h1>
      <p>{topic.description}</p>
    </div>
    <div className="topic-grid">
      {topic.subjects.map((subject) => <article className="topic-card" id={subject.id} key={subject.id}>
        <h2>{subject.title}</h2>
        <p>{subject.description}</p>
        <Link className="text-link" href={subject.href}>Consulter les ressources</Link>
      </article>)}
    </div>
    <p className="topic-footer">La sélection locale s’adapte au département choisi dans le menu.</p>
  </main>;
}
