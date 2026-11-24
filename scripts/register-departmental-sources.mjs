import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registryPath = path.join(root, "src/data/source-registry.json");
const coveragePath = path.join(root, "src/data/coverage-matrix.json");
const checkedAt = "2026-11-23";

const departments = [
  ["09", "Ariège", "ariege.fr", "ariege"], ["11", "Aude", "aude.fr", "aude"],
  ["12", "Aveyron", "aveyron.fr", "aveyron"], ["30", "Gard", "gard.fr", "du-gard"],
  ["31", "Haute-Garonne", "haute-garonne.fr", "haute-garonne"], ["32", "Gers", "gers.fr", "du-gers"],
  ["34", "Hérault", "herault.fr", "de-l-herault"], ["46", "Lot", "lot.fr", "du-lot"],
  ["48", "Lozère", "lozere.fr", "de-la-lozere"], ["65", "Hautes-Pyrénées", "hautespyrenees.fr", "des-hautes-pyrenees"],
  ["66", "Pyrénées-Orientales", "ledepartement66.fr", "des-pyrenees-orientales"], ["81", "Tarn", "tarn.fr", "du-tarn"],
  ["82", "Tarn-et-Garonne", "tarnetgaronne.fr", "de-tarn-et-garonne"],
];

function discoverySource(department, organization, url, role) {
  return {
    id: `territory-${department[0]}-${organization}`,
    name: `${organization === "council" ? "Conseil départemental" : "Caf"} — ${department[1]}`,
    url,
    role,
    territory: { departmentCode: department[0], label: department[1] },
    sourceType: "html-directory",
    updateFrequency: "Non documentée; contrôler les publications et règlements chaque année",
    termsOfUse: "Aucune collecte de masse prévue; examiner les mentions légales et conditions propres aux exports avant réutilisation",
    status: "identified-discovery-only",
    accessibility: "URL officielle candidate; disponibilité et profondeur des pages non testées dans cette passe",
    lastCollection: null,
    coverage: "Point de découverte uniquement. Une page d'accueil ou de territoire ne suffit pas à vérifier les critères d'une aide.",
    retrievedAt: checkedAt,
    recordsImported: 0,
    uniqueUsableAids: 0,
    limitations: ["Identifier puis enregistrer les pages détaillées, règlements, formulaires et dates de mise à jour avant toute qualification.", "Ne pas dupliquer les prestations nationales par département.", "L'URL de découverte CAF est à confirmer sur le portail officiel local."],
  };
}

