import catalogue from "@/data/catalogue.json";
import review from "@/data/review.json";
import type { Aid, AidFact, AidSource, ApplicationProcedure } from "@/lib/types";
import { canPublishInformation, canPublishProcedure } from "@/lib/publication.mjs";

type Audit = {
  publicationStatus: Aid["publicationStatus"];
  informationPublicationStatus?: Aid["informationPublicationStatus"];
  informationVerifiedAt?: string | null;
  notes: string[];
  currentForPeriod: string | null;
  eligibilityRulesReady: boolean;
  testCases: number;
  sources: AidSource[];
  facts?: AidFact[];
  applicationProcedure?: ApplicationProcedure;
  applicationUrl?: string | null;
  factSources?: AidSource[];
};

const reviews = review as Record<string, Audit>;
const catalogueRows = catalogue as Array<{ id: string; name: string; category: string; zone: string; org: string; description: string; when: string; steps: string[]; url: string }>;

export const aids: Aid[] = catalogueRows.map((item) => {
  const audit = reviews[item.id];
  const sources = [...(audit.sources ?? []), ...(audit.factSources ?? [])].map((source) => ({
    ...source,
    kind: source.kind as AidSource["kind"],
    consultedAt: source.consultedAt,
  }));
  const procedure = audit.applicationProcedure;
  const verifiedFacts = (audit.facts ?? []).filter((fact) => fact.status === "verified" && fact.value);
  const uncertainties = (audit.facts ?? []).filter((fact) => ["conflict", "partially_verified"].includes(fact.status) && fact.value).map((fact) => fact.value as string);
  const conditionFields = new Set(["audience", "core_conditions", "resource_condition", "residence", "territory", "living_situation", "contribution_condition", "work_status", "child_income", "pension_scenarios", "parental_lump_sum_period"]);
  const verifiedDocuments = verifiedFacts.filter((fact) => fact.field === "documents");
  const audience = verifiedFacts.find((fact) => fact.field === "audience")?.value ?? null;
  const amount = verifiedFacts.find((fact) => fact.field === "amount")?.value ?? null;
  return {
    id: item.id,
    slug: item.id,
    name: item.name,
    category: item.category as Aid["category"],
    organization: item.org,
    coverage: item.zone as Aid["coverage"],
    description: item.description,
    audience,
    conditions: verifiedFacts.filter((fact) => conditionFields.has(fact.field) && fact.field !== "audience").map((fact) => fact.value as string),
    amount,
    documents: verifiedDocuments.map((fact) => fact.value as string),
    steps: procedure?.steps.filter((step) => ["verified", "verified_conditional"].includes(step.status) && step.sourceIds.length > 0).slice(0, 5).map((step) => step.text) ?? [],
    officialUrl: item.url,
    applicationUrl: audit.applicationUrl ?? null,
    sources,
    verifiedAt: audit.informationVerifiedAt ?? null,
    validationStatus: audit.informationPublicationStatus === "verified" ? "vérifié" : "à vérifier",
    informationPublicationStatus: canPublishInformation(item, audit) ? "verified" : "pending",
    procedurePublicationStatus: canPublishProcedure(audit) ? "complete" : "pending",
    publicationStatus: audit.publicationStatus,
    reviewNotes: audit.notes ?? [],
    currentForPeriod: audit.currentForPeriod,
    eligibilityRulesReady: audit.eligibilityRulesReady,
    testCases: audit.testCases,
    facts: audit.facts,
    applicationProcedure: procedure,
    verifiedFacts,
    uncertainties,
  };
});

export const publishedAids = aids.filter((aid) => aid.informationPublicationStatus === "verified");
export const pendingCount = aids.length - publishedAids.length;
export const categories = [...new Set(publishedAids.map((aid) => aid.category))];
export const organizations = [...new Set(publishedAids.map((aid) => aid.organization))].sort((a, b) => a.localeCompare(b, "fr"));

export function getAid(slug: string) {
  return publishedAids.find((aid) => aid.slug === slug);
}
