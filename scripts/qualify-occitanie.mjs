import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { repairText } from "./lib/repair-text.mjs";
import { sameAidIdentity } from "../src/lib/catalogue-identity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rawPath = path.join(root, "src/data/imports/occitanie/raw/dataset.json");
const cataloguePath = path.join(root, "src/data/catalogue.json");
const outputPath = path.join(root, "src/data/imports/occitanie/normalized/qualifications.json");
const reportPath = path.join(root, "src/data/imports/import-report.json");
const registryPath = path.join(root, "src/data/source-registry.json");
const pageDecisionsPath = path.join(root, "src/data/imports/occitanie/normalized/official-page-decisions.json");
const checkedAt = "2026-11-23";
const regionDataUrl = "https://data.laregion.fr/explore/dataset/aides-et-appels-a-projets-de-la-region-occitanie/";
const pageDecisionSnapshot = JSON.parse(await readFile(pageDecisionsPath, "utf8"));
const officialPageDecisions = pageDecisionSnapshot.decisions ?? [];
const officialPageDecisionsByUrl = new Map(officialPageDecisions.map((decision) => [decision.url, decision]));
const editorialExclusionsByUrl = new Map(Object.entries(pageDecisionSnapshot.editorialExclusions ?? {}));

// Decisions below are keyed by the stable official URL. Page-level verification
// links to official Region pages. Items without enough evidence remain manual.
const verifiedRelevant = {
  "https://www.laregion.fr/eco-cheque-mobilite-vehicule-electrique-occasion": { audience: "Personne majeure domiciliée en Occitanie et non imposable, n'ayant pas déjà bénéficié de cette aide ou de ses versions antérieures.", justification: "La Région décrit une aide directe à une personne physique avec conditions de résidence, de ressources, de véhicule et de non-cumul; le règlement officiel est disponible.", amount: "30 % du coût d'acquisition, plafonné à 1 600 € (règlement 2026)", status: "relevant" },
  "https://www.laregion.fr/Aide-a-la-lecture-de-loisirs": { audience: "Lycéens titulaires de la Carte Jeune Région; a child in the household may be the direct beneficiary.", justification: "Official page confirms an individual benefit of €20 for qualifying lycée learners across Occitanie.", amount: "20 €", status: "relevant" },
  "https://www.laregion.fr/Pass-Mutuelle-Etudiant-e": { audience: "Scholarship students in Occitanie lacking CSS, employer coverage, or dependent coverage under a parent's health plan.", justification: "Official page describes the student-specific regional complementary health support; eligibility is conditional and must be checked against the current scheme rules.", status: "relevant" },
  "https://www.laregion.fr/Remuneration-des-stagiaires-de-la-formation-professionnelle": { audience: "Jobseekers with vocational trainee status, over 16 and not compensated by France Travail (page conditions).", justification: "Official page identifies a direct payment to vocational trainees and gives the non-compensation and age conditions.", status: "relevant" },
  "https://www.laregion.fr/Campagne-d-incitation-financiere-aux-covoitureurs": { audience: "Adult carpoolers for qualifying daily trips, through participating carpool operators.", justification: "Official page names carpoolers as beneficiaries, alongside operators; it is a mobility incentive relevant to adults in the region.", status: "relevant" },
  "https://www.laregion.fr/Aide-au-merite": { audience: "Scholarship students in eligible post-baccalaureate health/social courses in Occitanie with a very-good baccalaureate distinction.", justification: "Official page confirms an individual €900 merit grant, criteria, annual filing window and Mes Aides en Ligne portal.", amount: "900 € (official page)", status: "relevant" },
  "https://www.laregion.fr/Eco-cheque-mobilite-Bonus-velo-adapte-PMR": { audience: "Adults residing primarily in Occitanie, with an official disability document establishing inability to use a standard two-wheel bike.", justification: "Official page confirms individual aid of 50% up to €1,000 after other reimbursements; possible relevance depends on disability status.", amount: "50% capped at 1,000 € (official page)", status: "relevant" },
  "https://www.laregion.fr/Hebergement-en-centre-AFPA-Occitanie": { audience: "Jobseekers with vocational trainee status in a Plan Régional de Formation course and accommodation/mobility difficulty.", justification: "Official page confirms free AFPA accommodation for the duration of the training, independent of the training provider.", status: "relevant" },
  "https://www.laregion.fr/Eco-cheque-mobilite-velo-a-assistance-electrique": { audience: "Adults primarily resident in Occitanie with RFR per tax unit at or below €14,089, subject to bicycle/purchase criteria.", justification: "Official page confirms individual €200 aid, means threshold, regional seller, online application and supporting documents. Purchase must be made after 1 July 2023 and a complete claim submitted within six months; page does not state an overall end date.", amount: "200 € (official page)", status: "relevant" },
  "https://www.laregion.fr/Aide-a-l-acquisition-d-un-ordinateur-portable-loRdi": { audience: "Young people entering an eligible lycée with a Carte Jeune Région; support varies by school and household resources.", justification: "Official page describes free equipment or €80/€200 aid based on resources and publishes the 2026–2027 ordering window.", status: "relevant" },
  "https://www.laregion.fr/Livre-Aide-individuelle-aux-auteurs-et-aux-autrices-Projet-d-ecriture": { audience: "Professional artist-authors resident primarily in Occitanie with the specified publication record and tax/social obligations current.", justification: "Official page confirms a direct individual grant for structured writing/illustration/translation projects; this is occupation-specific, not a general family benefit.", status: "relevant" },
  "https://www.laregion.fr/Les-Bons-Plans-ou-les-Je-m-engage-de-la-Carte-Jeune-Region": { audience: "Young Carte Jeune Région holders during the current school year.", justification: "Official page confirms direct free or preferential offers in daily-life, health, culture, sports and education; offers vary and are accessed in the youth account.", status: "relevant" },
  "https://www.laregion.fr/bourses-etudes-sanitaires-sociales": { audience: "Learners enrolled in eligible paramedical, midwifery or social-work courses at a Region-authorized/approved training centre.", justification: "Official page confirms individual means-tested study grants and explicitly identifies eligible course families; current conditions and incompatibilities must be checked for each applicant.", status: "relevant" },
  "https://www.laregion.fr/pacte-embauche": { audience: "Occitanie residents seeking or returning to employment; includes coordinated support for childcare, housing, mobility, training and insertion.", justification: "Official page says the programme supports inhabitants seeking or returning to work and provides concrete partner services; each underlying measure has its own eligibility and contact route.", status: "relevant" },
  "https://www.laregion.fr/Solutions-hebergement-et-logement-jeunes": { audience: "Young people under 30 starting study, internship, work or vocational training, including housing-information and referral support.", justification: "Official page provides an information/accompaniment service and links to local services; it is not itself a single cash benefit.", status: "relevant" },
  "https://www.laregion.fr/Premier-equipement-professionnel": { audience: "Lycée vocational learners in eligible courses and establishments, holders of the Carte Jeune Région.", justification: "Official page confirms delivery of free tools/clothing at the start of the school year for listed eligible courses.", status: "relevant" },
  "https://www.laregion.fr/Aide-a-l-acquisition-d-une-licence-sportive-UNSS": { audience: "Lycéens holding the Carte Jeune Région in a lycée with an UNSS-affiliated sports association.", justification: "Official page confirms a €15 direct school-year benefit and explicitly states the lycée/UNSS conditions.", amount: "15 € (official page)", status: "relevant" },
  "https://www.laregion.fr/Aides-Mouv-Occitanie": { audience: "Students selected by their higher-education institution for an eligible international study or internship mobility; aid depends on resources, status, course and destination.", justification: "Official page documents individual Mouv’Occitanie aids, institutional selection, application stages and award constraints.", status: "relevant" },
  "https://www.laregion.fr/Formation-premiers-secours": { audience: "Young people holding the Carte Jeune Région, enrolled through an approved and affiliated provider.", justification: "Official page confirms a free PSC course during the relevant school-year window.", status: "relevant" },
  "https://www.laregion.fr/Pret-des-manuels-scolaires": { audience: "Lycéens in eligible general, technological or vocational courses in public or state-contracted Occitanie schools (excluding post-bac), with Carte Jeune Région.", justification: "Official page confirms free school-year textbook loans and school-based distribution/return.", status: "relevant" },
  "https://www.laregion.fr/Aide-a-la-Garde-d-Enfants": { audience: "Parents with a dependent child under 10, following a PRF or health/social training course, or returning to employment with a contract of at least one month within the specified return-to-work window.", justification: "Official page confirms €250 for qualifying trainees and €80/€250 for qualifying return-to-work contracts, depending on contract duration.", amount: "80 € or 250 € (by situation; official page)", status: "relevant" },
  "https://www.laregion.fr/Ecocheque-mobilite-lyceen-boursier": { audience: "Scholarship student entering seconde at a school in Occitanie and primarily resident in the region.", justification: "The official page identifies an individual bike grant of 50% up to €200 and gives a recurring September–January filing window for the school year of entry to seconde. Confirm the current campaign window and supporting-rule version before publication.", amount: "50% capped at 200 € (official page)", status: "relevant" },
  "https://www.laregion.fr/Eco-cheque-mobilite-Bonus-forfait-mobilite-durable": { audience: "Adults primarily resident in Occitanie who receive the Forfait Mobilités Durables from their employer; the official page also states an income ceiling and conditions for the cycle.", justification: "The official page confirms the aid goes to a natural person and lists regional residence, employer FMD, means test and non-cumulation conditions. This is legally separate from the VAE purchase eco-check; both cannot be received for the same support category.", amount: "Resource-dependent; the current downloadable scale must be checked", status: "relevant" },
};

