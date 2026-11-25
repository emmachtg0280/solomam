import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = path.join(root, "src/data/catalogue.json");
const reviewPath = path.join(root, "src/data/review.json");
const catalogue = JSON.parse(await readFile(cataloguePath, "utf8"));
const review = JSON.parse(await readFile(reviewPath, "utf8"));
const consultedAt = "2026-11-23";
const sources = {
  department: { id: "fsl-herault-page", label: "Département de l'Hérault — Aides financières au logement", url: "https://herault.fr/402-aide-financiere.htm", kind: "official-guidance", consultedAt, pageVerifiedAt: consultedAt },
  metro: { id: "fsl-m3m-page", label: "Montpellier Méditerranée Métropole — Fonds de solidarité pour le logement", url: "https://www.montpellier.fr/actions/competences/acces-au-logement/fonds-de-solidarite-pour-le-logement", kind: "official-guidance", consultedAt, pageVerifiedAt: consultedAt },
};
const records = [
  {
    id: "fsl-herault",
    name: "Fonds de solidarité pour le logement — Hérault hors Métropole",
    org: "Conseil départemental de l'Hérault",
    url: sources.department.url,
    audience: "Personnes en difficulté relevant du plan départemental d'action pour le logement des personnes défavorisées; les critères individuels et ressources relèvent du règlement intérieur applicable.",
    coverage: "Département de l'Hérault hors des 31 communes de Montpellier Méditerranée Métropole, dont le FSL relève de la Métropole.",
    facts: [
      { field: "audience", status: "verified", value: "Personnes en difficulté relevant du plan départemental d'action pour le logement des personnes défavorisées.", sourceIds: [sources.department.id], validFor: "Page officielle consultée le 23-11-2026; critères détaillés dépendant du règlement" },
      { field: "territory", status: "verified", value: "FSL départemental hors des 31 communes de Montpellier Méditerranée Métropole; ces communes ont un FSL géré par la Métropole.", sourceIds: [sources.department.id, sources.metro.id], validFor: "Pages officielles consultées le 23-11-2026" },
      { field: "eligible_needs", status: "verified", value: "Accès au logement (dépôt de garantie, frais d'agence, premier loyer, assurance habitation), maintien (dettes de loyer, charges, frais de procédure), maintien des fournitures d'énergie et d'eau.", sourceIds: [sources.department.id], validFor: "Page officielle consultée le 23-11-2026" },
      { field: "resource_condition", status: "unverified", value: null, sourceIds: [sources.department.id], validFor: "À extraire du règlement départemental en vigueur" },
      { field: "documents", status: "unverified", value: null, sourceIds: [sources.department.id], validFor: null },
    ],
    steps: [],
    remainingChecks: ["Récupérer le règlement départemental en vigueur et sa date d'application.", "Établir les plafonds, conditions, barèmes, pièces et dossier applicables.", "Confirmer le point d'entrée social, le dépôt, le suivi et les délais.", "Vérifier l'adresse communale dans la relation officielle des 31 communes de la Métropole."],
  },
  {
    id: "fsl-m3m",
    name: "Fonds de solidarité pour le logement — Montpellier Méditerranée Métropole",
    org: "Montpellier Méditerranée Métropole",
    url: sources.metro.url,
    audience: "Personnes en difficulté résidant dans l'une des 31 communes de Montpellier Méditerranée Métropole; critères individuels et ressources définis par le règlement métropolitain.",
    coverage: "31 communes de Montpellier Méditerranée Métropole.",
    facts: [
      { field: "audience", status: "verified", value: "Personnes en difficulté résidant sur l'une des 31 communes de Montpellier Méditerranée Métropole.", sourceIds: [sources.metro.id], validFor: "Page officielle consultée le 23-11-2026; critères détaillés dépendant du règlement" },
      { field: "territory", status: "verified", value: "Les 31 communes de Montpellier Méditerranée Métropole; hors de ce ressort, le Département indique gérer le dispositif FSL.", sourceIds: [sources.metro.id, sources.department.id], validFor: "Pages officielles consultées le 23-11-2026" },
      { field: "eligible_needs", status: "verified", value: "Accès au logement, impayés de loyer et charges, impayés d'électricité, gaz et eau.", sourceIds: [sources.metro.id], validFor: "Page officielle consultée le 23-11-2026" },
      { field: "resource_condition", status: "unverified", value: null, sourceIds: [sources.metro.id], validFor: "À extraire du règlement métropolitain en vigueur" },
      { field: "documents", status: "verified", value: "La page indique que le travailleur social constitue le dossier selon la situation avec les pièces justificatives fournies et une évaluation sociale; la liste de pièces n'est pas publiée sur cette page.", sourceIds: [sources.metro.id], validFor: "Page officielle consultée le 23-11-2026" },
    ],
    steps: [
      { text: "Formuler la demande auprès d'un travailleur social.", sourceIds: [sources.metro.id], status: "verified" },
      { text: "Le dossier est constitué selon la situation à partir des pièces fournies et d'une évaluation sociale.", sourceIds: [sources.metro.id], status: "verified" },
      { text: "Le dossier est transmis à la Métropole et examiné pour décision par une équipe pluridisciplinaire.", sourceIds: [sources.metro.id], status: "verified" },
    ],
    remainingChecks: ["Récupérer le règlement métropolitain actuellement applicable et confirmer que la version 2025 reste en vigueur.", "Établir les plafonds, priorités, barèmes, liste des pièces, délais, suivi et éventuel renouvellement.", "Lister les 31 communes à partir d'une source officielle et tester la correspondance INSEE."],
  },
];

