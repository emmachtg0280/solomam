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
    description: "Aides exceptionnelles sous forme de secours ou de prêts sans intérêt, après ouverture des droits légaux et étude au cas par cas par la commission des aides individuelles sur proposition d’un travailleur social Caf. Les montants ne sont pas forfaitaires.",
    when: "Familles allocataires avec enfant à charge ou à naître; situations citées : parent seul avec enfants, séparation/divorce/décès, impayé de loyer avec ALF pour une famille avec enfant à charge, ou difficultés de familles percevant la prime d’activité avec QF inférieur à 800 € et sans RSA.",
    facts: [
      { field: "current_status", status: "verified", value: "Aide locale décrite au règlement intérieur d’action sociale CAF Hérault 2026.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, version téléchargée le 23-11-2026" },
      { field: "territory", status: "verified", value: "Allocataires relevant de la Caf de l’Hérault.", sourceIds: ["caf-herault-rias-2026", "caf-herault-secours-page"], validFor: "RIAS 2026 et page allocataire Caf consultés le 23-11-2026" },
      { field: "audience", status: "verified", value: "Familles allocataires concernées : célibat avec enfant, séparation/divorce/décès; familles avec enfant à charge en ALF en cas d’impayé de loyer; foyers modestes bénéficiaires de la prime d’activité, QF < 800 €, sans RSA.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 5" },
      { field: "core_conditions", status: "verified", value: "Droits légaux préalablement ouverts; accompagnement par un travailleur social et proposition à la Commission des aides individuelles; aide accordée au cas par cas en secours ou prêt sans intérêt. Les dettes de loyer, d’électricité, de gaz, d’eau ou de téléphone relèvent prioritairement du FSL. En résidence alternée avec partage de prestations, chacun des parents allocataire peut demander l’examen de son dossier.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 5" },
      { field: "amount", status: "verified", value: "Pas de barème ni de montant fixe publié : nature et montant décidés au cas par cas par la Commission des aides individuelles.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 5" },
      { field: "documents", status: "verified", value: "Évaluation sociale décrivant la situation familiale, financière, administrative et sociale, l’origine des difficultés et le projet de résolution avec les aides et accompagnements sollicités.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 5" },
    ],
    sources: [
      { id: "caf-herault-secours-page", label: "Caf de l'Hérault — Les secours et prêts sociaux", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/accident-de-vie/les-secours-et-prets-sociaux", kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
      { id: "caf-herault-rias-2026", label: "Caf de l'Hérault — Règlement intérieur d’action sociale 2026", url: "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
    ],
    informationPublicationStatus: "verified", publicationStatus: "pending", procedureStatus: "partially_complete",
    remainingChecks: ["Confirmer auprès de la Caf le point d’entrée pour prendre rendez-vous avec le travailleur social et le canal de suivi du dossier."],
  },
  {
    id: "caf-herault-pret-equipement-logement", name: "Prêt à l’équipement du logement — Caf de l’Hérault", category: "Logement", org: "Caisse d'Allocations familiales de l'Hérault", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/logement/aideaulogementmontpellier/les-3-etapes-de-l-aide-au-logement",
    description: "Prêt Caf destiné à l’équipement ménager, mobilier et de puériculture, plafonné à 95 % du devis et 650 €. Le règlement 2026 inclut les parents non-gardiens et encadre le fournisseur, les biens et le remboursement.",
    when: "Allocataires Caf de l’Hérault avec quotient familial ≤ 900 €, percevant au moins une prestation légale (RSA, prime d’activité ou APL) le mois de la demande et n’ayant pas de prêt de même nature en cours; les parents sans charge de l’enfant et non-gardiens sont expressément inclus.",
    facts: [
      { field: "current_status", status: "verified", value: "Prêt local décrit au RIAS de la Caf de l’Hérault 2026.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026" },
      { field: "territory", status: "verified", value: "Allocataires relevant de la Caf de l’Hérault.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026" },
      { field: "audience", status: "verified", value: "Familles allocataires, y compris parents non-gardiens ou sans charge d’enfant, avec QF ≤ 900 €.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 4" },
      { field: "core_conditions", status: "verified", value: "Au mois de la demande, percevoir au moins une prestation parmi RSA, prime d’activité ou APL; ne pas avoir de prêt de même nature en cours; achat auprès d’un fournisseur partenaire agréé avec devis. Équipements limités à la liste du règlement.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 4" },
      { field: "amount", status: "verified", value: "Prêt plafonné à 95 % du devis et à 650 €, remboursé par retenues sur prestations en mensualités choisies de 25 €, 35 €, 45 € ou 55 €.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 4" },
      { field: "documents", status: "verified", value: "Dossier Caf et devis établi par un fournisseur partenaire agréé; justificatif Banque de France requis en situation de surendettement.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 4" },
    ],
    sources: [{ id: "caf-herault-rias-2026", label: "Caf de l'Hérault — Règlement intérieur d’action sociale 2026", url: "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: checkedAt }],
    informationPublicationStatus: "verified", publicationStatus: "pending", procedureStatus: "partially_complete",
    remainingChecks: ["Vérifier le lien courant du formulaire Caf et de la liste des fournisseurs partenaires avant d'afficher un parcours de demande détaillé."],
  },
  {
    id: "caf-herault-mobilite-insertion", name: "Aide à la mobilité pour l’insertion professionnelle — Caf de l’Hérault", category: "Mobilité", org: "Caisse d'Allocations familiales de l'Hérault", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/accident-de-vie/les-secours-et-prets-sociaux",
    description: "Aide locale Caf pour le permis (code/heures de conduite) ou la location d’un véhicule, dans le cadre d’un parcours d’insertion. La demande passe par un organisme d’accompagnement conventionné avec la Caf.",
    when: "Allocataires avec enfant(s) à charge qui perçoivent des minima sociaux et sont accompagnés vers l’insertion professionnelle par un organisme conventionné par la Caf de l’Hérault.",
    facts: [
      { field: "current_status", status: "verified", value: "Aide locale décrite au RIAS de la Caf de l’Hérault 2026.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026" },
      { field: "territory", status: "verified", value: "Allocataires accompagnés dans le cadre de l’offre locale de la Caf de l’Hérault.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 6" },
      { field: "audience", status: "verified", value: "Allocataires avec enfant(s) à charge, percevant des minima sociaux et suivis vers l’insertion professionnelle par un organisme conventionné Caf.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 6" },
      { field: "core_conditions", status: "verified", value: "La demande doit être faite auprès d’un organisme d’accompagnement conventionné par la Caf dans un parcours d’insertion. Dépenses citées : heures de conduite/code et location de véhicule à deux ou quatre roues.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 6" },
      { field: "amount", status: "verified", value: "Plafond de 2 000 € par année civile, dans la limite du coût du projet et mobilisable en deux fois maximum; cumulable avec d’autres aides institutionnelles à la mobilité.", sourceIds: ["caf-herault-rias-2026"], validFor: "RIAS 2026, section 6" },
    ],
    sources: [{ id: "caf-herault-rias-2026", label: "Caf de l'Hérault — Règlement intérieur d’action sociale 2026", url: "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf", kind: "official-regulation", consultedAt: checkedAt, pageVerifiedAt: checkedAt }],
    informationPublicationStatus: "verified", publicationStatus: "pending", procedureStatus: "partial",
    remainingChecks: ["Identifier un organisme conventionné local et confirmer les pièces et modalités propres au parcours individuel."],
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
const importsRoot = path.join(root, "src/data/imports/local/herault");
await import("node:fs/promises").then(({ mkdir }) => mkdir(path.join(importsRoot, "normalized"), { recursive: true }));
const riasExtract = {
  sourceId: "caf-herault-rias-2026",
  sourceUrl: "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf",
  rawSnapshot: "src/data/imports/local/herault/raw/rias-caf-herault-2026.pdf",
  retrievedAt: checkedAt,
  officialPage: "https://www.caf.fr/professionnels/offres-et-services/caf-de-l-herault/partenaires-locaux",
  extractedSections: [
    { section: "5. Secours et prêts sociaux", pdfPages: [14, 15], findings: ["Familles allocataires; situations de parent seul avec enfants, séparation/divorce/décès; impayé de loyer en ALF pour familles avec enfant à charge; prime d’activité avec revenus modestes, QF < 800 €, sans RSA.", "Droits légaux préalablement ouverts; proposition d’un travailleur social; décision de la Commission des aides individuelles; secours ou prêt sans intérêt au cas par cas.", "Évaluation sociale décrivant la situation, l’origine des difficultés et les aides/accompagnements sollicités.", "Les dettes de loyer, électricité, gaz, eau et téléphone sont prioritairement examinées au FSL."] },
    { section: "4. Prêt à l’équipement du logement", pdfPages: [13, 14], findings: ["QF ≤ 900 €; parents non-gardiens inclus; percevoir RSA, prime d’activité ou APL le mois de demande; aucun prêt de même nature en cours.", "Montant ≤ 95 % du devis et ≤ 650 €; devis d’un fournisseur partenaire agréé; mensualités de 25 €, 35 €, 45 € ou 55 €."] },
    { section: "6. Mobilité pour insertion professionnelle", pdfPages: [15], findings: ["Allocataires avec enfants à charge percevant des minima sociaux et accompagnés par un organisme conventionné Caf.", "Permis/code/heures de conduite ou location de véhicule 2/4 roues; plafond 2 000 € par année civile, jusqu’à deux mobilisations, dans la limite du coût du projet."] },
    { section: "7. Aide locale BAFA 1", pdfPages: [15], findings: ["Stagiaire allocataire ou enfant à charge, sans condition de ressources; aide plafonnée à 100 €, sous réserve de budget, après validation de la première session; formulaire et justificatifs à transmettre dans les 3 mois.", "Le règlement signalait le formulaire comme disponible prochainement à sa publication; disponibilité actuelle non confirmée, donc non intégrée en fiche."] },
  ],
  scopeLimitations: ["Le RIAS fixe les règles d'aides locales sous enveloppe annuelle; il ne garantit pas l'octroi individuel.", "Les pages précisent que l’aide aux dettes locatives et aux charges concernées relève prioritairement du FSL.", "La mobilité reste une orientation via un organisme conventionné, qui n'est pas encore identifié pour chaque demandeuse."],
};
await writeFile(path.join(importsRoot, "normalized/rias-aides-extract-2026.json"), `${JSON.stringify(riasExtract, null, 2)}\n`, "utf8");
const registryPath = path.join(root, "src/data/source-registry.json");
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const registrySource = { id: "caf-herault-rias-2026", name: "Caf de l'Hérault — RIAS 2026, aides financières individuelles", url: riasExtract.sourceUrl, role: "Règlement officiel des aides locales aux familles allocataires; secours, prêts sociaux, équipement, mobilité et vacances", status: "official-pdf-downloaded-extracted-key-sections-reviewed", version: "RIAS 2026; sections 4 à 7 extraites, secours/prêts, équipement, mobilité et BAFA", license: "Aucun texte intégral reproduit; faits résumés avec source et pages PDF", retrievedAt: checkedAt, recordsImported: 0, candidateRecordsIntegrated: records.filter((item) => item.id.startsWith("caf-herault-")).length, factsEnrichedForAids: records.filter((item) => item.id.startsWith("caf-herault-")).length, publishableRecords: 0, snapshot: "src/data/imports/local/herault/raw/rias-caf-herault-2026.pdf", extractedSummary: "src/data/imports/local/herault/normalized/rias-aides-extract-2026.json", coverage: "CAF Hérault", limitations: ["L'octroi des secours/prêts est discrétionnaire et décidé au cas par cas; le circuit précis d'orientation reste à confirmer.", "Les fenêtres et critères 2026 des aides aux vacances ne sont pas pérennes; les aides saisonnières ne sont pas ajoutées à cette passe."] };
registry.sources = [...registry.sources.filter((item) => item.id !== registrySource.id && item.id !== "caf-herault-rias" && item.id !== "caf-herault-rias-source"), registrySource];
registry.auditedAt = checkedAt;
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ integratedCandidates: records.length, informationPublished: records.filter((item) => review[item.id].informationPublicationStatus === "verified").length, pending: records.filter((item) => review[item.id].informationPublicationStatus !== "verified").length, riasSnapshot: riasExtract.rawSnapshot }, null, 2));
