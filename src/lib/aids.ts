import catalogue from "@/data/catalogue.json";
import review from "@/data/review.json";
import type { Aid, AidSource } from "@/lib/types";

// Facts remain in the source catalogue; audit provenance and publication gates
// are kept separately so a partial review cannot silently publish a draft.
export const aids: Aid[] = catalogue.map((item) => ({
  ...(() => {
    const audit = review[item.id as keyof typeof review];
    return {
      publicationStatus: audit.publicationStatus as Aid["publicationStatus"],
      reviewNotes: audit.notes,
      currentForPeriod: audit.currentForPeriod,
      eligibilityRulesReady: audit.eligibilityRulesReady,
      testCases: audit.testCases,
      sources: audit.sources.map((source) => ({
        ...source,
        kind: source.kind as AidSource["kind"],
        consultedAt: source.consultedAt,
      })),
    };
  })(),
  id: item.id,
  slug: item.id,
  name: item.name,
  category: item.category as Aid["category"],
  organization: item.org,
  coverage: item.zone as Aid["coverage"],
  description: item.description,
  conditions: [item.when],
  documents: ["Non précisés dans le prototype. À vérifier auprès de l’organisme responsable."],
  steps: item.steps,
  officialUrl: item.url,
  verifiedAt: null,
  validationStatus: "à vérifier",
}));

export const publishedAids = aids.filter((aid) => aid.publicationStatus === "published");
export const pendingCount = aids.length - publishedAids.length;
export const categories = [...new Set(publishedAids.map((aid) => aid.category))];
export const organizations = [...new Set(publishedAids.map((aid) => aid.organization))].sort((a, b) =>
  a.localeCompare(b, "fr"),
);

export function getAid(slug: string) {
  return publishedAids.find((aid) => aid.slug === slug);
}
