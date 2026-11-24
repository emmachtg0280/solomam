import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name) => JSON.parse(await readFile(path.join(root, name), "utf8"));
const write = async (name, value) => writeFile(path.join(root, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const checkedAt = "2026-11-24";
const canonicalId = "occ-la-mobilite-internationale-des-etudiants-avec-mouv-occitanie";
const duplicateId = "occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale";
const pageUrl = "https://www.laregion.fr/Aides-Mouv-Occitanie";
const portalUrl = "https://mesaidesenligne.laregion.fr";
const catalogue = await read("src/data/catalogue.json");
const review = await read("src/data/review.json");
const registry = await read("src/data/source-registry.json");
const aid = catalogue.find((item) => item.id === canonicalId);
if (!aid) throw new Error(`Missing canonical Mouv’Occitanie record: ${canonicalId}`);

aid.name = "Aides à la mobilité internationale — Mouv’Occitanie";
aid.description = "Aides de la Région pour certains séjours d’études ou stages à l’étranger intégrés à une formation en Occitanie. Selon le dispositif, le soutien peut inclure une bourse de 75 € par semaine ou des aides forfaitaires; sélection par l’établissement, critères propres à chaque aide et budget annuel.";
aid.when = "Étudiants inscrits dans un établissement partenaire d’Occitanie et réalisant une mobilité d’études ou de stage à l’étranger valorisée dans leur diplôme. Les critères de durée, de ressources, de formation et de destination dépendent de l’aide; une sélection par l’établissement est requise.";
aid.steps = [
  "Demander au bureau des relations internationales de son établissement les critères et la procédure de sélection.",
  "Après sélection, déposer les justificatifs demandés sur le Portail des Aides à l’aide du lien personnel reçu par courriel, dans le délai indiqué par la Région.",
];
aid.url = pageUrl;

const sourceId = "mouv-occitanie-official-guidance-2026";
const source = {
  id: sourceId,
  label: "Région Occitanie — Aides à la mobilité internationale Mouv’Occitanie",
  url: pageUrl,
  kind: "official-guidance",
  consultedAt: checkedAt,
  pageVerifiedAt: checkedAt,
};
review[canonicalId] = {
  ...review[canonicalId],
  informationPublicationStatus: "verified",
  informationVerifiedAt: checkedAt,
  publicationStatus: "published",
  procedurePublicationStatus: "pending",
  reviewedAt: checkedAt,
  currentForPeriod: "Page officielle consultée le 2026-11-24; campagnes et budget renouvelés annuellement, critères variables selon l’aide.",
  facts: [
    { field: "current_status", status: "verified", value: "La Région décrit les aides Mouv’Occitanie comme un dispositif actif; sélection des établissements et budget réexaminés annuellement.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24; campagne et enveloppe à confirmer pour chaque établissement." },
    { field: "territory", status: "verified", value: "Région Occitanie, pour les étudiants des établissements partenaires de la Région.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24." },
    { field: "audience", status: "verified", value: "Étudiants inscrits dans un établissement partenaire et préparant un diplôme en Occitanie; certaines aides couvrent les formations sanitaires et sociales. Mobilité d’études ou stage à l’étranger intégrée au cursus.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24; formations et exceptions propres à chaque aide." },
    { field: "core_conditions", status: "verified", value: "La mobilité doit être valorisée dans la préparation d’un diplôme en Occitanie et l’étudiant doit être sélectionné par son établissement; durées minimales, ressources, formation et destination varient selon le dispositif. Une sélection ne garantit pas l’attribution, qui dépend aussi des critères régionaux et du budget annuel.", sourceIds: [sourceId], validFor: "Page officielle consultée le 2026-11-24; consulter le règlement pour l’aide précise." },
    { field: "amount", status: "verified", value: "Selon l’aide: bourse d’études ou de stage de 75 € par semaine à partir de quatre semaines pleines (plafonds selon la durée du cursus), ou chèques forfaitaires de 600 € pour certaines destinations et situations. Les montants ne s’appliquent pas à tous les étudiants.", sourceIds: [sourceId], validFor: "Barème affiché sur la page officielle consultée le 2026-11-24; montant selon aide, formation et destination." },
  ],
  sources: [],
  factSources: [source],
  applicationProcedure: {
    status: "partially_complete",
    steps: [
      { text: "Contacter le bureau des relations internationales de l’établissement pour connaître les critères et candidater à sa sélection.", sourceIds: [sourceId], status: "verified" },
      { text: "Après sélection par l’établissement, utiliser le lien personnel transmis par la Région et déposer les justificatifs sur son Portail des Aides dans le délai communiqué.", sourceIds: [sourceId], status: "verified" },
      { text: "La Région notifie individuellement sa décision; si l’aide est attribuée, le versement prévu se fait en deux temps, avec une demande de solde après la mobilité.", sourceIds: [sourceId], status: "verified_conditional" },
    ],
    documents: { status: "partially_verified", text: "Les pièces varient selon l’aide et la mobilité; la page officielle liste les justificatifs requis après sélection.", sourceIds: [sourceId] },
    followUp: { status: "verified", text: "Suivre les demandes et la remise des pièces sur le Portail des Aides; contacter le bureau des relations internationales pour la sélection.", sourceIds: [sourceId] },
    renewal: { status: "not_applicable_or_not_stated", text: "Les campagnes et budgets sont annuels; nouvelle candidature selon l’établissement et l’année universitaire.", sourceIds: [sourceId] },
    portalUrl,
    competentOrganization: "Région Occitanie; la sélection initiale est assurée par le bureau des relations internationales de l’établissement partenaire.",
    remainingChecks: ["Vérifier le règlement et les montants correspondant au cursus, à la destination et à l’année universitaire de la demande."],
  },
  notes: ["Fiche d’information publiée après vérification des critères essentiels sur la page officielle; montant et sélection dépendent de l’aide et de la campagne annuelle.", "La fiche synthétise plusieurs aides Mouv’Occitanie; elle ne confirme pas l’éligibilité individuelle ni l’attribution."],
};

const duplicate = catalogue.find((item) => item.id === duplicateId);
if (duplicate) {
  review[duplicateId] = {
    ...review[duplicateId],
    informationPublicationStatus: "pending",
    informationVerifiedAt: null,
    publicationStatus: "pending",
    recordLifecycle: "duplicate",
    duplicateOf: canonicalId,
    notes: [...new Set([...(review[duplicateId]?.notes ?? []), `Cette entrée est un doublon de ${canonicalId}; les informations vérifiées sont regroupées dans la fiche canonique.`])],
  };
}

const registrySource = {
  id: sourceId,
  name: source.label,
  url: source.url,
  role: "Conditions, bénéficiaires, aides financières et parcours Mouv’Occitanie",
  status: "official-guidance-reviewed-current-2026-11-24",
  retrievedAt: checkedAt,
  recordsImported: 0,
  candidateRecordsIntegrated: 1,
  license: "Faits synthétisés avec attribution; aucun contenu intégral reproduit",
  coverage: "Région Occitanie; établissements partenaires",
  limitations: ["Les conditions et montants diffèrent entre les aides; sélection par établissement et enveloppe budgétaire annuelles."],
};
const registryIndex = registry.sources.findIndex((item) => item.id === sourceId);
if (registryIndex < 0) registry.sources.push(registrySource);
else registry.sources[registryIndex] = registrySource;

await write("src/data/catalogue.json", catalogue);
await write("src/data/review.json", review);
await write("src/data/source-registry.json", registry);
console.log(JSON.stringify({ canonicalId, informationStatus: review[canonicalId].informationPublicationStatus, duplicateId, sourceId }, null, 2));