for (const data of records) {
  const canonicalId = data.id === "fsl-herault" ? "fsl" : data.id;
  const existing = catalogue.find((item) => item.id === canonicalId);
  if (!existing) {
    catalogue.push({
      id: canonicalId,
      name: data.name,
      category: "Logement",
      zone: "34",
      org: data.org,
      description: "Aide locale à instruire selon le règlement applicable et le territoire de résidence.",
      when: data.audience,
      steps: data.steps.map((step) => step.text),
      url: data.url,
    });
  } else {
    Object.assign(existing, {
      name: data.name,
      category: "Logement",
      zone: "34",
      org: data.org,
      description: "Aide locale à instruire selon le règlement applicable et le territoire de résidence.",
      when: data.audience,
      steps: data.steps.map((step) => step.text),
      url: data.url,
    });
  }
  review[canonicalId] = {
    ...(review[canonicalId] ?? {}),
    publicationStatus: "pending",
    reviewedAt: consultedAt,
    currentForPeriod: null,
    eligibilityRulesReady: false,
    testCases: 0,
    factSources: [sources.department, sources.metro],
    facts: data.facts,
    applicationProcedure: {
      status: data.steps.length ? "partially_complete" : "incomplete",
      steps: data.steps,
      followUp: { status: "unverified", text: "Modalités de suivi non établies par les pages consultées.", sourceIds: [canonicalId === "fsl-m3m" ? sources.metro.id : sources.department.id] },
      renewal: { status: "unverified", text: "Modalités de renouvellement à vérifier dans le règlement en vigueur.", sourceIds: [canonicalId === "fsl-m3m" ? sources.metro.id : sources.department.id] },
      portalUrl: null,
      competentOrganization: data.org,
      remainingChecks: data.remainingChecks,
    },
    notes: [...new Set([...(review[canonicalId]?.notes ?? []), "Variante territoriale normalisée séparément. La fiche est non publiée tant que le règlement, les ressources et les pièces ne sont pas extraits et datés."])],
    sources: review[canonicalId]?.sources ?? [],
  };
}
const oldDepartmentDuplicate = catalogue.findIndex((item) => item.id === "fsl-herault");
if (oldDepartmentDuplicate >= 0) catalogue.splice(oldDepartmentDuplicate, 1);
delete review["fsl-herault"];
if (new Set(catalogue.map((record) => record.id)).size !== catalogue.length) throw new Error("Duplicate catalogue IDs detected");
await writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
// Reapply the sourced current-rule enrichment after this canonical seed import so
// rerunning the importer does not downgrade the reviewed FSL information cards.
await import("./enrich-herault-fsl-regulations.mjs");
console.log(JSON.stringify({ variants: records.length, catalogueRecords: catalogue.length, informationStatus: "verified", procedureStatus: "partial" }, null, 2));
