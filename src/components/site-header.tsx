"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTerritory } from "@/components/territory-provider";
import { departmentCoverages, territoryLabel } from "@/lib/territories";

export function SiteHeader() {
  const pathname = usePathname();
  const { territory, setTerritory } = useTerritory();
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    setIsHidden(false);
    const updateHeaderState = () => {
      const hero = document.querySelector<HTMLElement>(".home-hero");
      const header = document.querySelector<HTMLElement>(".site-header");
      if (header) {
        const overlap = `${header.getBoundingClientRect().height}px`;
        if (document.documentElement.style.getPropertyValue("--header-overlap") !== overlap) {
          document.documentElement.style.setProperty("--header-overlap", overlap);
        }
      }
      const currentScrollY = window.scrollY;
      const hasPassedHero = !hero || !header || hero.getBoundingClientRect().bottom <= header.getBoundingClientRect().bottom;

      if (currentScrollY < 8 || currentScrollY < previousScrollY - 3) {
        setIsHidden(false);
      } else if (currentScrollY > previousScrollY + 3 && hasPassedHero) {
        setIsHidden(true);
      }
      previousScrollY = currentScrollY;
    };

    updateHeaderState();
    const header = document.querySelector<HTMLElement>(".site-header");
    const resizeObserver = header ? new ResizeObserver(updateHeaderState) : null;
    if (header) resizeObserver?.observe(header);
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    window.addEventListener("resize", updateHeaderState);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", updateHeaderState);
      window.removeEventListener("resize", updateHeaderState);
    };
  }, [pathname]);

  return <header className={`site-header${isHidden ? " site-header-hidden" : ""}`} inert={isHidden}>
    <div className="container nav-row">
      <Link className="wordmark" href="/" aria-label="Solomam, accueil">solomam</Link>
      <nav className="main-nav" aria-label="Rubriques principales">
        <Link href="/aides" aria-current={pathname.startsWith("/aides") || pathname.startsWith("/travail-argent") ? "page" : undefined}>Aides &amp; budget</Link>
        <Link href="/droits-demarches" aria-current={pathname.startsWith("/droits-demarches") ? "page" : undefined}>Droits &amp; démarches</Link>
        <Link href="/famille" aria-current={pathname.startsWith("/famille") ? "page" : undefined}>Famille &amp; enfants</Link>
        <Link href="/vie-a-soi" aria-current={pathname.startsWith("/vie-a-soi") ? "page" : undefined}>Vie quotidienne</Link>
      </nav>
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