const sources = [];
for (const department of departments) {
  sources.push(discoverySource(department, "council", `https://www.${department[2]}/`, "Point de découverte des aides sociales locales, règlements départementaux, FSL et services familiaux."));
  sources.push(discoverySource(department, "caf", `https://www.caf.fr/allocataires/caf-${department[3]}`, "Point de découverte des aides d'action sociale locales de la Caf."));
}
const h34 = [
  ["caf-herault-individual-aid-page", "Caf de l'Hérault — Secours et prêts sociaux", "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/accident-de-vie/les-secours-et-prets-sociaux", "html-page", "Aides exceptionnelles aux familles allocataires avec enfant à charge ou à naître; détail et montants renvoyés au RIAS 2026.", "page accessible via indexation; RIAS lié renvoie une page de maintenance lors de l'extraction"],
  ["caf-herault-rias-2026", "Caf de l'Hérault — RIAS aides financières individuelles 2026", "https://www.caf.fr/sites/default/files/medias/348/partenaires/Rias/RIAS-2026-maj-AVE-Web.pdf", "pdf", "Règlement local annuel des aides individuelles et collectives.", "URL liée depuis la page officielle; l'extraction renvoie une page de maintenance, contenu non vérifié"],
  ["herault-rdas-2026", "Département de l'Hérault — Règlement départemental d'aide sociale 2026", "https://mda.herault.fr/cms_viewFilePublication.php?id=668", "pdf", "RDAS, AFIE et FSL départemental; document PDF indexé et extractible.", "Accessible et extrait par indexation web; vérifier le fichier daté et ses annexes avant reprise des barèmes"],
  ["herault-fsl-overview", "Département de l'Hérault — Aides financières au logement", "https://herault.fr/402-aide-financiere.htm", "html-page", "FSL, séparation de périmètre des 31 communes de la Métropole, accompagnement social lié au logement.", "Page HTML accessible"],
  ["montpellier-ccas-rights", "CCAS de Montpellier — Accès aux droits et aides facultatives", "https://www.montpellier.fr/vie-quotidienne/vivre-ici/j-ai-besoin-d-accompagnement/j-ai-besoin-de-connaitre-mes-droits", "html-page", "Conditions d'orientation et d'accès aux aides facultatives accompagnées par un travailleur social.", "Page officielle indexée; collecte structurée non exécutée"],
  ["montpellier-bouclier-page", "Ville de Montpellier — Bouclier social petite enfance", "https://www.montpellier.fr/vie-quotidienne/vivre-ici/j-ai-un-enfant-entre-0-et-3-ans/je-recherche-un-mode-d-accueil/bouclier-social-petite-enfance", "html-page", "Aide municipale de garde atypique pour familles monoparentales; critères et actualité à vérifier.", "Indexée; ouverture directe temporairement renvoyée en erreur 405 dans cette passe"],
  ["montpellier-bouclier-regulation-2025", "Ville de Montpellier — Règlement d'attribution Bouclier social petite enfance", "https://www.montpellier.fr/sites/default/files/2025-04/R%C3%A8glement%20d%27attribution%202025.pdf", "pdf", "Conditions détaillées et calcul de participation municipale; version 2025, validité actuelle à confirmer.", "PDF indexé; règles 2025 extraites, version 2026 non trouvée dans cette passe"],
  ["frontignan-ccas", "CCAS de Frontignan — coordonnées et accueil", "https://www.frontignan.fr/lieu/centre-communal-daction-sociale/", "html-directory", "Point de contact pour rechercher les aides et services locaux; conditions d'aides non détaillées sur cette page.", "Page officielle indexée; collecte structurée non exécutée"],
  ["sete-ccas-discovery", "Ville de Sète — point de découverte CCAS", "https://www.sete.fr/", "html-directory", "URL de découverte seulement; retrouver la page officielle du CCAS et ses aides avant toute qualification.", "URL de portail candidate; disponibilité et page détaillée non testées"],
  ["beziers-ccas-social", "Ville de Béziers — Accompagnement social / CCAS", "https://www.ville-beziers.fr/jhabite-a-beziers/solidarites/actions-sociales", "html-page", "Accueil, aides facultatives et orientation sociale; aide Donnant-Donnant citée dans une délibération ancienne à revalider.", "Page officielle indexée; détails réglementaires des aides facultatives non vérifiés"],
];
for (const [id, name, url, sourceType, role, accessibility] of h34) {
  sources.push({ id, name, url, role, territory: { departmentCode: "34", label: "Hérault" }, sourceType, updateFrequency: sourceType === "pdf" ? "Annuel ou à chaque délibération; version en vigueur à contrôler" : "Non documentée; contrôler la page et les liens associés", termsOfUse: "Pas de jeu de données importé; faits courts à attribuer aux sources. Vérifier les mentions et conditions avant toute réutilisation." , status: "identified-page-review-required", accessibility, lastCollection: null, retrievedAt: checkedAt, recordsImported: 0, uniqueUsableAids: 0, coverage: role, limitations: ["Cette entrée documente une source à examiner; elle ne vaut pas qualification ni publication d'une aide."] });
}
sources.push(
  { id: "adhl-gard-fsl-access", name: "ADHL Gard — FSL volet Accès", url: "https://adhl.gard.fr/acceder-a-un-logement/le-fonds-solidarite-logement-fsl-volet-acces.html", role: "Conditions, dépenses d'accès couvertes, instruction et orientation sociale du FSL Gard.", territory: { departmentCode: "30", label: "Gard" }, sourceType: "html-page", updateFrequency: "Page continue; le barème de ressources est actualisé séparément", termsOfUse: "Pas de jeu de données importé; faits courts attribués à l'ADHL et au Département.", status: "official-page-reviewed", accessibility: "Page officielle accessible et examinée; volet Accès seulement", lastCollection: checkedAt, retrievedAt: checkedAt, recordsImported: 0, uniqueUsableAids: 0, coverage: "FSL Gard — accès au logement; ne couvre pas le maintien ni les charges.", limitations: ["Règlement complet, délais et liste exhaustive des pièces à examiner."] },
  { id: "adhl-gard-fsl-scale-2026", name: "ADHL Gard — barèmes FSL au 1er avril 2026", url: "https://adhl.gard.fr/acceder-a-un-logement/le-fonds-solidarite-logement-fsl-volet-acces/baremes-fsl.html", role: "Plafonds de ressources FSL selon la composition du ménage.", territory: { departmentCode: "30", label: "Gard" }, sourceType: "html-page", updateFrequency: "Mise à jour périodique; version affichée du 1er avril 2026", termsOfUse: "Pas de jeu de données importé; montants attribués à la source officielle.", status: "official-page-reviewed", accessibility: "Page officielle accessible et examinée", lastCollection: checkedAt, retrievedAt: checkedAt, recordsImported: 0, uniqueUsableAids: 0, coverage: "Barèmes de ressources; les ressources autorisant une demande ne garantissent pas l'octroi.", limitations: ["Recontrôler le barème lors de toute actualisation de source."] },
);
sources.push({ id: "ariege-rdas-pdf", name: "Département de l'Ariège — Règlement départemental d'aide sociale", url: "https://ariege.fr/app/uploads/2026/03/RDAS-2026.pdf", role: "Document-cadre avec fiche FSL/Fonds unique habitat (accès, maintien, énergie, eau, télécommunications). Le document précise une adoption en 2022; la version en vigueur doit être confirmée.", territory: { departmentCode: "09", label: "Ariège" }, sourceType: "pdf", updateFrequency: "À contrôler à chaque publication ou délibération; date affichée du fichier ne suffit pas à établir la date d'entrée en vigueur", termsOfUse: "Pas de téléchargement massif; source officielle consultée pour examen individuel.", status: "official-source-current-version-unconfirmed", accessibility: "PDF officiel accessible et indexé; couvre plusieurs prestations, règlement intérieur du FUH courant non vérifié", lastCollection: checkedAt, retrievedAt: checkedAt, recordsImported: 0, uniqueUsableAids: 0, coverage: "Règlement départemental large; FSL/FUH identifié, aucun candidat intégré avant confirmation de la version en vigueur.", limitations: ["Le préambule indique adoption le 14 mars 2022 malgré le nom de fichier 2026.", "Vérifier le règlement intérieur FUH courant et son barème avant qualification/publication."] });

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const byId = new Map(registry.sources.map((item) => [item.id, item]));
for (const source of sources) byId.set(source.id, { ...source, ...(byId.get(source.id) ?? {}) });
registry.sources = [...byId.values()];
registry.auditedAt = checkedAt;
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");

