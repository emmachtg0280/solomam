import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPublishInformation } from "../src/lib/publication.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/data/source-registry.json");
const registry = JSON.parse(await readFile(file, "utf8"));
const qualifications = JSON.parse(await readFile(path.join(root, "src/data/imports/occitanie/normalized/qualifications.json"), "utf8")).records;
const catalogue = JSON.parse(await readFile(path.join(root, "src/data/catalogue.json"), "utf8"));
const reviews = JSON.parse(await readFile(path.join(root, "src/data/review.json"), "utf8"));
const qualificationCounts = Object.fromEntries(["relevant", "not_relevant", "expired", "needs_manual_review"].map((status) => [status, qualifications.filter((item) => item.classification.status === status).length]));
const publishableRegionalCount = qualifications.filter((item) => item.classification.status === "relevant").filter((item) => {
  const aid = catalogue.find((record) => record.url === item.normalized.officialUrl);
  return aid && canPublishInformation(aid, reviews[aid.id]);
}).length;
const count = (id, patch) => {
  const source = registry.sources.find((item) => item.id === id);
  if (!source) throw new Error(`Source not found in registry: ${id}`);
  Object.assign(source, patch);
};
count("region-occitanie-dataset", {
  status: "official-snapshot-imported-qualification-in-progress",
  candidateRecordsIntegrated: qualificationCounts.relevant,
  publishableRecords: publishableRegionalCount,
  candidateAidRowsQualifiedRelevant: qualificationCounts.relevant,
  candidateAidRowsExpired: qualificationCounts.expired,
  candidateAidRowsExcluded: qualificationCounts.not_relevant,
  candidateAidRowsPendingReview: qualificationCounts.needs_manual_review,
  limitations: [...new Set([...registry.sources.find((item) => item.id === "region-occitanie-dataset").limitations.filter((value) => !/remain in manual review|pending records/i.test(value)), `${qualificationCounts.needs_manual_review} aid rows remain in manual review`, "Dataset rows and regional programme pages do not by themselves establish active validity or a complete application process"])],
});
count("region-official-catalogue", {
  status: "official-pages-reviewed-partially",
  pagesReviewed: qualifications.filter((item) => item.classification.status !== "needs_manual_review").length,
  relevantCandidates: qualificationCounts.relevant,
  confirmedNonRelevant: qualificationCounts.not_relevant,
  expired: qualificationCounts.expired,
  pendingManualReview: qualificationCounts.needs_manual_review,
  candidateRecordsIntegrated: qualificationCounts.relevant,
  publishableRecords: publishableRegionalCount,
  reviewedAt: "2026-11-23",
  limitations: [...new Set([...registry.sources.find((item) => item.id === "region-official-catalogue").limitations.filter((value) => !/remaining \d+ official pages/i.test(value)), "No complete individual application journey has yet been normalized into a publishable aid card", `The remaining ${qualificationCounts.needs_manual_review} official pages still require beneficiary, validity and application-path review`])],
});
const addedSources = [
  {
    id: "assurance-maladie-css", name: "Assurance Maladie — Complémentaire santé solidaire",
    url: "https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante/complementaire-sante-solidaire",
    role: "Official benefit guidance, 2026 resource bands and application route",
    status: "official-page-reviewed-facts-integrated-pending-form-level-audit",
    version: "Page dated 2026-09-18; thresholds effective 2026-04-01",
    license: "No bulk dataset copied; short factual fields are normalized with source attribution",
    retrievedAt: "2026-11-23", recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 0,
    coverage: "CSS criteria, indicative thresholds, request channels, processing and annual renewal",
    limitations: ["Precise household/resource scope and exhaustive document list still to check against the current form"],
  },
  {
    id: "caf-herault-housing", name: "Caf de l'Hérault — étapes de l'aide au logement",
    url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/logement/aideaulogementmontpellier/les-3-etapes-de-l-aide-au-logement",
    role: "Local procedural guidance for housing benefit applicants",
    status: "official-page-reviewed-procedure-integrated-pending-complete-document-list",
    version: "Consulted 2026-11-23; page has no displayed review date",
    license: "No bulk dataset copied; short factual fields are normalized with source attribution",
    retrievedAt: "2026-11-23", recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 0,
    coverage: "Caf de l'Hérault housing-aid steps, including post-move application, examples of documents and account follow-up",
    limitations: ["Complete linked document list and its current date have not been checked", "Does not cover MSA route or distinguish the legal rules of APL, ALF and ALS"],
  },
  {
    id: "fsl-herault", name: "Département de l'Hérault — FSL",
    url: "https://herault.fr/402-aide-financiere.htm",
    role: "Departmental FSL scope and supported housing needs",
    status: "official-guidance-reviewed-local-variant-pending-regulation",
    version: "Consulted 2026-11-23",
    license: "No bulk dataset copied; sourced facts retained with URL",
    retrievedAt: "2026-11-23", recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 0,
    coverage: "Department of Hérault outside the 31 Montpellier Métropole communes, subject to confirmation of exact commune list",
    limitations: ["Current departmental regulation, criteria, resources, documents and application path not extracted"],
  },
  {
    id: "fsl-montpellier-metropole", name: "Montpellier Méditerranée Métropole — FSL",
    url: "https://www.montpellier.fr/actions/competences/acces-au-logement/fonds-de-solidarite-pour-le-logement",
    role: "Metropolitan FSL territory, supported needs and social-worker application procedure",
    status: "official-guidance-reviewed-local-variant-pending-current-regulation",
    version: "Page consulted 2026-11-23; 2025 regulation must be checked for continued effect",
    license: "No bulk dataset copied; sourced facts retained with URL",
    retrievedAt: "2026-11-23", recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 0,
    coverage: "Residents of 31 Montpellier Méditerranée Métropole communes",
    limitations: ["Confirm current regulation and exact commune list; criteria, resource bands, documentary list, delays and follow-up remain unverified"],
  },
];
for (const next of addedSources) {
  const index = registry.sources.findIndex((item) => item.id === next.id);
  if (index < 0) registry.sources.push(next);
  else {
    const previous = registry.sources[index];
    const merged = { ...previous, ...next };
    for (const field of ["limitations", "evidence"]) {
      if (Array.isArray(previous[field]) || Array.isArray(next[field])) {
        const items = [...(previous[field] ?? []), ...(next[field] ?? [])];
        merged[field] = [...new Map(items.map((item) => [JSON.stringify(item), item])).values()];
      }
    }
    registry.sources[index] = merged;
  }
}
registry.sources = [...new Map(registry.sources.map((source) => [source.id, source])).values()];
registry.auditedAt = "2026-11-23";
await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log("Source registry updated with actual integrations, evidence dates and limits.");
