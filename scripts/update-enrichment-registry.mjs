import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "src/data/source-registry.json");
const registry = JSON.parse(await readFile(file, "utf8"));
const count = (id, patch) => {
  const source = registry.sources.find((item) => item.id === id);
  if (!source) throw new Error(`Source not found in registry: ${id}`);
  Object.assign(source, patch);
};
count("region-occitanie-dataset", {
  status: "official-snapshot-imported-22-candidates-integrated-pending-review",
  candidateRecordsIntegrated: 22,
  publishableRecords: 0,
  limitations: [...new Set([...registry.sources.find((item) => item.id === "region-occitanie-dataset").limitations, "22 qualified records are now projected into the canonical catalogue as pending records; 101 aid records remain in manual review", "Dataset rows and regional programme pages do not by themselves establish active validity or a complete application process"])],
});
count("region-official-catalogue", {
  status: "22-official-programme-pages-reviewed-and-candidate-records-integrated",
  candidateRecordsIntegrated: 22,
  publishableRecords: 0,
  reviewedAt: "2026-11-23",
});
count("service-public", {
  status: "four-guidance-pages-opened-facts-integrated-pending-review",
  recordsImported: 0,
  candidateRecordsIntegrated: 3,
  factsEnrichedForAids: 3,
  publishableRecords: 0,
  consultedAt: "2026-11-23",
  evidence: [
    { aidId: "asf", url: "https://www.service-public.fr/particuliers/vosdroits/F815", pageVerifiedAt: "2026-04-01" },
    { aidId: "af", url: "https://www.service-public.fr/particuliers/vosdroits/F13213", pageVerifiedAt: "2026-06-01" },
    { aidId: "af", url: "https://www.service-public.fr/particuliers/vosdroits/F13212", pageVerifiedAt: "2026-06-01" },
    { aidId: "logement", url: "https://www.service-public.fr/particuliers/vosdroits/F12006", pageVerifiedAt: "2026-07-01" },
  ],
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
  else registry.sources[index] = next;
}
await writeFile(file, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log("Source registry updated with actual integrations, evidence dates and limits.");
