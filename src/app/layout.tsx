import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { TerritoryProvider } from "@/components/territory-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aides, associations et vie quotidienne",
    template: "Solomam | %s",
  },
  description: "Aides, droits, associations et ressources du quotidien pour les mamans solos. Solomam rassemble des informations sourcées et adaptées à ton territoire.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body><TerritoryProvider><SiteHeader />{children}</TerritoryProvider></body></html>;
}
