import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFile(path.join(root, file), "utf8").then(JSON.parse);
const write = (file, data) => writeFile(path.join(root, file), `${JSON.stringify(data, null, 2)}\n`, "utf8");
const [catalogue, review, registry] = await Promise.all([
  read("src/data/catalogue.json"), read("src/data/review.json"), read("src/data/source-registry.json"),
]);
const consultedAt = "2026-11-23";
const source = (id, label, url, pageVerifiedAt) => ({ id, label, url, kind: "official-guidance", consultedAt, pageVerifiedAt });
const definitions = [
  {
    id: "paje-prime-naissance", name: "PAJE — prime à la naissance", category: "Famille", org: "Caf / MSA", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2550",
    description: "Prime sous conditions de ressources versée pendant la grossesse pour préparer l’arrivée de l’enfant.",
    audience: "Personne attendant un enfant, relevant de la Caf ou de la MSA, sous plafond de ressources tenant compte de la composition familiale; un barème spécifique existe pour le parent isolé.",
    conditions: "Premier examen prénatal effectué et grossesse déclarée avant la fin du troisième mois. Le revenu net catégoriel 2024 sert à l’examen des droits en 2026; résidence en France au moins neuf mois dans l’année de versement.",
    sources: [source("sp-paje-prime-naissance-2026", "Service-Public — Prime à la naissance de la Paje", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2550", "2026-04-01"), source("caf-bareme-paje-2026", "Caf — Barème prime à la naissance et allocation de base", "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-la-naissance-et-allocation-de-base", "2026-04-01")],
    amount: { status: "conflict", value: "Service-Public affiche 1 093,11 €; le barème Caf au 1er avril 2026 affiche 1 093,08 €. Montant à confirmer auprès de la caisse; non affiché comme montant certain." },
    documents: null,
    steps: [{ text: "Effectuer le premier examen prénatal et déclarer la grossesse avant la fin du troisième mois.", status: "verified" }, { text: "Déposer la demande auprès de la Caf ou de la MSA selon le régime; le téléservice ou formulaire dépend de la situation de l’allocataire.", status: "verified_conditional" }],
    note: "Le seuil exact dépend du nombre d’enfants à charge, du statut de parent isolé et des revenus professionnels retenus; vérifier le tableau applicable à la situation."
  },
  {
    id: "paje-allocation-base", name: "PAJE — allocation de base", category: "Famille", org: "Caf / MSA", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2552",
    description: "Prestation sous conditions de ressources pour contribuer à l’entretien et à l’éducation d’un enfant de moins de trois ans.",
    audience: "Parent ayant un enfant à charge de moins de trois ans et dont les ressources respectent le plafond applicable; un barème spécifique existe pour le parent isolé.",
    conditions: "Les revenus nets catégoriels de 2024 sont pris en compte pour les droits en 2026. Le plafond varie selon la composition du foyer et les revenus d’activité.",
    sources: [source("sp-paje-allocation-base-2026", "Service-Public — Allocation de base de la Paje", "https://www.service-public.gouv.fr/particuliers/vosdroits/F2552", "2026-04-01"), source("caf-bareme-paje-2026", "Caf — Barème prime à la naissance et allocation de base", "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-la-naissance-et-allocation-de-base", "2026-04-01")],
    amount: { status: "conflict", value: "Le taux plein est affiché à 198,16 € par la Caf et Service-Public. Pour le taux partiel, Service-Public affiche 99,08 € et la Caf 99,09 € au 1er avril 2026; le montant partiel est à confirmer." },
    documents: { status: "verified", value: "Pages lisibles du livret de famille et acte de naissance de l’enfant, selon la page Service-Public.", sourceIndex: 0 },
    steps: [{ text: "Vérifier l’âge de l’enfant et le plafond de ressources applicable à la situation familiale.", status: "verified" }, { text: "Transmettre à la Caf ou à la MSA les pages lisibles du livret de famille et l’acte de naissance de l’enfant, selon la page officielle.", status: "verified_conditional" }],
    note: "Les conditions d’adoption ont une fiche et des règles séparées. Les seuils exacts varient selon la composition familiale."
  },
  {
    id: "paje-prime-adoption", name: "PAJE — prime à l’adoption", category: "Famille", org: "Caf / MSA", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13220",
    description: "Prime sous conditions de ressources liée à l’adoption ou à l’accueil en vue d’adoption d’un enfant.",
    audience: "Personne adoptant ou accueillant en vue d’adoption un enfant de moins de 20 ans par l’intermédiaire de l’Aide sociale à l’enfance, d’un organisme français autorisé/Agence française de l’adoption ou d’une autorité étrangère compétente.",
    conditions: "Plafond de ressources applicable selon les revenus nets catégoriels de 2024 pour 2026 et la composition familiale, avec barème parent isolé. Les justificatifs et étapes varient notamment selon le pays d’origine et le statut Caf.",
    sources: [source("sp-paje-prime-adoption-2026", "Service-Public — Prime à l’adoption de la Paje", "https://www.service-public.gouv.fr/particuliers/vosdroits/F13220", "2026-04-01"), source("caf-bareme-paje-2026", "Caf — Barème prime à la naissance et allocation de base", "https://www.caf.fr/professionnels/offres-et-services/accompagnement-des-allocataires/bareme-prime-la-naissance-et-allocation-de-base", "2026-04-01")],
    amount: { status: "conflict", value: "Service-Public affiche 2 186,21 €; le barème Caf au 1er avril 2026 affiche 2 186,17 €. Montant à confirmer auprès de la caisse; non affiché comme montant certain." },
    documents: { status: "partially_verified", value: "Les justificatifs varient selon le pays d’origine, la procédure d’adoption et le statut Caf/MSA; Service-Public cite notamment l’attestation ASE/organisme autorisé ou le procès-verbal du conseil de famille pour certains cas. La liste complète doit être contrôlée pour chaque parcours.", sourceIndex: 0 },
    steps: [{ text: "Identifier le parcours applicable selon le pays d’origine de l’enfant et la situation Caf/MSA; les pièces justificatives ne sont pas les mêmes dans tous les cas.", status: "verified_conditional" }, { text: "Pour certains dossiers Caf, transmettre l’attestation ASE/organisme autorisé ou procès-verbal du conseil de famille; d’autres situations nécessitent les formulaires de déclaration et pièces d’adoption décrits par Service-Public.", status: "verified_conditional" }],
    note: "Les pièces, interlocuteurs et formulaires dépendent du parcours d’adoption; la procédure complète doit être vérifiée individuellement."
  },
  {
    id: "ajpp", name: "Allocation journalière de présence parentale (AJPP)", category: "Famille", org: "Caf / MSA", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F15132",
    description: "Aide journalière liée à la cessation temporaire d’activité pour s’occuper d’un enfant gravement malade, accidenté ou handicapé.",
    audience: "Personne cessant temporairement son activité pour s’occuper d’un enfant à charge de moins de 20 ans nécessitant une présence soutenue et des soins contraignants en raison d’une maladie, d’un handicap ou d’un accident d’une particulière gravité.",
    conditions: "La Caf/MSA apprécie les conditions médicales sur certificat du médecin traitant. Plusieurs statuts professionnels sont couverts; le droit est limité à 22 jours par mois et peut être accordé sur une période de trois ans, sous les plafonds de jours prévus.",
    sources: [source("sp-ajpp-2026", "Service-Public — AJPP", "https://www.service-public.gouv.fr/particuliers/vosdroits/F15132", "2026-06-14"), source("caf-ajpp-form", "Service-Public — Demande AJPP auprès de la Caf (Cerfa 12666)", "https://www.service-public.gouv.fr/particuliers/vosdroits/R15336", "2021-03-09"), source("msa-ajpp-form", "Service-Public — Demande AJPP auprès de la MSA", "https://www.service-public.gouv.fr/particuliers/vosdroits/R67539", "2024-02-28")],
    amount: { status: "verified", value: "Service-Public affiche 66,64 € par journée et 33,32 € par demi-journée; barème indiqué sur la page vérifiée le 14 juin 2026, à revalider au dépôt." },
    documents: { status: "verified", value: "Formulaire de demande AJPP du régime concerné (Caf : Cerfa 12666; MSA : formulaire dédié), certificat médical sous pli confidentiel détaillant la présence soutenue et les soins contraignants, et justificatif professionnel demandé selon la situation.", sourceIndex: 0 },
    steps: [{ text: "Faire établir par le médecin traitant le certificat médical détaillant les soins contraignants et la présence soutenue; le volet médical est transmis sous pli confidentiel au service médical.", status: "verified" }, { text: "Adresser à la Caf ou à la MSA le formulaire AJPP adapté au régime avec les éléments de situation professionnelle demandés.", status: "verified_conditional" }, { text: "Après ouverture du droit, transmettre les attestations mensuelles de jours ou demi-journées utilisés; l’employeur complète sa partie lorsque la situation le requiert.", status: "verified_conditional" }],
    note: "L’attribution dépend d’une évaluation médicale et de la situation d’activité; l’AJPP n’est pas réservée aux parents isolés. Vérifier les règles de partage entre parents au moment de la demande."
  }
];

for (const item of definitions) {
  const existing = catalogue.find((record) => record.id === item.id || record.url === item.url);
  if (existing && existing.id !== item.id) throw new Error(`Possible duplicate canonical aid ${item.id}: ${existing.id}`);
  if (review[item.id]?.informationPublicationStatus === "verified" && review[item.id]?.procedurePublicationStatus && (item.documents === null || review[item.id]?.facts?.some((fact) => fact.field === "documents"))) {
    const amountFact = review[item.id].facts?.find((fact) => fact.field === "amount");
    if (item.amount.status === "verified" && amountFact?.validFor === `Pages consultées ${consultedAt}; conflit signalé, ne pas traiter comme valeur certaine`) amountFact.validFor = `Page Service-Public vérifiée ${item.sources[0].pageVerifiedAt}; montant affiché à revalider au dépôt`;
    continue;
  }
  const record = existing ?? { id: item.id, name: item.name, category: item.category, zone: "national", org: item.org, description: item.description, when: item.audience, steps: item.steps.map((step) => step.text), url: item.url };
  if (!existing) catalogue.push(record);
  const ids = item.sources.map((entry) => entry.id);
  const facts = [
    { field: "current_status", status: "verified", value: "Prestation présentée comme en vigueur sur la page officielle consultée; règles à revalider lors de chaque mise à jour.", sourceIds: [ids[0]], validFor: `Page Service-Public vérifiée ${item.sources[0].pageVerifiedAt}` },
    { field: "territory", status: "verified", value: "Dispositif national; demandes auprès de la Caf ou de la MSA selon le régime.", sourceIds: [ids[0]], validFor: `Consulté le ${consultedAt}` },
    { field: "audience", status: "verified", value: item.audience, sourceIds: [ids[0]], validFor: `Page vérifiée ${item.sources[0].pageVerifiedAt}` },
    { field: "core_conditions", status: "verified", value: item.conditions, sourceIds: [ids[0]], validFor: `Page vérifiée ${item.sources[0].pageVerifiedAt}; vérifier les barèmes au dépôt` },
    { field: "amount", ...item.amount, sourceIds: item.sources.map((entry) => entry.id), validFor: `Pages consultées ${consultedAt}; conflit signalé, ne pas traiter comme valeur certaine` },
  ];
  if (item.documents) facts.push({ field: "documents", ...item.documents, sourceIds: [ids[item.documents.sourceIndex]], validFor: `Page vérifiée ${item.sources[0].pageVerifiedAt}` });
  for (const fact of facts) delete fact.sourceIndex;
  const prior = review[item.id] ?? {};
  const priorVerified = prior.informationPublicationStatus === "verified";
  review[item.id] = {
    ...prior,
    publicationStatus: prior.publicationStatus ?? "pending",
    informationPublicationStatus: priorVerified ? prior.informationPublicationStatus : "verified",
    informationVerifiedAt: priorVerified ? prior.informationVerifiedAt : consultedAt,
    procedurePublicationStatus: "pending",
    reviewedAt: consultedAt,
    currentForPeriod: `Règles nationales documentées à partir des pages listées; seuils et montants à revalider selon le barème applicable au dépôt.`,
    eligibilityRulesReady: false,
    testCases: 0,
    sources: [...(prior.sources ?? []).filter((old) => !item.sources.some((fresh) => fresh.id === old.id)), ...item.sources],
    facts,
    factSources: item.sources,
    applicationProcedure: {
      status: "partially_complete", steps: item.steps.map((step) => ({ ...step, sourceIds: [ids[0]] })),
      followUp: { status: "unverified", text: "Modalités de suivi à vérifier selon la caisse, le formulaire et la situation individuelle.", sourceIds: [ids[0]] },
      renewal: { status: "unverified", text: "Durée ou renouvellement à vérifier selon le droit ouvert et le cas individuel.", sourceIds: [ids[0]] },
      portalUrl: null, competentOrganization: item.org,
      remainingChecks: [item.note, "Vérifier le formulaire courant et le parcours de dépôt correspondant au régime et à la situation."],
    },
    applicationUrl: null,
    notes: [...new Set([...(prior.notes ?? []), item.note])],
  };
}

const sourceRecord = registry.sources.find((entry) => entry.id === "service-public");
sourceRecord.candidateRecordsIntegrated = (sourceRecord.candidateRecordsIntegrated ?? 0) + definitions.filter((item) => !sourceRecord.evidence?.some((entry) => entry.aidId === item.id)).length;
sourceRecord.evidence = [...(sourceRecord.evidence ?? []), ...definitions.map((item) => ({ aidId: item.id, url: item.url, pageVerifiedAt: item.sources[0].pageVerifiedAt }))].filter((entry, index, all) => all.findIndex((candidate) => candidate.aidId === entry.aidId) === index);
sourceRecord.factsEnrichedForAids = sourceRecord.evidence.length;
sourceRecord.publishableRecords = sourceRecord.evidence.filter((entry) => review[entry.aidId]?.informationPublicationStatus === "verified").length;
sourceRecord.status = "national-aid-source-evidence-linked; PAJE amount conflicts explicitly surfaced; application procedures incomplete";
await Promise.all([write("src/data/catalogue.json", catalogue), write("src/data/review.json", review), write("src/data/source-registry.json", registry)]);
console.log(JSON.stringify({ integrated: definitions.length, totalCatalogue: catalogue.length, informationVerified: definitions.filter((item) => review[item.id].informationPublicationStatus === "verified").length, proceduresComplete: definitions.filter((item) => review[item.id].applicationProcedure.status === "complete").length }, null, 2));