const verifiedExpired = {
  "https://www.laregion.fr/Bourses-aux-athletes-Team-Occitanie-Haut-Niveau": "The official page's 2026 application period ran from 1 January through 30 April 2026 and is over as of the review date (23 November 2026). The next campaign has not been documented.",
  "https://www.laregion.fr/Pret-gratuit-de-velos-a-assistance-electrique-dans-8-lycees-pilotes-d-Occitanie": "The official page describes an experiment for 2024 and intended renewal for the 2025/26 school year. Its stated operating period has ended; no 2026/27 continuation was found on the reviewed page.",
};

const verifiedNotRelevant = {
  "https://www.laregion.fr/Aide-a-la-construction-et-a-la-rehabilitation-de-logements-pour-les-jeunes": "The official page identifies HLM organisations, authorised associations or institutions as direct recipients; a household cannot apply for this investment grant.",
  "https://www.laregion.fr/Accueil-de-la-petite-enfance": "The direct recipients are communes/EPCI, associations, CCAS/CIAS and operators developing childcare facilities; this is not an individual family benefit.",
  "https://www.laregion.fr/Dispositif-regional-fonds-de-solidarite-catastrophes-naturelles": "The fund supports local authorities and public bodies after natural disasters; it does not provide direct individual housing repair grants.",
  "https://www.laregion.fr/Arts-de-la-scene-Aide-aux-festivals": "The official aid targets legal entities carrying performing-arts festival projects, not individual households.",
  "https://www.laregion.fr/Aide-aux-equipements-culturels-et-patrimoniaux-structurants": "The official page states that aid is for public owners/project owners or collective associations and is not individual aid.",
  "https://www.laregion.fr/Dispositif-d-aide-au-prototypage-de-jeu-video": "The page concerns video-game production/publishing companies and is currently being updated; its direct applicant is not a household.",
  "https://www.laregion.fr/Dispositif-regional-de-soutien-au-fonctionnement-des-CFA-OFA-2026": "The official page identifies apprenticeship training centres and apprenticeship training organisations as grant recipients, not the apprentices themselves.",
  "https://www.laregion.fr/Dispositif-d-aides-pour-les-projets-d-energie-renouvelable-cooperatifs-et-citoyens-d": "The official page names associations, local authorities/public actors and businesses as applicants for collective renewable-energy project grants; it is not a direct household energy bill aid.",
  "https://www.laregion.fr/Startup-industrie-de-demain": "The official page restricts this innovation support to young companies meeting prior-public-support/incubator, research-laboratory and sector conditions.",
  "https://www.laregion.fr/Pass-Transformation-Ecologique": "The official page restricts the pass to registered companies with at least one employee, a first activity balance sheet and specified sectors; it is business investment support.",
  "https://www.laregion.fr/Contrat-3S-Volet-transformation": "The official page names companies and commercial-revenue associations as recipients for strategic business projects; not a household benefit.",
  "https://www.laregion.fr/Biodiversite-Arbres-et-haies-champetres": "The official page names specialist associations/cooperatives and, in unserved areas, local authorities and their groupings; private individuals are not the grant applicants.",
  "https://www.laregion.fr/Dispositif-Preuve-de-concept": "The official page limits this research-transfer call to public research institutions, universities, qualifying private public-service institutions and SATTs.",
  "https://www.laregion.fr/Soutien-aux-etablissements-de-formations-sanitaires-et-sociales": "The official page provides annual operating/investment grants to authorized training establishments or their managing organisations, not to enrolled students.",
  "https://www.laregion.fr/Promotion-collective-des-produits-agricoles-et-agroalimentaires": "The official page describes collective promotion support for interprofessional bodies, producer groups, regional agricultural structures and company groupings; these are not individual household grants.",
  "https://www.laregion.fr/realis-42741": "The official page offers a three-year business support programme for newly created social-economy/committed enterprises selected by an approval committee; it is not a direct family support service.",
  "https://www.laregion.fr/Dispositif-Convention-Filieres-Territorialisees": "The official page restricts access to invited agricultural/food-chain organizations, producer groups, cooperatives and companies; no individual household application route exists.",
  "https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-a-la-creation-audiovisuelle": "The official page requires the project to be presented by the delegated production company, which is the applicant/recipient; authors are not direct grant recipients on this page.",
  "https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-aux-manifestations-audiovisuelles": "The official page restricts applications to private or public legal entities organizing audiovisual events; audiences are beneficiaries of the events, not aid applicants.",
  "https://www.laregion.fr/Programme-Regional-d-intervention-en-faveur-des-Poles-d-Echanges-Multimodaux": "The official page limits the capital-grant applicants to EPCI, communes and station operators for transport infrastructure projects; users of the transport hubs are not aid applicants.",
  "https://www.laregion.fr/Soutien-des-clubs-sportifs-Occitanie-Ambassadeur-Sport": "The official page names eligible sports clubs and their projects as aid recipients, with selection by competitive level and development activities; it does not provide an individual family benefit.",
  "https://www.laregion.fr/Aides-regionales-a-l-animation-d-actions-collectives-en-matiere-d-economie": "The official page restricts grants to regional/local legal entities, professional networks and observatories for collective circular-economy actions.",
  "https://www.laregion.fr/Aides-regionales-a-la-realisation-de-projets-locaux-en-matiere-d-economie-circulaire": "The official page names public and private legal entities (collectivities, public bodies, companies, associations, professional bodies) as recipients of project grants.",
  "https://www.laregion.fr/Soutien-au-developpement-de-l-education-a-l-environnement-et-au-developpement": "The official page restricts grant beneficiaries to legal entities developing environmental-education projects (associations, local authorities, public bodies, social-economy companies and foundations). The public reached by an activity is not the grant recipient.",
  "https://www.laregion.fr/Fonds-Regional-de-Garantie-FRG-Occitanie": "The official page limits the guarantee to Occitanie TPE/PME eligible for an initial Bpifrance guarantee; the beneficiary is the business borrower, not an individual household.",
  "https://www.laregion.fr/Dispositif-regional-pour-la-gestion-durable-de-la-ressource-en-eau": "The official page names public bodies, chambers, associations/foundations and established companies as project-aid recipients; it is not a direct household water bill benefit.",
  "https://www.laregion.fr/Biodiversite-Centres-de-soins-a-la-faune-sauvage": "The official page limits applications to associations operating authorized wildlife-care centres and their project partners.",
  "https://www.laregion.fr/Aide-regionale-au-developpement-des-chaufferies-biomasse": "The official page names companies, local authorities, public bodies, associations and social landlords as project owners applying for investment grants.",
  "https://www.laregion.fr/Livre-Aide-a-la-mobilite-hors-region-et-a-l-export-des-maisons-d-edition": "The official page names independent publishing businesses established in Occitanie as applicants for professional trade-fair/export mobility costs.",
  "https://www.laregion.fr/Livre-Aide-aux-investissements-des-maisons-d-edition-independantes": "The official page describes investment support for independent publishing houses; recipients are publishing businesses rather than households.",
  "https://www.laregion.fr/Accompagnement-des-eleves-de-maternelle-dans-les-transports-scolaires": "The official page identifies communes, intercommunal bodies and associations as applicants and recipients of the operating subsidy; families are service users, not aid applicants.",
  "https://www.laregion.fr/Aide-a-la-mobilite-internationale-des-jeunes-en-insertion-avec-Mouv-Occitanie": "The official page restricts applicants to member organisations of the Erasmus+ consortium; young people are participants in group actions rather than individual aid applicants.",
  "https://www.laregion.fr/Aide-a-la-mobilite-internationale-des-eleves-du-sanitaire-et-social-avec-Mouv": "The official page restricts applicants to consortium-member organisations and funds group mobility projects; individual learners are beneficiaries of those projects, not the applicants.",
  "https://www.laregion.fr/Mobilite-europeenne-des-personnels-des-formations-sanitaires-et-sociales": "The official page restricts recipients to staff employed by consortium-member training institutions; it is not a family/learner aid.",
  "https://www.laregion.fr/Contrat-Transmission-Reprise-D-entreprises": "La page officielle cible le cédant ou le repreneur d'une entreprise et finance une transmission-reprise; il s'agit d'un soutien à un projet d'entreprise, pas d'une aide sociale ou familiale.",
  "https://www.laregion.fr/Aide-regionale-au-developpement-des-installations-solaires-thermiques": "La page officielle exclut explicitement les particuliers; les bénéficiaires sont des associations, collectivités, organismes publics, entreprises, professionnels et bailleurs sociaux portant un investissement.",
  "https://www.laregion.fr/competencesRH-entreprises": "L'offre Pass RH est destinée aux entreprises, groupements et associations employeuses de 5 à 49 salariés dans certains secteurs; les particuliers ne sont pas bénéficiaires.",
  "https://www.laregion.fr/Pass-RH": "Le dispositif finance un diagnostic et un accompagnement RH au bénéfice d'entreprises et associations employeuses de 5 à 49 salariés; une personne ou une famille ne peut pas en demander le bénéfice.",
  "https://www.laregion.fr/Dispositif-pour-la-Renovation-des-batiments-publics-ERP-pour-une-meilleure": "La page vise les communes, EPCI, syndicats mixtes et organismes publics pour rénover des ERP; les habitants sont usagers des bâtiments, non demandeurs de l'aide.",
  "https://www.laregion.fr/Dispositif-de-soutien-aux-equipements-structurants-Bourgs-Centres-Occitanie": "La page finance des projets d'équipements mutualisés portés par des communes, EPCI ou syndicats mixtes; les habitants sont bénéficiaires d'usage et non demandeurs.",
  "https://www.laregion.fr/Contrat-Agriculture-Durable-Public-Structures-de-conseil-et-d-accompagnement": "La page distingue la structure sélectionnée qui candidate et reçoit le forfait de 1 500 euros par contrat; l'agriculteur reçoit un accompagnement mais ne demande pas cette subvention régionale comme particulier.",
};

