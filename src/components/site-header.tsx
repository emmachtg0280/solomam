"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTerritory } from "@/components/territory-provider";
import { departmentCoverages, territoryLabel } from "@/lib/territories";

export function SiteHeader() {
  const pathname = usePathname();
  const { territory, setTerritory } = useTerritory();

  return <header className="site-header">
    <div className="container nav-row">
      <nav aria-label="Navigation principale">
        <Link href="/aides" aria-current={pathname.startsWith("/aides") ? "page" : undefined}>Aides &amp; démarches</Link>
        <Link href="/famille" aria-current={pathname.startsWith("/famille") ? "page" : undefined}>Famille &amp; enfants</Link>
        <Link href="/vie-a-soi" aria-current={pathname.startsWith("/vie-a-soi") ? "page" : undefined}>Vie quotidienne</Link>
      </nav>
      <Link className="wordmark" href="/" aria-label="Solomam, accueil">solomam</Link>
      <div className="nav-actions">
        <label className="territory-control"><span className="visually-hidden">Votre territoire</span>
          <select className={territory === "occitanie" ? "territory-select territory-select-occitanie" : "territory-select"} value={territory} onChange={(event) => setTerritory(event.target.value)} aria-label="Choisir votre territoire">
            <option value="occitanie">Occitanie</option>
            {departmentCoverages.map((coverage) => <option key={coverage} value={coverage}>{territoryLabel[coverage]}</option>)}
            <option value="all">France entière</option>
          </select>
        </label>
        <Link className="saved-link" href="/demarches" aria-current={pathname === "/demarches" ? "page" : undefined}>Mes favoris</Link>
      </div>
    </div>
  </header>;
}
