import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertUniqueCanonicalAids, sameAidIdentity } from "../src/lib/catalogue-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const qualificationsPath = path.join(root, "src/data/imports/occitanie/normalized/qualifications.json");
const cataloguePath = path.join(root, "src/data/catalogue.json");
const reviewPath = path.join(root, "src/data/review.json");
const qualifications = JSON.parse(await readFile(qualificationsPath, "utf8"));
const catalogue = JSON.parse(await readFile(cataloguePath, "utf8"));
const review = JSON.parse(await readFile(reviewPath, "utf8"));
const pageDecisionsPath = path.join(root, "src/data/imports/occitanie/normalized/official-page-decisions.json");
const pageDecisions = JSON.parse(await readFile(pageDecisionsPath, "utf8"));
const editorialExclusions = pageDecisions.editorialExclusions ?? {};
const excludedUrls = new Set(Object.keys(editorialExclusions));
for (const removed of catalogue.filter((item) => excludedUrls.has(item.url))) {
  const decision = editorialExclusions[removed.url];
  review[removed.id] = {
    ...(review[removed.id] ?? {}),
    editorialDisposition: { status: "excluded-from-editorial-catalogue", decidedAt: pageDecisions.reviewedAt, reason: decision.reason, qualificationRetained: true, rawSnapshotRetained: true },
    notes: [...new Set([...(review[removed.id]?.notes ?? []), `Exclue du catalogue éditorial Solomam : ${decision.reason} La qualification, les preuves et le snapshot brut sont conservés.`])],
  };
}
for (let index = catalogue.length - 1; index >= 0; index -= 1) if (excludedUrls.has(catalogue[index].url)) catalogue.splice(index, 1);
const checkedAt = "2026-11-23";
const categoryFor = (name) => {
  const value = name.toLocaleLowerCase("fr");
  if (/logement|hébergement/.test(value)) return "Logement";
  if (/garde d'enfant/.test(value)) return "Garde";
  if (/emploi|embauche|rémunération|stagiaires|formation/.test(value)) return "Emploi";
  if (/vélo|covoiturage|mobilité|transport/.test(value)) return "Mobilité";
  if (/mutuelle|santé/.test(value)) return "Santé";
  if (/bourse|mérite|études/.test(value)) return "Études";
  if (/lycée|lycéen|scolaire|manuels|équipement|carte jeune|loRdi|licence sportive|secours citoyen/.test(value)) return "Enfants & école";
  if (/auteur|autrice|écriture/.test(value)) return "Culture";
  return "Accompagnement";
};
const slugify = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&amp;/g, "et").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cleanText = (value) => value
  .replace(/&#8217;|&rsquo;/g, "’")
  .replace(/&nbsp;|&#160;/g, " ")
  .replace(/&amp;/g, "&")
  .replace(/&quot;/g, '"')
  .replace(/&#(d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/\s+/g, " ").trim();
const frenchAudience = {
  "occ-aide-a-la-lecture-de-loisirs": "Lycéens titulaires de la Carte Jeune Région; la page de la Région identifie le lycéen comme bénéficiaire.",
  "occ-pass-mutuelle-etudiant-e": "Étudiants boursiers en Occitanie ne disposant pas de la CSS, d'une couverture complémentaire employeur ou d'une couverture comme ayant droit d'un parent.",
  "occ-remuneration-des-stagiaires-de-la-formation-professionnelle": "Demandeurs d'emploi de plus de 16 ans suivant un stage de formation professionnelle et non indemnisés par France Travail, selon les conditions de la page régionale.",
  "occ-campagne-d-incitation-financiere-aux-covoitureurs": "Adultes réalisant des trajets quotidiens éligibles en covoiturage via un opérateur partenaire.",
  "occ-aide-au-merite-pour-les-etudiants-en-formations-sanitaires-et-sociales": "Étudiants boursiers inscrits dans une formation sanitaire ou sociale éligible en Occitanie et titulaires d'une mention très bien au baccalauréat.",
  "occ-eco-cheque-mobilite-bonus-velo-adapte-pmr": "Personnes majeures résidant principalement en Occitanie et disposant d'un justificatif de handicap établissant l'impossibilité d'utiliser un vélo classique, selon les conditions de la Région.",
  "occ-hebergement-en-centre-afpa-occitanie": "Demandeurs d'emploi en formation du Plan régional de formation qui rencontrent une difficulté d'hébergement ou de mobilité, selon les conditions publiées.",
  "occ-eco-cheque-mobilite-achat-d-un-velo-a-assistance-electrique": "Personnes majeures résidant principalement en Occitanie, sous le plafond de revenu fiscal de référence et les conditions d'achat précisées par la Région.",
  "occ-eco-cheque-mobilite-bonus-forfait-mobilite-durable": "Personnes majeures résidant principalement en Occitanie et percevant le forfait mobilités durables de leur employeur; plafond de ressources et conditions de cycle à confirmer dans le règlement courant.",
  "occ-aide-a-l-acquisition-d-un-ordinateur-portable-lordi": "Jeunes entrant dans un lycée éligible avec une Carte Jeune Région; le type d'aide dépend de l'établissement et des ressources du foyer.",
  "occ-ecocheque-mobilite-lyceen-boursier-de-classe-de-seconde": "Lycéens boursiers entrant en classe de seconde dans un établissement d'Occitanie et résidant principalement dans la région.",
  "occ-livre-aide-individuelle-aux-auteurs-et-aux-autrices-projet-d-ecriture": "Auteurs et autrices professionnels résidant principalement en Occitanie et répondant aux conditions de publications antérieures et d'obligations fiscales/sociales.",
  "occ-les-bons-plans-ou-les-je-m-engage-de-la-carte-jeune-region": "Jeunes titulaires de la Carte Jeune Région pendant l'année scolaire concernée.",
  "occ-bourses-d-etudes-sanitaires-et-sociales": "Personnes inscrites dans une formation paramédicale, maïeutique ou sociale éligible d'un établissement autorisé ou agréé par la Région.",
  "occ-le-pacte-pour-l-embauche": "Personnes résidant en Occitanie qui recherchent un emploi ou reprennent une activité; dispositif d'orientation vers des aides et accompagnements partenaires.",
  "occ-solutions-d-hebergement-et-de-logement-pour-les-jeunes-de-moins-de-30-ans": "Jeunes de moins de 30 ans en entrée d'études, stage, emploi ou formation professionnelle; service d'information et d'orientation logement.",
  "occ-premier-equipement-professionnel": "Élèves de lycée professionnel en formation éligible dans un établissement concerné, titulaires de la Carte Jeune Région.",
  "occ-aide-a-l-acquisition-d-une-licence-sportive-unss": "Lycéens titulaires de la Carte Jeune Région dans un lycée ayant une association sportive affiliée à l'UNSS.",
  "occ-la-mobilite-internationale-des-etudiants-avec-mouv-occitanie": "Étudiants sélectionnés par leur établissement pour une mobilité internationale d'études ou de stage éligible; conditions variables selon ressources, statut, formation et destination.",
  "occ-formation-aux-premiers-secours-citoyen-un-jeune-forme-une-vie-sauvee": "Jeunes titulaires de la Carte Jeune Région inscrits auprès d'un organisme agréé et affilié.",
  "occ-pret-des-manuels-scolaires": "Lycéens inscrits dans des formations générales, technologiques ou professionnelles éligibles d'un établissement d'Occitanie, titulaires de la Carte Jeune Région.",
  "occ-aide-a-la-garde-d-enfants": "Parents ayant un enfant à charge de moins de 10 ans et suivant une formation régionale éligible ou reprenant un emploi sous les conditions de durée et de délai indiquées par la Région.",
};

const candidates = qualifications.records.filter((record) => record.classification.status === "relevant" && !excludedUrls.has(record.normalized.officialUrl));
let added = 0;
let alreadyPresent = 0;
for (const record of candidates) {
  const name = cleanText(record.normalized.officialName);
  const officialUrl = record.normalized.officialUrl;
  const id = `occ-${slugify(name)}`;
  const existing = catalogue.find((item) => item.id === id || sameAidIdentity(item, { name, org: "Région Occitanie", zone: "regional" }));
  if (existing && (existing.org !== "Région Occitanie" || existing.zone !== "regional")) throw new Error(`Canonical aid ID collision for ${id}: ${existing.name} (${existing.org}, ${existing.zone})`);
  const audience = frenchAudience[id] ?? "Public bénéficiaire à confirmer sur la page officielle du dispositif.";
  const description = "Dispositif régional identifié comme potentiellement pertinent; conditions détaillées et modalités en cours de vérification.";
  if (!existing) {
    catalogue.push({
      id,
      name,
      category: categoryFor(name),
      zone: "regional",
      org: "Région Occitanie",
      description,
      when: audience,
      steps: [],
      url: officialUrl,
    });
    added += 1;
  } else if (review[existing.id]?.informationPublicationStatus !== "verified") {
    existing.description = description;
    existing.when = audience;
    alreadyPresent += 1;
  } else {
    // A refreshed dataset must not replace editor-verified public facts.
    alreadyPresent += 1;
  }
  const facts = [];
  if (record.normalized.audience) facts.push({ field: "audience", status: "verified", value: audience, sourceIds: [`${id}:region-page`], validFor: "Vérification de la page officielle au 23-11-2026; période réglementaire détaillée non établie" });
  if (record.normalized.amount) facts.push({ field: "amount", status: "verified", value: cleanText(record.normalized.amount), sourceIds: [`${id}:region-page`], validFor: "Montant tel qu'affiché sur la page consultée le 23-11-2026; période d'application à contrôler" });
  facts.push({ field: "validity_period", status: "unverified", value: record.normalized.validFrom || record.normalized.validUntil ? `${record.normalized.validFrom ?? "début non précisé"} – ${record.normalized.validUntil ?? "fin non précisée"}` : null, sourceIds: [`${id}:dataset`], validFor: "Le dataset ne suffit pas à établir la période juridique" });
  facts.push({ field: "documents", status: "unverified", value: null, sourceIds: [`${id}:region-page`], validFor: null });
  const prior = review[id];
  if (prior?.informationPublicationStatus === "verified") continue;
  const original = {
    sourceRecordId: record.sourceRecordId,
    sourceRecordHash: record.sourceRecordHash,
    sourceRecordIndex: record.sourceIndex,
    rawRecordReference: record.rawRecordReference,
    qualification: record.classification,
    deduplication: record.deduplication,
  };
  const sourceFacts = [
    { id: `${id}:region-page`, label: `Région Occitanie — ${name}`, url: officialUrl, kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
    { id: `${id}:dataset`, label: "Dataset des aides et appels à projets de la Région Occitanie", url: qualifications.source, kind: "dataset", consultedAt: checkedAt, pageVerifiedAt: null },
  ];
  review[id] = {
    ...(prior ?? {}),
    publicationStatus: "pending",
    informationPublicationStatus: prior?.informationPublicationStatus ?? "pending",
    procedurePublicationStatus: prior?.procedurePublicationStatus ?? "pending",
    reviewedAt: checkedAt,
    currentForPeriod: null,
    eligibilityRulesReady: false,
    testCases: 0,
    sourceDatasetRecord: original,
    factSources: sourceFacts,
    facts,
    applicationProcedure: {
      status: "incomplete",
      steps: [],
      followUp: { status: "unverified", text: "Modalités de suivi à relever sur la page ou le règlement officiel.", sourceIds: [`${id}:region-page`] },
      renewal: { status: "unverified", text: "Renouvellement ou nouvelle campagne à confirmer.", sourceIds: [`${id}:region-page`] },
      portalUrl: null,
      competentOrganization: "Région Occitanie; guichet et service instructeur à vérifier pour ce dispositif.",
      remainingChecks: ["Vérifier le bénéficiaire direct et les critères complets sur la page et ses documents règlementaires.", "Confirmer la validité et la campagne en vigueur.", "Documenter les justificatifs, le dépôt, le suivi, le renouvellement et les exceptions.", "N'activer aucune règle d'éligibilité sur la seule qualification de pertinence."],
    },
    notes: [...new Set([...(prior?.notes ?? []), `Entrée intégrée depuis le snapshot régional ${record.sourceRecordId}; pertinence candidate, fiche non publiable en l'état. Conditions complètes, validité et procédure à extraire et dater.`])],
    sources: prior?.sources ?? [],
  };
}

// Preserve the targeted official-page review for the school-sport candidate.
const schoolSportId = "occ-aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire";
const schoolSportPage = "https://www.laregion.fr/Aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire";
if (catalogue.some((item) => item.id === schoolSportId)) {
  const sourceId = "region-school-sport-page-2026";
  const source = { id: sourceId, label: "Région Occitanie — Aides en faveur du développement de la pratique du sport scolaire", url: schoolSportPage, kind: "official-guidance", consultedAt: "2026-11-24", pageVerifiedAt: "2026-11-24" };
  review[schoolSportId] = {
    ...review[schoolSportId],
    informationPublicationStatus: "pending",
    informationVerifiedAt: null,
    publicationStatus: "pending",
    reviewedAt: "2026-11-24",
    facts: [
      { field: "current_status", status: "partially_verified", value: "La page régionale décrit le dispositif et précise qu’une ligne financière est votée chaque année; la campagne et l’enveloppe de l’année scolaire en cours ne sont pas établies par la page consultée.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24; budget voté annuellement." },
      { field: "territory", status: "verified", value: "Région Occitanie.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24." },
      { field: "audience", status: "verified", value: "Les bénéficiaires listés comprennent les lycéens, les associations sportives de lycées, les services régionaux et départementaux UNSS ainsi que des comités de sport universitaire et scolaire.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24." },
      { field: "core_conditions", status: "partially_verified", value: "Pour les championnats de France et compétitions internationales, la Région indique 20 € par sportif et par nuitée versés aux associations d’établissements affiliés à l’UNSS, avec prise en charge du professeur accompagnant et d’un jeune officiel. Les autres aides évoquées dépendent de la Carte Jeune Région et de la ligne budgétaire annuelle.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24; campagne annuelle et détails de dépôt à confirmer." },
    ],
    factSources: [source],
    sources: [],
    currentForPeriod: null,
    applicationProcedure: {
      status: "incomplete",
      steps: [],
      followUp: { status: "unverified", text: "Les coordonnées du service régional des sports sont affichées; la procédure de dépôt applicable à la campagne courante reste à confirmer.", sourceIds: [sourceId] },
      renewal: { status: "unverified", text: "L’enveloppe est votée annuellement; les conditions de reconduction et de dépôt de la campagne en cours ne sont pas établies.", sourceIds: [sourceId] },
      portalUrl: null,
      competentOrganization: "Région Occitanie — Direction des Sports; association scolaire ou organisme sportif selon le volet.",
      remainingChecks: ["Confirmer l’ouverture et le règlement de la campagne en cours, le bénéficiaire direct de chaque volet et les modalités de dépôt."],
    },
    notes: [...new Set([...(review[schoolSportId]?.notes ?? []), "Fiche maintenue en attente: la page mélange une subvention versée aux associations/organismes et une aide liée à la Carte Jeune; l’ouverture budgétaire annuelle et le bénéfice direct pour une famille ne sont pas établis."])],
  };
  const registryPath = path.join(root, "src/data/source-registry.json");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const registrySource = { id: sourceId, name: source.label, url: source.url, role: "Bénéficiaires, soutien aux déplacements sportifs scolaires et calendrier annuel", status: "official-page-reviewed-current-campaign-unconfirmed", retrievedAt: "2026-11-24", recordsImported: 0, candidateRecordsIntegrated: 1, license: "Faits résumés avec attribution", coverage: "Région Occitanie", limitations: ["L’aide de 20 € par sportif et par nuitée est versée à des associations UNSS; campagne et ligne budgétaire courantes à confirmer."] };
  const registryIndex = registry.sources.findIndex((item) => item.id === sourceId);
  if (registryIndex < 0) registry.sources.push(registrySource); else registry.sources[registryIndex] = registrySource;
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

const ids = catalogue.map((item) => item.id);
assertUniqueCanonicalAids(catalogue, "integrate-occitanie-qualified");
if (new Set(ids).size !== ids.length) throw new Error("Duplicate canonical catalogue IDs detected");
await writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ qualifyingRecords: candidates.length, added, alreadyPresent, catalogueRecords: catalogue.length }, null, 2));