function normalizedKey(value) {
  return String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
function stableHash(value) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function entityFromUrl(url) { return url?.startsWith("https://www.laregion.fr/") ? "Région Occitanie" : null; }
function evidenceFor(record, status, justification, pageDecision) {
  const sources = [{ url: regionDataUrl, kind: "dataset-record", retrievedAt: "2026-11-24", fields: ["titre", "type", "chapo", "introduction", "date_publication", "date_modification", "url", "thematiques"] }];
  if (record.url && (status !== "needs_manual_review" || pageDecision)) sources.push({ url: record.url, kind: "official-programme-page", consultedAt: pageDecision?.consultedAt ?? checkedAt, status: pageDecision?.sourceStatus ?? "official-page-checked", verificationNote: justification });
  return sources;
}

export async function qualifyOccitanieRecords() {
  const { records = [], retrievedAt, sourceUrl, schema = [] } = JSON.parse(await readFile(rawPath, "utf8"));
  const catalogue = JSON.parse(await readFile(cataloguePath, "utf8"));
  const aidRecords = records.map((record, sourceIndex) => ({ record, sourceIndex })).filter(({ record }) => /^aides?$/i.test(record.type ?? ""));
  const qualifications = aidRecords.map(({ record, sourceIndex }) => {
    const rawHash = stableHash(record);
    record = Object.fromEntries(Object.entries(record).map(([key, value]) => [key, typeof value === "string" ? repairText(value) : value]));
    const pageDecision = officialPageDecisionsByUrl.get(record.url);
    const specific = verifiedRelevant[record.url] ?? verifiedNotRelevant[record.url];
    const expiredReason = verifiedExpired[record.url];
    let reviewStatus = "needs_manual_review";
    let justification = pageDecision?.justification ?? "Le dataset officiel donne le titre, le thème et un extrait, mais pas les règles d'éligibilité, la période juridique, les pièces et le chemin de demande. Une validation de la fiche officielle reste nécessaire.";
    let beneficiary = null;
    let amount = null;
    if (pageDecision?.status === "relevant") {
      reviewStatus = "relevant"; beneficiary = pageDecision.audience; amount = pageDecision.amount;
    } else if (pageDecision?.status === "not_relevant") {
      reviewStatus = "not_relevant";
    } else if (pageDecision?.status === "expired") {
      reviewStatus = "expired";
    } else if (specific && verifiedRelevant[record.url]) {
      reviewStatus = "relevant"; ({ audience: beneficiary, justification, amount } = specific);
    } else if (specific && verifiedNotRelevant[record.url]) {
      reviewStatus = "not_relevant"; justification = specific;
    } else if (expiredReason) {
      reviewStatus = "expired"; justification = expiredReason;
    }
    const hash = rawHash;
    const id = `occitanie:${record.url ? normalizedKey(record.url.split("/").pop()) : hash.slice(0, 20)}`;
    const duplicateOf = catalogue.find((item) => sameAidIdentity(item, { name: record.titre, org: entityFromUrl(record.url), zone: "regional" }));
    const introduction = [record.chapo, record.introduction].filter(Boolean).join("\n\n");
    const sourceStatus = reviewStatus === "needs_manual_review" ? "dataset-only" : "official-page-checked";
    const sourceEntries = evidenceFor(record, reviewStatus, justification, pageDecision);
    return {
      id,
      sourceRecordId: record.source_record_id ?? record.recordid ?? record.id ?? `content-sha256:${hash}`,
      sourceRecordIdKind: record.source_record_id ?? record.recordid ?? record.id ? "upstream" : "derived-content-hash",
      sourceIndex,
      sourceRecordHash: hash,
      rawRecordReference: { file: "src/data/imports/occitanie/raw/dataset.json", recordIndex: sourceIndex, sourceDataset: "aides-et-appels-a-projets-de-la-region-occitanie", datasetRetrievedAt: retrievedAt ?? null },
      classification: { status: reviewStatus, justification, decidedAt: checkedAt },
      editorialDisposition: editorialExclusionsByUrl.has(record.url)
        ? { status: "excluded-from-editorial-catalogue", reason: editorialExclusionsByUrl.get(record.url).reason, decidedAt: pageDecisionSnapshot.reviewedAt }
        : ["https://www.laregion.fr/Aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire", "https://www.laregion.fr/Avec-Mouv-Occitanie-la-Region-t-aide-pour-ta-mobilite-internationale"].includes(record.url)
          ? { status: "candidate-retained-for-review", reason: record.url.includes("sport-scolaire") ? "Le lycée est identifié comme bénéficiaire, mais l’aide individuelle effective aux familles/élèves et les modalités restent à établir." : "Aide individuelle possible pour des jeunes selon leur statut d’études, de formation ou de recherche d’emploi; pertinence conditionnée à ces statuts, sans ciblage monoparental." , decidedAt: pageDecisionSnapshot.reviewedAt }
          : { status: "eligible-for-editorial-review", reason: "Aucune décision éditoriale additionnelle enregistrée.", decidedAt: pageDecisionSnapshot.reviewedAt },
      normalized: {
        officialName: record.titre ?? null,
        type: record.type ?? null,
        benefitKind: reviewStatus === "relevant" ? (/service|logement|accompagnement/i.test(record.titre ?? "") || record.url === "https://www.laregion.fr/pacte-embauche" ? "service-or-accompagnement" : "aid-or-benefit") : null,
        organization: entityFromUrl(record.url),
        audience: pageDecision?.audience ?? beneficiary,
        conditions: pageDecision?.conditions ?? (reviewStatus === "relevant" ? beneficiary : null),
        territory: { level: "regional", regionCode: "76", label: "Occitanie" },
        amount: pageDecision?.amount ?? amount,
        documents: null,
        applicationSteps: null,
        officialUrl: record.url ?? null,
        datasetExcerpt: introduction || null,
        topics: record.thematiques ?? null,
        publishedAt: record.date_publication ?? null,
        sourceModifiedAt: record.date_modification ?? null,
        validFrom: null,
        validUntil: null,
        validityStatus: pageDecision?.validityStatus ?? "not-established-by-dataset",
      },
      sources: sourceEntries.map((source) => ({ ...source, status: source.kind === "dataset-record" ? "imported" : source.status ?? sourceStatus })),
      dataQuality: {
        unresolved: reviewStatus === "relevant" ? ["conditions détaillées, documents et étapes de dépôt à normaliser depuis le règlement officiel", "fenêtre de dépôt et validité annuelle à contrôler lorsque la page renvoie à un règlement", "ne pas publier tant que les contrôles existants de qualité et de procédure ne sont pas satisfaits"] : reviewStatus === "needs_manual_review" ? ["public bénéficiaire", "conditions", "période de validité", "montant", "pièces", "démarche", "nature exacte du bénéfice"] : [],
        publicationStatus: "not-published",
      },
      deduplication: duplicateOf ? { status: "duplicate-candidate", existingCatalogueId: duplicateOf.id, reason: "same normalized aid name, competent organization and territory" } : { status: "no-match-found" },
      importMetadata: { schema: schema.map((item) => item.name), datasetSourceUrl: sourceUrl ?? regionDataUrl, rawRecordHash: hash },
    };
    
  });
  await mkdir(path.dirname(outputPath), { recursive: true });
  const counts = Object.fromEntries(["relevant", "not_relevant", "expired", "needs_manual_review"].map((status) => [status, qualifications.filter((item) => item.classification.status === status).length]));
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  const generatedAt = report.startedAt ?? retrievedAt ?? checkedAt;
  await writeFile(outputPath, `${JSON.stringify({ generatedAt, source: regionDataUrl, sourceSnapshot: "src/data/imports/occitanie/raw/dataset.json", records: qualifications }, null, 2)}\n`, "utf8");
  const sourceRetrievedAt = report.startedAt ?? retrievedAt ?? generatedAt;
  report.qualification = {
    completedAt: generatedAt,
    sourceRecordsReviewed: qualifications.length,
    counts,
    newPublishedCards: 0,
    note: "No record is published from the imported qualification register. All relevant records still need their full current rule, documents and application path captured and checked before catalogue publication.",
    output: "src/data/imports/occitanie/normalized/qualifications.json",
  };
  const audit = JSON.parse(await readFile(path.join(root, "src/data/imports/geography/normalized/postal-duplicate-audit.json"), "utf8"));
  report.postalDuplicateAudit = audit;
  report.counts.postalDuplicateRowsBeyondFirstPerPair = audit.rowsBeyondFirstPerPair;
  report.counts.postalExactDuplicateRows = audit.identicalFullRowsRemoved;
  report.counts.occitaniePostalPairsWithMultipleRows = audit.occitaniePairsWithMultipleRows;
  report.counts.occitaniePostalRowsBeyondFirstPerPair = audit.occitanieRowsBeyondFirstPerPair;
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const registry = JSON.parse(await readFile(registryPath, "utf8"));
  const regionSource = registry.sources.find((item) => item.id === "region-occitanie-dataset");
  if (regionSource) Object.assign(regionSource, {
    status: "official-snapshot-imported-qualification-in-progress",
    version: `${report.counts.regionRecordsRetrieved} records captured ${sourceRetrievedAt}; live dataset revision not separately pinned`,
    license: "Licence Ouverte / Open Licence 2.0 (previously observed in source metadata; snapshot lacks license metadata)",
    retrievedAt: sourceRetrievedAt,
    recordsImported: report.counts.regionRecordsRetrieved,
    candidateRowsObserved: report.counts.regionRecordsRetrieved,
    candidateAidRowsObserved: qualifications.length,
    candidateAidRowsQualifiedRelevant: counts.relevant,
    candidateAidRowsExpired: counts.expired,
    candidateAidRowsExcluded: counts.not_relevant,
    candidateAidRowsPendingReview: counts.needs_manual_review,
    uniqueUsableAids: 0,
    endpointProbe: { consent: "accepted for the recorded import", metadataRetrieved: true, datasetRecordsRetrieved: report.counts.regionRecordsRetrieved, rawSnapshotWritten: true, networkCause: null },
    coverage: `${report.counts.regionRecordsRetrieved} official dataset records; ${qualifications.length} rows categorized Aides; ${report.counts.regionRecordsRetrieved - qualifications.length} other categories excluded from this aid qualification run`,
    limitations: ["Dataset has no beneficiary, eligibility, documents, application process or validity fields", `Qualification register has ${counts.relevant} relevant candidates, ${counts.not_relevant} confirmed non-relevant items, ${counts.expired} expired items and ${counts.needs_manual_review} manual reviews`, "No regional aid card is published until full current rules and application routes are normalized", "Live source page and dataset metadata need to be rechecked for updates and reuse terms"],
  });
  const postalSource = registry.sources.find((item) => item.id === "postal-codes");
  if (postalSource) Object.assign(postalSource, {
    status: "official-snapshot-imported-and-normalized",
    version: `Source updated ${audit.sourceDatasetLastUpdate}; fetched ${sourceRetrievedAt}`,
    retrievedAt: sourceRetrievedAt,
    recordsImported: report.counts.occitaniePostalRowsNormalized,
    uniqueUsableAids: 0,
    endpointProbe: { latestRefreshHttpStatus: 200, latestRefreshNetworkCause: null, encoding: audit.encoding, sourceRows: audit.totalRows, uniqueCommunePostalPairsFrance: audit.uniqueCommunePostalPairs, identicalFullRows: audit.identicalFullRowsRemoved, repeatedRowsForSharedPair: audit.rowsBeyondFirstPerPair, OccitaniePairsWithMultipleRows: audit.occitaniePairsWithMultipleRows, priorUserRun: null },
    coverage: "4,482 distinct Occitanie commune/postal-code pairs cross-checked against API Géo; 4,446 communes matched",
    limitations: ["Dataset last updated in 2023 and therefore needs freshness monitoring", "Repeated INSEE/postal pairs are not exact duplicate rows; preserve alternative delivery labels and Ligne_5 values", "Postal relation supports geographic routing only and does not itself establish a programme's legal territory"],
  });
  const geoSource = registry.sources.find((item) => item.id === "api-geo");
  if (geoSource) Object.assign(geoSource, { version: `Snapshot retrieved ${report.geography.sourceRetrievedAt ?? sourceRetrievedAt}`, retrievedAt: report.geography.sourceRetrievedAt ?? sourceRetrievedAt, recordsImported: report.geography.communeCount, postalMappingsImported: report.geography.geoPostalMappingCount, status: "official-snapshot-imported-and-normalized", endpointProbe: { latestRefreshHttpStatus: 200, latestRefreshNetworkCause: null, departments: report.geography.departmentCount, communes: report.geography.communeCount, postalMappings: report.geography.geoPostalMappingCount } });
  const regionCatalogue = registry.sources.find((item) => item.id === "region-official-catalogue");
  const pagesReviewed = qualifications.filter((item) => item.classification.status !== "needs_manual_review").length;
  const pagesRetrievedAt = officialPageDecisions.reduce((latest, item) => item.consultedAt > latest ? item.consultedAt : latest, "");
  if (regionCatalogue) Object.assign(regionCatalogue, { status: "official-pages-reviewed-for-relevance", retrievedAt: pagesRetrievedAt || checkedAt, pagesReviewed, relevantCandidates: counts.relevant, confirmedNonRelevant: counts.not_relevant, expired: counts.expired, pendingManualReview: counts.needs_manual_review, uniqueUsableAids: 0, limitations: [`Relevance review covers ${pagesReviewed} of ${qualifications.length} aid records; this is not legal or regulatory validation`, "No complete individual application journey has yet been normalized into a publishable aid card", "All relevant candidates still require current eligibility, validity, document and application-process checks before publication"] });
  registry.auditedAt = checkedAt;
  await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
  return { qualifications, counts, outputPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await qualifyOccitanieRecords();
  console.log(JSON.stringify({ total: result.qualifications.length, counts: result.counts, published: result.qualifications.filter((item) => item.dataQuality.publicationStatus === "published").length, importedNew: result.qualifications.filter((item) => item.classification.status === "relevant" && item.deduplication.status === "no-match-found").length }, null, 2));
}
