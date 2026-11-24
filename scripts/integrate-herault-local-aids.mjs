import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPublishInformation } from "../src/lib/publication.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = path.join(root, "src/data/catalogue.json");
const reviewPath = path.join(root, "src/data/review.json");
const checkedAt = "2026-11-23";
const catalogue = JSON.parse(await readFile(cataloguePath, "utf8"));
const review = JSON.parse(await readFile(reviewPath, "utf8"));

const records = [
  {
    id: "afie-herault", name: "Aide financière pour l’insertion et l’emploi (AFIE) — Hérault", category: "Emploi", org: "Conseil départemental de l'Hérault", url: "https://mda.herault.fr/cms_viewFilePublication.php?id=668",
    description: "Aide départementale aux bénéficiaires du RSA qui débutent ou reprennent une activité professionnelle. Les dépenses admises peuvent concerner la mobilité, la garde d’enfants ou la formation/reprise d’activité; montants et plafonds varient selon le poste de dépense et l’annexe du règlement.",
    when: "Bénéficiaires du RSA relevant des droits et devoirs et ayant signé un contrat d’engagement réciproque ou bénéficiant d’un suivi France Travail; conditions complémentaires selon emploi salarié, formation, immersion ou activité indépendante.",
    facts: [
      { field: "current_status", status: "verified", value: "Dispositif décrit dans le Règlement départemental d’aide sociale de l’Hérault; la section AFIE indique une mobilisation dans les 3 mois suivant la reprise (6 mois pour certaines formations en contrat aidé).", sourceIds: ["afie-herault-rdas"], validFor: "RDAS consulté le 23-11-2026; le règlement indique son application au 01-01-2025" },
      { field: "territory", status: "verified", value: "Département de l’Hérault.", sourceIds: ["afie-herault-rdas"], validFor: "RDAS Hérault consulté le 23-11-2026" },
      { field: "audience", status: "verified", value: "Allocataires du RSA relevant des droits et devoirs, avec contrat d’engagement réciproque ou suivi France Travail, qui débutent/reprennent une activité, une formation ou une immersion professionnelle; critères spécifiques pour les travailleurs indépendants.", sourceIds: ["afie-herault-rdas"], validFor: "RDAS Hérault, section AFIE, consulté le 23-11-2026" },
      { field: "core_conditions", status: "verified", value: "Demande dans les 3 mois de la reprise (6 mois pour frais de formation de certains contrats aidés); la demande est transmise par un instructeur habilité et examinée par la commission d’équipe pluridisciplinaire. Dépenses postérieures à la demande en règle générale. Les volets comprennent mobilité, garde d’enfants et coûts de formation/reprise d’activité.", sourceIds: ["afie-herault-rdas"], validFor: "RDAS Hérault consulté le 23-11-2026" },
      { field: "amount", status: "unverified", value: null, sourceIds: ["afie-herault-rdas"], validFor: "L'annexe des montants n'a pas été normalisée dans cette passe; aucun montant n'est affiché." },
      { field: "documents", status: "unverified", value: null, sourceIds: ["afie-herault-rdas"], validFor: "Pièces à confirmer avec l'instructeur habilité selon le poste de dépense." },
    ],
    sources: [{ id: "afie-herault-rdas", label: "Département de l'Hérault — Règlement départemental d'aide sociale, section AFIE", url: "https://mda.herault.fr/cms_viewFilePublication.php?id=668", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: checkedAt }],
    informationPublicationStatus: "verified", publicationStatus: "pending", procedureStatus: "partial",
    remainingChecks: ["Extraire et vérifier les plafonds de l'annexe AFIE selon chaque dépense.", "Confirmer l'instructeur compétent selon la situation et la liste des pièces applicables.", "Normaliser le dépôt, le suivi, les modalités de paiement et les recours avant de déclarer une procédure complète."],
  },
  {
    id: "caf-herault-secours-prets", name: "Secours et prêts sociaux — Caf de l’Hérault", category: "Famille", org: "Caisse d'Allocations familiales de l'Hérault", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/accident-de-vie/les-secours-et-prets-sociaux",
    description: "Aides exceptionnelles sous forme de secours ou de prêts sans intérêt, examinées avec un travailleur social de la Caf. Les montants et modalités renvoient au règlement intérieur d’action sociale 2026, dont l’extraction a échoué lors de cette collecte.",
    when: "Familles allocataires avec enfant à charge ou à naître; la page cite notamment séparation, décès, certains impayés ALF et des difficultés de familles à revenus d’activité modestes.",
    facts: [
      { field: "audience", status: "verified", value: "Familles allocataires de la Caf de l’Hérault avec enfant à charge ou à naître.", sourceIds: ["caf-herault-secours-page"], validFor: "Page Caf consultée le 23-11-2026" },
      { field: "eligible_situations", status: "verified", value: "La page cite les situations de célibat avec enfant, séparation/divorce, décès, certains impayés de loyer pour les familles en ALF et des difficultés de foyers modestes percevant la prime d’activité et n’ayant pas le RSA.", sourceIds: ["caf-herault-secours-page"], validFor: "Page Caf consultée le 23-11-2026; liste présentée comme exemples/situations d'examen" },
      { field: "amount", status: "unverified", value: null, sourceIds: ["caf-herault-secours-page", "caf-herault-rias-source"], validFor: "Le RIAS 2026 lié par la Caf n'a pas pu être extrait: serveur en page de maintenance." },
    ],
    sources: [
      { id: "caf-herault-secours-page", label: "Caf de l'Hérault — Les secours et prêts sociaux", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/accident-de-vie/les-secours-et-prets-sociaux", kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
      { id: "caf-herault-rias-source", label: "Caf de l'Hérault — RIAS 2026 (lien officiel; extraction bloquée)", url: "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: null },
    ],
    informationPublicationStatus: "pending", publicationStatus: "pending", procedureStatus: "blocked",
    remainingChecks: ["Extraire le RIAS 2026 lié par la page officielle et vérifier ses règles, plafonds et critères généraux.", "Confirmer les pièces, l'accès au travailleur social, l'instruction et le paiement."],
  },
  {
    id: "bouclier-social-petite-enfance-montpellier", name: "Bouclier social Petite Enfance — Montpellier", category: "Garde", org: "Ville de Montpellier", url: "https://www.montpellier.fr/vie-quotidienne/vivre-ici/j-ai-un-enfant-entre-0-et-3-ans/je-recherche-un-mode-d-accueil/bouclier-social-petite-enfance",
    description: "Dispositif municipal documenté par un règlement 2025, qui réduit le reste à charge d’une garde à domicile sur horaires atypiques pour des familles monoparentales éligibles. La version en vigueur et l’ouverture de la campagne actuelle restent à confirmer.",
    when: "Parents isolés domiciliés à Montpellier avec un enfant de moins de 3 ans, en emploi ou en formation sur des horaires atypiques, sous conditions de quotient familial et de CMG; recours à un organisme de garde affilié requis.",
    facts: [
      { field: "territory", status: "verified", value: "Commune de Montpellier uniquement.", sourceIds: ["montpellier-bouclier-2025"], validFor: "Règlement municipal 2025 consulté le 23-11-2026" },
      { field: "audience", status: "verified", value: "Familles monoparentales résidant à Montpellier avec enfant de moins de 3 ans et horaires de formation ou d’emploi hors des horaires d’accueil classiques.", sourceIds: ["montpellier-bouclier-2025"], validFor: "Règlement et documents municipaux 2025 consultés le 23-11-2026" },
      { field: "core_conditions", status: "partially_verified", value: "Documents municipaux 2025 mentionnent quotient familial ≤ 1 200 €, éligibilité au CMG structure, non-bénéfice du CMG emploi direct, recours à un organisme affilié et accueil du lundi au samedi sur horaires atypiques.", sourceIds: ["montpellier-bouclier-2025"], validFor: "Règles de la version 2025; version/campagne 2026 non confirmée" },
      { field: "current_status", status: "unverified", value: null, sourceIds: ["montpellier-bouclier-page", "montpellier-bouclier-2025"], validFor: "La page actuelle renvoie une erreur 405 à l'ouverture; règlement consulté daté 2025." },
    ],
    sources: [
      { id: "montpellier-bouclier-page", label: "Ville de Montpellier — Bouclier social petite enfance", url: "https://www.montpellier.fr/vie-quotidienne/vivre-ici/j-ai-un-enfant-entre-0-et-3-ans/je-recherche-un-mode-d-accueil/bouclier-social-petite-enfance", kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: null },
      { id: "montpellier-bouclier-2025", label: "Ville de Montpellier — Règlement d'attribution 2025", url: "https://www.montpellier.fr/sites/default/files/2025-04/R%C3%A8glement%20d%27attribution%202025.pdf", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
    ],
    informationPublicationStatus: "pending", publicationStatus: "pending", procedureStatus: "partial",
    remainingChecks: ["Confirmer la validité du règlement et du dispositif pour 2026.", "Vérifier les organismes affiliés et le dossier courant, les délais, le montant de participation et le budget disponible."],
  },
];

for (const data of records) {
  let canonical = catalogue.find((item) => item.id === data.id);
  if (!canonical) {
    canonical = { id: data.id, name: data.name, category: data.category, zone: "34", org: data.org, description: data.description, when: data.when, steps: [], url: data.url };
    catalogue.push(canonical);
  }
  const previous = review[data.id] ?? {};
  const verified = data.informationPublicationStatus === "verified" && canPublishInformation(canonical, {
    informationPublicationStatus: "verified", informationVerifiedAt: checkedAt, sources: data.sources,
    facts: data.facts.map((fact) => fact.field === "current_status" || fact.field === "territory" || fact.field === "audience" || fact.field === "core_conditions" ? { ...fact, status: "verified" } : fact),
  });
  review[data.id] = {
    ...previous,
    informationPublicationStatus: verified ? "verified" : "pending",
    informationVerifiedAt: verified ? checkedAt : null,
    publicationStatus: "pending", procedurePublicationStatus: "pending", reviewedAt: checkedAt, currentForPeriod: verified ? "RDAS Hérault consulté 2026-11-23" : null,
    eligibilityRulesReady: false, testCases: 0, sources: [], factSources: data.sources, facts: data.facts,
    applicationProcedure: { status: data.procedureStatus, steps: [], followUp: { status: "unverified", text: "À vérifier avec l'organisme instructeur.", sourceIds: [data.sources[0].id] }, renewal: { status: "unverified", text: "À vérifier selon le règlement en vigueur.", sourceIds: [data.sources[0].id] }, portalUrl: null, competentOrganization: data.org, remainingChecks: data.remainingChecks },
    notes: [...new Set([...(previous.notes ?? []), ...data.remainingChecks])],
  };
}
if (new Set(catalogue.map((item) => item.id)).size !== catalogue.length) throw new Error("Duplicate canonical aid ID");
await writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ integratedCandidates: records.length, informationPublished: records.filter((item) => review[item.id].informationPublicationStatus === "verified").length, pending: records.filter((item) => review[item.id].informationPublicationStatus !== "verified").length }, null, 2));
