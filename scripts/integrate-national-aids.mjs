import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cataloguePath = path.join(root, "src/data/catalogue.json");
const reviewPath = path.join(root, "src/data/review.json");
const registryPath = path.join(root, "src/data/source-registry.json");
const catalogue = JSON.parse(await readFile(cataloguePath, "utf8"));
const review = JSON.parse(await readFile(reviewPath, "utf8"));
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const consultedAt = "2026-11-23";
const source = (id, label, url, pageVerifiedAt) => ({ id, label, url, kind: "official-guidance", consultedAt, pageVerifiedAt });
const records = [
  {
    id: "rsa-parent-isole", name: "Revenu de solidarité active (RSA) — parent isolé", category: "Revenus", org: "Caf / MSA et services du département", zone: "national", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15553",
    description: "Le RSA prend en compte les ressources et la composition du foyer; des règles spécifiques décrivent la majoration pour parent isolé.",
    facts: [
      { field: "audience", status: "verified", value: "Parent célibataire, divorcé, séparé ou veuf avec enfant à charge, ou femme enceinte, ne vivant pas en couple de manière déclarée et permanente et ne partageant pas ses ressources; la séparation géographique d'un conjoint ne suffit pas.", sourceIds: ["sp-rsa-parent-isole-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "resource_condition", status: "verified", value: "Ressources et composition du foyer prises en compte. Le montant correspond à la différence entre le montant forfaitaire applicable et les ressources retenues; aide au logement, hébergement gratuit ou propriété peuvent entraîner l'ajout d'un forfait logement.", sourceIds: ["sp-rsa-parent-isole-2026"], validFor: "Page vérifiée le 01-04-2026; valeurs à recalculer au barème applicable" },
      { field: "residence_and_stay", status: "verified", value: "Résidence stable et effective en France; conditions supplémentaires de séjour selon la nationalité et le statut.", sourceIds: ["sp-rsa-parent-isole-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "parental_lump_sum_period", status: "verified", value: "La majoration parent isolé peut être accordée pendant 12 mois continus ou discontinus dans les 18 mois suivant l'événement ouvrant le droit; si le plus jeune enfant a moins de 3 ans, jusqu'à son troisième anniversaire.", sourceIds: ["sp-rsa-parent-isole-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "documents", status: "partially_verified", value: "La liste des pièces figure à la dernière page des formulaires Cerfa 15481 (ou 15482 pour non-salarié) et 14130; pièces exactes à vérifier selon le parcours et la situation.", sourceIds: ["sp-rsa-parent-isole-2026"], validFor: "Page vérifiée le 01-04-2026" },
    ],
    procedure: {
      status: "partially_complete",
      steps: [
        { text: "Vérifier la définition du parent isolé, la résidence, le droit au séjour éventuel et les ressources du foyer; le simulateur Caf donne une estimation, pas une décision.", sourceIds: ["sp-rsa-parent-isole-2026"], status: "verified" },
        { text: "Déposer la première demande en ligne auprès de la Caf; selon le territoire et le régime, vérifier les guichets de dépôt compétents du département, CCAS ou association habilitée.", sourceIds: ["sp-rsa-parent-isole-2026"], status: "verified" },
        { text: "Par voie papier, remplir le Cerfa 15481 (ou 15482 si non-salariée) et le Cerfa 14130, puis joindre les pièces listées sur le formulaire courant.", sourceIds: ["sp-rsa-parent-isole-2026"], status: "verified" },
        { text: "Après ouverture, vérifier et valider la déclaration trimestrielle préremplie, y ajouter les ressources manquantes et déclarer rapidement tout changement.", sourceIds: ["sp-rsa-parent-isole-2026"], status: "verified" },
        { text: "Les bénéficiaires sont inscrits automatiquement à France Travail et doivent signer un contrat d'engagement; la page prévoit une réduction possible des obligations horaires pour certaines difficultés familiales, dont parent isolé avec enfant de moins de 12 ans.", sourceIds: ["sp-rsa-parent-isole-2026"], status: "verified_conditional" },
      ],
      followUp: { status: "verified", text: "La page décrit une notification de décision et des déclarations trimestrielles de ressources. En cas de changement de résidence, de situation familiale ou professionnelle, prévenir rapidement la caisse.", sourceIds: ["sp-rsa-parent-isole-2026"] },
      renewal: { status: "verified", text: "Actualisation trimestrielle des ressources et déclaration des changements; l'éligibilité est réexaminée selon la situation.", sourceIds: ["sp-rsa-parent-isole-2026"] },
      portalUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15553",
      competentOrganization: "Caf, MSA ou services départementaux selon le régime et les compétences locales d'accueil/instruction.",
      remainingChecks: ["Comparer les parcours Caf et MSA de bout en bout et confirmer la procédure de dépôt applicable dans chaque département d'Occitanie.", "Ne pas calculer le montant sans intégrer les ressources et forfaits logement en vigueur.", "Vérifier les formulaires et pièces à la date de dépôt."],
    },
  },
  {
    id: "prepare", name: "Prestation partagée d'éducation de l'enfant (PreParE)", category: "Famille", org: "Caf / MSA", zone: "national", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32485",
    description: "Prestation liée à l'interruption ou à la réduction de l'activité professionnelle pour s'occuper d'un jeune enfant.",
    facts: [
      { field: "audience", status: "verified", value: "Parent ayant interrompu ou réduit son activité professionnelle pour s'occuper d'au moins un enfant de moins de 3 ans, ou de moins de 20 ans en cas d'adoption.", sourceIds: ["sp-prepare-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "contribution_condition", status: "verified", value: "Au moins 8 trimestres de cotisation vieillesse sur une période de référence de 2 ans pour un enfant, 4 ans pour deux enfants ou 5 ans à partir de trois enfants; les trimestres validés par chômage indemnisé ne sont pas comptés pour la situation à un enfant.", sourceIds: ["sp-prepare-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "work_status", status: "verified", value: "Salariée : congé parental à temps plein/partiel; fonction publique : congé parental ou temps partiel; non-salariée : justifier la réduction ou cessation d'activité. Les modalités diffèrent selon le statut.", sourceIds: ["sp-prepare-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "amount", status: "verified", value: "Montants mensuels publiés : 459,70 € en interruption totale, 297,17 € à temps partiel jusqu'à 50 %, et 171,42 € entre 50 % et 80 %. La durée varie avec le nombre d'enfants et la situation familiale; pour un parent isolé avec un enfant, jusqu'au premier anniversaire; à partir de deux enfants, jusqu'au troisième anniversaire du plus jeune, sous les règles de réduction liées aux congés indemnisés.", sourceIds: ["sp-prepare-2026"], validFor: "Page vérifiée le 01-06-2026; montants et règles à revalider aux changements de barème" },
      { field: "resource_condition", status: "verified", value: "Service-Public classe la PreParE parmi les prestations familiales sans condition de revenus; les critères de cotisation, d'activité, d'âge et de cumul restent applicables.", sourceIds: ["sp-prepare-2026", "sp-family-resources-2026"], validFor: "Pages vérifiées le 01-06-2026" },
      { field: "documents", status: "verified", value: "Cerfa 12324 de demande de PreParE; pour une première demande Caf/MSA, ajouter la déclaration de situation Cerfa 11423. La situation doit être à jour; le formulaire constitue la liste de pièces spécifiques.", sourceIds: ["sp-prepare-2026"], validFor: "Page vérifiée le 01-06-2026" },
    ],
    procedure: {
      status: "partially_complete",
      steps: [
        { text: "Vérifier âge de l'enfant, réduction/cessation effective de l'activité et huit trimestres de cotisation dans la période de référence correspondant au nombre d'enfants.", sourceIds: ["sp-prepare-2026"], status: "verified" },
        { text: "Caf non allocataire ou MSA non allocataire : envoyer les Cerfa 11423 et 12324; personne déjà allocataire : mettre à jour son dossier et envoyer le Cerfa 12324.", sourceIds: ["sp-prepare-2026"], status: "verified" },
        { text: "Si un congé maternité, paternité, adoption ou maladie indemnisé est en cours, attendre la fin de l'indemnisation avant d'envoyer la demande.", sourceIds: ["sp-prepare-2026"], status: "verified_conditional" },
        { text: "Déclarer rapidement tout changement familial ou professionnel à la Caf/MSA; vérifier les règles de cumul avant de choisir la PreParE majorée, choix définitif si au moins trois enfants.", sourceIds: ["sp-prepare-2026"], status: "verified_conditional" },
      ],
      followUp: { status: "verified", text: "Déclarer les changements à la Caf/MSA; les règles de cumul, fin et durée dépendent du type d'activité et de la configuration du foyer.", sourceIds: ["sp-prepare-2026"] },
      renewal: { status: "partially_verified", text: "Prestation versée pour une durée légale liée à l'âge, au nombre d'enfants et à la situation; les conditions de prolongation doivent être vérifiées dans le cas applicable.", sourceIds: ["sp-prepare-2026"] },
      portalUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32485",
      competentOrganization: "Caf ou MSA selon le régime.",
      remainingChecks: ["Tester les durées pour les différents cas de naissance/adoption et les interruptions indemnisées.", "Contrôler les règles de cumul avec chômage, indemnités journalières, complément familial et reprise d'emploi.", "Vérifier les formulaires à la date de la demande."],
    },
  },
  {
    id: "aeeh", name: "Allocation d'éducation de l'enfant handicapé (AEEH)", category: "Famille", org: "MDPH puis Caf / MSA", zone: "national", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F14809",
    description: "Aide destinée à compenser certaines dépenses liées au handicap d'un enfant; des compléments et une majoration parent isolé peuvent s'appliquer selon décision.",
    facts: [
      { field: "audience", status: "verified", value: "Enfant de moins de 20 ans ayant un taux d'incapacité d'au moins 80 %, ou de 50 % à moins de 80 % avec accompagnement/dispositif/soins préconisés par la CDAPH; l'enfant doit résider de façon permanente en France.", sourceIds: ["sp-aeeh-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "child_income", status: "verified", value: "L'enfant ne doit pas percevoir un revenu professionnel supérieur à 55 % du Smic mensuel brut; Service-Public affiche 1 026,86 € sur la page vérifiée.", sourceIds: ["sp-aeeh-2026"], validFor: "Valeur affichée le 01-06-2026, à revalider" },
      { field: "resource_condition", status: "verified", value: "Pas de condition de ressources pour l'AEEH de base; l'attribution d'un complément dépend des dépenses, de l'aide humaine ou de la réduction/cessation d'activité, évaluées par la CDAPH.", sourceIds: ["sp-aeeh-2026", "sp-family-resources-2026"], validFor: "Pages vérifiées le 01-06-2026" },
      { field: "amount", status: "verified", value: "AEEH de base : 153,01 € selon Service-Public. Des compléments classés par catégories peuvent s'ajouter; une majoration spécifique peut être accordée au parent isolé dans certains cas.", sourceIds: ["sp-aeeh-2026"], validFor: "Page vérifiée le 01-06-2026; montants à revalider au barème courant" },
      { field: "documents", status: "verified", value: "Cerfa 15692*01, certificat médical de moins d'un an, pièce d'identité, justificatif de domicile et, si applicable, jugement de protection juridique; justificatifs supplémentaires possibles selon la demande. Le certificat médical MDPH est obligatoire.", sourceIds: ["sp-aeeh-2026", "sp-mdph-form-15692"], validFor: "Formulaire consulté le 23-11-2026" },
    ],
    procedure: {
      status: "partially_complete",
      steps: [
        { text: "Constituer une demande MDPH avec le Cerfa 15692*01 et le certificat médical de moins d'un an; ajouter les justificatifs obligatoires et les documents de situation précisés par le formulaire.", sourceIds: ["sp-aeeh-2026", "sp-mdph-form-15692"], status: "verified" },
        { text: "Déposer en ligne si la MDPH du lieu de résidence propose ce téléservice, ou envoyer le dossier à la MDPH du lieu de résidence, de préférence en recommandé avec accusé de réception.", sourceIds: ["sp-aeeh-2026", "sp-mdph-form-15692"], status: "verified" },
        { text: "La CDAPH instruit la demande; le délai annoncé est de quatre mois. L'absence de réponse à l'issue du délai vaut rejet implicite selon Service-Public.", sourceIds: ["sp-aeeh-2026", "sp-mdph-form-15692"], status: "verified" },
        { text: "Après décision favorable, le versement est assuré par la Caf ou la MSA; les compléments et la majoration parent isolé dépendent de l'évaluation et de la situation de l'aidant.", sourceIds: ["sp-aeeh-2026"], status: "verified_conditional" },
      ],
      followUp: { status: "verified", text: "Suivre la demande auprès de la MDPH. En cas de refus, Service-Public indique un recours administratif préalable obligatoire dans les deux mois suivant la décision.", sourceIds: ["sp-aeeh-2026", "sp-mdph-form-15692"] },
      renewal: { status: "partially_verified", text: "Demande de renouvellement possible avec le même formulaire MDPH; durée accordée et moment de renouvellement dépendent de la décision, à contrôler sur la notification.", sourceIds: ["sp-mdph-form-15692"] },
      portalUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R19993",
      competentOrganization: "MDPH pour l'évaluation/décision CDAPH; Caf ou MSA pour le paiement.",
      remainingChecks: ["Vérifier les plafonds d'âge et conditions précises des catégories de compléments et de majoration parent isolé.", "Revalider les montants selon le barème en vigueur au dépôt.", "Identifier si la MDPH de chaque département d'Occitanie offre le téléservice."],
    },
  },
];

for (const data of records) {
  if (review[data.id]?.informationPublicationStatus === "verified") continue;
  const existing = catalogue.find((record) => record.id === data.id || record.url === data.url);
  if (!existing) catalogue.push({ id: data.id, name: data.name, category: data.category, zone: data.zone, org: data.org, description: data.description, when: data.facts.find((fact) => fact.field === "audience").value, steps: data.procedure.steps.map((step) => step.text), url: data.url });
  const srcs = data.id === "rsa-parent-isole"
    ? [source("sp-rsa-parent-isole-2026", "Service-Public — RSA parent isolé", data.url, "2026-04-01")]
    : data.id === "prepare"
      ? [source("sp-prepare-2026", "Service-Public — PreParE", data.url, "2026-06-01"), source("sp-family-resources-2026", "Service-Public — Prestations familiales et conditions de ressources", "https://www.service-public.fr/particuliers/vosdroits/F13212", "2026-06-01")]
      : [source("sp-aeeh-2026", "Service-Public — AEEH", data.url, "2026-06-01"), source("sp-family-resources-2026", "Service-Public — Prestations familiales et conditions de ressources", "https://www.service-public.fr/particuliers/vosdroits/F13212", "2026-06-01"), source("sp-mdph-form-15692", "Service-Public — Demande ou renouvellement de prestations MDPH, Cerfa 15692*01", "https://www.service-public.gouv.fr/particuliers/vosdroits/R19993", consultedAt)];
  const factSourceIds = new Set(data.facts.flatMap((fact) => fact.sourceIds));
  review[data.id] = {
    ...(review[data.id] ?? {}),
    publicationStatus: "pending", reviewedAt: consultedAt, currentForPeriod: "Règles et montants datés selon les pages indiquées; revérifier à chaque mise à jour officielle", eligibilityRulesReady: false, testCases: 0,
    factSources: srcs.filter((item) => factSourceIds.has(item.id)), facts: data.facts, applicationProcedure: data.procedure,
    notes: [...new Set([...(review[data.id]?.notes ?? []), "Nouvelle fiche nationale intégrée avec critères et parcours sourcés; statut maintenu en attente des tests de scénarios, formulaires à jour et vérifications départementales."])],
    sources: srcs,
  };
}

if (new Set(catalogue.map((item) => item.id)).size !== catalogue.length || new Set(catalogue.map((item) => item.url)).size !== catalogue.length) throw new Error("Duplicate canonical ID or URL");
await writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
const sourceRecord = registry.sources.find((item) => item.id === "service-public");
sourceRecord.evidence = [...(sourceRecord.evidence ?? []), ...records.map(({ id, url }) => ({ aidId: id, url, pageVerifiedAt: id === "rsa-parent-isole" ? "2026-04-01" : "2026-06-01" }))].filter((item, index, all) => all.findIndex((candidate) => candidate.aidId === item.aidId) === index);
sourceRecord.candidateRecordsIntegrated = sourceRecord.evidence.length;
sourceRecord.factsEnrichedForAids = sourceRecord.evidence.length;
sourceRecord.publishableRecords = sourceRecord.evidence.filter((item) => review[item.aidId]?.informationPublicationStatus === "verified").length;
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ added: records.length, totalCatalogueRecords: catalogue.length, published: 0 }, null, 2));
