import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link className="wordmark" href="/" aria-label="Solomam, accueil">solomam</Link>
        <nav aria-label="Navigation principale">
          <Link href="/">Aides</Link>
          <Link href="/services">Services</Link>
          <Link href="/demarches">Mes démarches</Link>
        </nav>
        <Link className="nav-personalize" href="/mes-aides">Personnaliser</Link>
      </div>
    </header>
  );
}