const coverage = JSON.parse(await readFile(coveragePath, "utf8"));
coverage.checkedAt = checkedAt;
const discoveryScopeNote = "Le registre départemental fournit des points de découverte; les URLs non contrôlées ne sont pas réputées accessibles et aucun territoire sans collecte détaillée n'est marqué examiné.";
if (!coverage.scopeNote.includes(discoveryScopeNote)) coverage.scopeNote = `${coverage.scopeNote} ${discoveryScopeNote}`;
for (const department of departments) {
  const row = coverage.territories.find((item) => item.id === department[0]);
  if (!row) continue;
  const discoveryLabels = [`Conseil départemental ${department[1]} (découverte)`, `Caf ${department[1]} (découverte)`];
  if (department[0] === "34") {
    row.sources = [...new Set([...(row.sources ?? []), ...discoveryLabels])];
  } else {
    row.sources = discoveryLabels;
    row.notes = "Points de découverte inscrits au registre; aucun règlement ou dispositif local n'a été vérifié dans cette passe.";
    row.status = "identified";
    row.checkedAt = checkedAt;
  }
}
const gard = coverage.territories.find((item) => item.id === "30");
if (gard) {
  gard.status = "partially_integrated";
  gard.types = ["aide_financiere"];
  gard.categories = ["Logement"];
  gard.verifiedPublishedAidCount = 1;
  gard.sources = [...new Set([...gard.sources, "ADHL Gard — FSL Accès", "ADHL Gard — Barèmes au 1er avril 2026"])];
  gard.notes = "Un volet du FSL Gard (accès au logement) est vérifié et intégré avec information publiée; procédure complète et autres volets non examinés.";
}
const ariege = coverage.territories.find((item) => item.id === "09");
if (ariege) {
  ariege.sources = [...new Set([...(ariege.sources ?? []), "Département Ariège — RDAS/FUH (PDF; version courante à confirmer)"])];
  ariege.notes = "RDAS officiel consulté; il décrit le FSL/FUH mais indique une adoption en 2022, le fichier porte un chemin 2026. Confirmer la version en vigueur et le règlement intérieur FUH; aucune aide intégrée.";
}
const herault = coverage.territories.find((item) => item.id === "34");
if (herault) {
  herault.status = "partially_integrated";
  herault.types = ["aide_financiere", "service_accompagnement", "ressource_structure"];
  herault.categories = ["Logement", "Parentalité", "Santé & bien-être"];
  herault.verifiedPublishedAidCount = 3;
  herault.verifiedPublishedServiceCount = 3;
  herault.sources = [...new Set([...(herault.sources ?? []), "Département de l'Hérault RDAS septembre 2026", "Règlement FSL M3M 2025", "CAF Hérault", "Pages de services du Département", "Caf Hérault — page secours/prêts", "Caf Hérault — RIAS 2026 (extraction bloquée)", "RDAS Hérault 2026 — AFIE/FSL", "CCAS Montpellier — aides facultatives", "Ville Montpellier — Bouclier social (règlement 2025)", "CCAS Frontignan", "CCAS Sète (point de découverte)", "CCAS Béziers"])];
  herault.notes = "FSL départemental et métropolitain distincts, plus services familiaux départementaux. AFIE Hérault intégrée avec information publiée, montant et procédure encore partiels. Page Caf secours/prêts examinée; extraction du RIAS 2026 bloquée par page de maintenance. Bouclier petite enfance Montpellier documenté par règlement 2025 mais statut/campagne 2026 à confirmer; non publié.";
}
await writeFile(coveragePath, `${JSON.stringify(coverage, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ departmentalSourcesRegistered: sources.length, departments: departments.length, heraultSpecificSources: h34.length }, null, 2));
