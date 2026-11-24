import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solomam — Aides et démarches pour mamans solos",
  description: "Aides et démarches pour mamans solos. Consultez les aides nationales et locales en Occitanie, leurs conditions et les étapes pour les demander.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><SiteHeader />{children}</body></html>;
}
