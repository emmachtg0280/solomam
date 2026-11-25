import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (name) => path.join(root, name);
const read = async (name) => JSON.parse(await readFile(json(name), "utf8"));
const write = async (name, value) => writeFile(json(name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const checked = "2026-11-23";
const catalogue = await read("src/data/catalogue.json");
const review = await read("src/data/review.json");
const geography = await read("src/data/imports/geography/normalized/communes-occitanie.json");
const epciCode = "243400017";
const metroCommunes = geography.filter((commune) => commune.epciCode === epciCode && commune.departmentCode === "34");
if (metroCommunes.length !== 31 || metroCommunes.some((commune) => !/^34\d{3}$/.test(commune.inseeCode))) throw new Error(`Expected 31 Hérault communes for EPCI ${epciCode}, got ${metroCommunes.length}`);
await mkdir(json("src/data/territories"), { recursive: true });
await write("src/data/territories/montpellier-metropole.json", {
  territoryId: "montpellier-mediterranee-metropole",
  organization: "Montpellier Méditerranée Métropole",
  epciCode,
  departmentCode: "34",
  communes: metroCommunes.map(({ inseeCode, communeName }) => ({ inseeCode, communeName })).sort((a, b) => a.inseeCode.localeCompare(b.inseeCode)),
  source: { url: "https://geo.api.gouv.fr/communes?codeEpci=243400017&fields=nom,code,codeDepartement,codeEpci&format=json", dataset: "src/data/imports/geography/normalized/communes-occitanie.json", importedAt: "2026-11-24T00:53:03.529Z", consultedAt: checked },
  legalScopeSource: "https://www.montpellier.fr/actions/competences/acces-au-logement/fonds-de-solidarite-pour-le-logement",
});

const sources = {
  deptPage: { id: "fsl-herault-page", label: "Département de l'Hérault — aides financières au logement", url: "https://herault.fr/402-aide-financiere.htm", kind: "official-guidance", consultedAt: checked, pageVerifiedAt: checked },
  deptReg: { id: "fsl-herault-rdas-2026", label: "Département de l'Hérault — règlement départemental d'aide sociale, édition septembre 2026", url: "https://bessilles.herault.fr/cms_viewFile.php?idtf=30205&path=RDAS-09-2026.pdf", kind: "legal-text", consultedAt: checked, pageVerifiedAt: checked },
  metroPage: { id: "fsl-m3m-page", label: "Montpellier Méditerranée Métropole — Fonds de solidarité pour le logement", url: "https://www.montpellier.fr/actions/competences/acces-au-logement/fonds-de-solidarite-pour-le-logement", kind: "official-guidance", consultedAt: checked, pageVerifiedAt: checked },
  metroReg: { id: "fsl-m3m-regulation-2025", label: "Montpellier Méditerranée Métropole — règlement intérieur FSL 2025", url: "https://www.montpellier.fr/sites/default/files/2025-11/20250101%20R%C3%A8glement%20int%C3%A9rieur_FSL%203M.pdf", kind: "legal-text", consultedAt: checked, pageVerifiedAt: checked },
};
const definitions = [
  {
    id: "fsl", name: "Fonds de solidarité pour le logement — Hérault hors Métropole", organization: "Conseil départemental de l'Hérault", officialUrl: sources.deptPage.url,
    territory: "Hérault hors des 31 communes de Montpellier Méditerranée Métropole.",
    audience: "Habitants rencontrant des difficultés d'accès ou de maintien dans un logement décent et relevant du public défini par le PDALHPD. La demande est examinée au regard des ressources et de la situation du foyer.",
    conditions: "Le règlement départemental en vigueur renvoie à un barème lié aux plafonds de la Complémentaire santé solidaire, selon la composition du foyer. Les ressources sont examinées sur les trois mois précédant la demande et, en cas de changement, selon les ressources prévisionnelles; un niveau de ressources doit permettre d'assumer le loyer et les charges. Aucune intervention si le foyer n'a aucune ressource. Aucun montant-plafond n'est repris ici.",
    needs: "Accès au logement (dépôt de garantie, frais d'agence, premier loyer, assurance habitation, frais associés et ouverture de compteurs); maintien dans le logement (loyers/charges, frais de procédure, énergie et eau); accompagnement social lié au logement.",
    sourceIds: [sources.deptPage.id, sources.deptReg.id],
    currentPeriod: "Règlement départemental d'aide sociale, édition septembre 2026; règle FSL adoptée le 16 décembre 2024 et applicable depuis le 1er janvier 2025.",
    documents: "Le dossier est constitué par un travailleur social d'un service habilité. Les pièces sont déterminées par l'aide demandée; le règlement prévoit notamment la vérification de l'identité, des ressources, des charges et de la situation du foyer. La liste détaillée par aide reste à consulter dans le formulaire applicable.",
    steps: [{ text: "Contacter un travailleur social d'un service habilité, qui construit et transmet la demande FSL.", sourceIds: [sources.deptReg.id], status: "verified" }, { text: "Le dossier est examiné selon le règlement; la décision est adressée au demandeur et à l'instructeur.", sourceIds: [sources.deptReg.id], status: "verified" }],
    remaining: ["Confirmer le formulaire actuellement utilisé et les justificatifs précis selon la nature de l'aide.", "Confirmer les coordonnées de l'équipe d'instruction, les délais et le suivi du dossier."],
  },
  {
    id: "fsl-m3m", name: "Fonds de solidarité pour le logement — Montpellier Méditerranée Métropole", organization: "Montpellier Méditerranée Métropole", officialUrl: sources.metroPage.url,
    territory: "Les 31 communes de Montpellier Méditerranée Métropole (EPCI 243400017), identifiées par leur code INSEE dans le référentiel géographique officiel importé.",
    audience: "Demandeurs majeurs ou mineurs émancipés résidant dans la Métropole, relevant du public du PDALHPD et satisfaisant aux critères du règlement. Les étudiants sans enfant à charge sont exclus; une personne étrangère doit être en situation administrative régulière. Priorité notamment aux personnes sans logement, menacées d'expulsion sans relogement ou en situation économique et sociale cumulée.",
    conditions: "Le foyer doit disposer de ressources suffisantes pour faire face au loyer et aux charges; l'absence totale de ressources exclut l'intervention. Les ressources de toutes les personnes du foyer sont prises en compte, avec des exceptions listées dans le règlement. Le calcul tient compte des ressources des trois mois précédant la demande et des ressources à venir en cas de changement. Le règlement 2025 cite l'ancien seuil ACS; il n'est pas présenté comme un plafond actuel sans confirmation de sa mise à jour.",
    needs: "Aides à l'accès et au maintien dans le logement selon le règlement. Le dossier est construit avec un travailleur social habilité à partir des justificatifs propres à l'aide demandée; identité, ressources, charges et situation sont contrôlées.",
    sourceIds: [sources.metroPage.id, sources.metroReg.id, sources.deptPage.id],
    currentPeriod: "Règlement intérieur métropolitain 2025 affiché par la Métropole; aucune date de fin n'est indiquée dans le document consulté. En vigueur au contrôle du 23 novembre 2026 selon la page officielle du service.",
    documents: "Demande au moyen de l'imprimé métropolitain FSL, accompagnée des justificatifs relatifs à l'aide sollicitée. Le travailleur social vérifie l'état civil, les ressources, les charges et la situation particulière; la liste documentaire dépend du besoin.",
    steps: [{ text: "S'adresser à un travailleur social d'un service instructeur habilité par la Métropole ou le Département.", sourceIds: [sources.metroReg.id], status: "verified" }, { text: "Le travailleur social constitue le formulaire métropolitain et joint les justificatifs de l'aide demandée.", sourceIds: [sources.metroReg.id], status: "verified" }, { text: "Le dossier transmis est instruit et soumis à la décision de l'instance compétente; la page de la Métropole décrit l'examen par une équipe pluridisciplinaire.", sourceIds: [sources.metroPage.id, sources.metroReg.id], status: "verified" }],
    remaining: ["Le règlement mentionne encore le seuil ACS; demander à la Métropole la référence de ressources actuelle avant de reprendre un seuil chiffré.", "Confirmer les coordonnées de l'équipe d'instruction, les délais et les modalités de suivi après dépôt."],
  },
];

for (const item of definitions) {
  const record = catalogue.find((aid) => aid.id === item.id);
  if (!record) throw new Error(`Missing canonical record ${item.id}`);
  Object.assign(record, { name: item.name, org: item.organization, url: item.officialUrl, when: item.audience, description: item.needs, steps: item.steps.map((step) => step.text) });
  const old = review[item.id] ?? {};
  const facts = [
    { field: "current_status", status: "verified", value: `Dispositif en vigueur au contrôle du ${checked}; ${item.currentPeriod}`, sourceIds: item.sourceIds, validFor: item.currentPeriod },
    { field: "territory", status: "verified", value: item.territory, sourceIds: item.sourceIds, validFor: item.currentPeriod },
    { field: "audience", status: "verified", value: item.audience, sourceIds: item.sourceIds, validFor: item.currentPeriod },
    { field: "core_conditions", status: "verified", value: item.conditions, sourceIds: item.sourceIds, validFor: item.currentPeriod },
    { field: "eligible_needs", status: "verified", value: item.needs, sourceIds: item.sourceIds, validFor: item.currentPeriod },
    { field: "documents", status: "partially_verified", value: item.documents, sourceIds: item.sourceIds, validFor: item.currentPeriod },
  ];
  review[item.id] = {
    ...old,
    informationPublicationStatus: "verified",
    informationVerifiedAt: checked,
    publicationStatus: "published",
    procedurePublicationStatus: "pending",
    currentForPeriod: item.currentPeriod,
    eligibilityRulesReady: false,
    testCases: 0,
    facts,
    factSources: Object.values(sources),
    applicationProcedure: {
      status: "partially_complete", steps: item.steps,
      documents: { status: "verified", sourceIds: item.sourceIds },
      followUp: { status: "unverified", text: "Modalités de suivi à confirmer auprès du service instructeur.", sourceIds: item.sourceIds },
      renewal: { status: "unverified", text: "Renouvellement selon la nature de l'aide; modalités à confirmer.", sourceIds: item.sourceIds },
      portalUrl: null, competentOrganization: item.organization, remainingChecks: item.remaining,
    },
    notes: [...new Set([...(old.notes ?? []).filter((note) => !note.startsWith("Fiche d'information publiée")), "Fiche d'information publiée après vérification de la règle actuelle, du territoire et du public; parcours de demande encore partiel."])],
    sources: old.sources ?? [],
  };
}
await write("src/data/catalogue.json", catalogue);
await write("src/data/review.json", review);
const registry = await read("src/data/source-registry.json");
const uniqueSources = [...new Map(registry.sources.map((source) => [source.id, source])).values()];
const upsertSource = (source) => {
  const index = uniqueSources.findIndex((item) => item.id === source.id);
  if (index < 0) uniqueSources.push(source); else uniqueSources[index] = { ...uniqueSources[index], ...source };
};
upsertSource({ id: "fsl-herault", name: "Département de l'Hérault — FSL", url: sources.deptPage.url, role: "FSL départemental, règlement d'action sociale et parcours d'instruction", status: "current-regulation-reviewed-information-published-procedure-partial", version: "RDAS édition septembre 2026; règles FSL applicables depuis le 1er janvier 2025", license: "Aucun dataset copié; faits attribués aux sources officielles", retrievedAt: checked, recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 1, coverage: "Hérault hors des 31 communes de Montpellier Méditerranée Métropole", limitations: ["Les justificatifs détaillés varient par aide et formulaire; délais, suivi et contacts d'instruction restent à confirmer."] });
upsertSource({ id: "fsl-montpellier-metropole", name: "Montpellier Méditerranée Métropole — FSL", url: sources.metroPage.url, role: "FSL métropolitain, règlement 2025, critères et instruction", status: "current-regulation-reviewed-information-published-procedure-partial", version: "Règlement intérieur FSL 2025, listé sur la page officielle et consulté le 23 novembre 2026", license: "Aucun dataset copié; faits attribués aux sources officielles", retrievedAt: checked, recordsImported: 0, candidateRecordsIntegrated: 1, factsEnrichedForAids: 1, publishableRecords: 1, coverage: "31 communes de Montpellier Méditerranée Métropole (EPCI 243400017)", limitations: ["Le règlement cite encore l'ancien seuil ACS; aucun seuil chiffré actuel n'est repris avant confirmation. Délais et suivi restent à confirmer."] });
upsertSource({ id: "herault-family-services", name: "Services départementaux aux familles de l'Hérault", url: "https://herault.fr/2135-maisons-des-1000-jours.htm", role: "Maisons des 1000 jours, LAEP et Centres de santé sexuelle", status: "official-service-pages-reviewed-services-published", version: "Pages officielles consultées le 23 novembre 2026", license: "Pas de copie de contenu tiers; descriptions factuelles avec attribution et URL", retrievedAt: checked, recordsImported: 0, uniqueUsableServices: 3, limitations: ["Les horaires, disponibilités, accès sans rendez-vous et mise à jour des annuaires locaux sont à confirmer auprès de chaque structure."] });
upsertSource({ id: "parents-solos-platform", name: "Parents Solos — plateforme privée", url: "https://www.parents-solos.com/conditions-utilisation/", role: "Vérification de l'éditeur, de l'accès et de la tarification déclarée", status: "private-service-terms-reviewed-service-published", version: "Conditions affichant une mise à jour au 15 novembre 2026; consultées le 23 novembre 2026", license: "Aucun contenu éditorial reproduit; informations factuelles attribuées", retrievedAt: checked, recordsImported: 0, uniqueUsableServices: 1, limitations: ["La disponibilité de membres locaux n'est pas garantie; le service n'est ni une aide sociale, ni un partenariat ou une recommandation de Solomam."] });
registry.sources = uniqueSources;
registry.auditedAt = checked;
await write("src/data/source-registry.json", registry);
console.log(JSON.stringify({ fslInformationVerified: definitions.map(({ id }) => id), metroCommunes: metroCommunes.length, metroInseeCodes: metroCommunes.map((item) => item.inseeCode).sort() }, null, 2));
