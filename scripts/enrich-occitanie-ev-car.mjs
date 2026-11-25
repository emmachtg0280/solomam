import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => readFile(path.join(root, name), "utf8").then(JSON.parse);
const write = (name, data) => writeFile(path.join(root, name), `${JSON.stringify(data, null, 2)}\n`, "utf8");
const [catalogue, review, registry] = await Promise.all([read("src/data/catalogue.json"), read("src/data/review.json"), read("src/data/source-registry.json")]);
const url = "https://www.laregion.fr/eco-cheque-mobilite-vehicule-electrique-occasion";
const aid = catalogue.find((entry) => entry.url === url);
if (!aid) throw new Error("Run the regional qualification and integration first.");
if (review[aid.id]?.informationPublicationStatus === "verified" && review[aid.id]?.factSources?.some((source) => source.id === `${aid.id}:regulation-2026`)) {
  console.log(JSON.stringify({ id: aid.id, status: "already-enriched; manual verification preserved" }, null, 2));
  process.exit(0);
}
const consultedAt = "2026-11-23";
const pageId = `${aid.id}:region-page`;
const regulationId = `${aid.id}:regulation-2026`;
const page = { id: pageId, label: "Région Occitanie — Éco-chèque voiture électrique d’occasion", url, kind: "official-guidance", consultedAt, pageVerifiedAt: consultedAt };
const regulationUrl = "https://www.laregion.fr/IMG/pdf/7/6/9/dispositif_voitelec_occasion_2026_1_.pdf";
const regulation = { id: regulationId, label: "Région Occitanie — Règlement Éco-chèque voiture électrique d’occasion 2026", url: regulationUrl, kind: "official-guidance", consultedAt, pageVerifiedAt: consultedAt };
const facts = [
  { field: "current_status", status: "verified", value: "Dispositif annoncé pour une durée d’un an à compter du 1er juillet 2026, dans la limite de 5 000 aides; l’épuisement anticipé du quota est possible.", sourceIds: [pageId, regulationId], validFor: "Fenêtre annoncée du 01-07-2026 au 30-06-2027, sous réserve du quota" },
  { field: "territory", status: "verified", value: "Personne domiciliée en Occitanie; véhicule acheté auprès d’un professionnel agréé établi dans la région.", sourceIds: [pageId, regulationId], validFor: "Règlement 2026" },
  { field: "audience", status: "verified", value: "Personne physique majeure domiciliée en Occitanie et non imposable sur les revenus, n’ayant pas bénéficié de cette aide ni des versions antérieures de l’éco-chèque voiture neuve ou d’occasion.", sourceIds: [pageId, regulationId], validFor: "Règlement 2026" },
  { field: "core_conditions", status: "verified", value: "Voiture électrique d’occasion âgée d’au moins 12 mois; achat à partir du 1er juillet 2026 chez un professionnel établi en Occitanie; émissions ≤20 g CO₂/km; prix ≤30 000 € TTC; contrôle technique favorable sans réserve; immatriculation définitive française au nom de la bénéficiaire depuis au moins 12 mois. Demande dans les six mois suivant l’achat.", sourceIds: [pageId, regulationId], validFor: "Règlement applicable à compter du 01-07-2026 pour un an et jusqu’à 5 000 aides" },
  { field: "amount", status: "verified", value: "30 % du coût d’acquisition éligible, plafonné à 1 600 €; aide versée après instruction favorable.", sourceIds: [pageId, regulationId], validFor: "Règlement 2026" },
  { field: "documents", status: "verified", value: "Pièce d’identité; RIB; justificatif de domicile de moins de trois mois; dernier avis de non-imposition complet; facture d’achat; certificat d’immatriculation définitif au nom de la demandeuse; procès-verbal de contrôle technique favorable; certificat de situation administrative (non-gage) avec QR code fonctionnel.", sourceIds: [regulationId], validFor: "Liste du règlement 2026" },
];
const prior = review[aid.id];
aid.name = "Éco-chèque mobilité — voiture électrique d’occasion";
aid.description = "Aide régionale à l’achat d’une voiture particulière électrique d’occasion, soumise aux conditions de ressources, de véhicule et de dépôt.";
aid.when = facts.find((fact) => fact.field === "audience").value;
review[aid.id] = {
  ...prior,
  informationPublicationStatus: "verified", informationVerifiedAt: consultedAt, publicationStatus: "published", procedurePublicationStatus: "pending", reviewedAt: consultedAt,
  currentForPeriod: "Règlement de campagne 2026, dispositif annoncé pour un an à compter du 1er juillet 2026 avec quota de 5 000 aides.",
  eligibilityRulesReady: false, testCases: 0,
  facts, factSources: [page, regulation], applicationUrl: "https://mesaidesenligne.laregion.fr/",
  applicationProcedure: {
    status: "partially_complete",
    steps: [
      { text: "Vérifier que la personne, le véhicule, le vendeur, l’immatriculation et la date d’achat satisfont les conditions du règlement.", sourceIds: [pageId, regulationId], status: "verified" },
      { text: "Déposer le dossier en ligne sur Mes Aides en Ligne dans les six mois suivant l’achat, avec les justificatifs listés dans le règlement.", sourceIds: [pageId, regulationId], status: "verified" },
      { text: "La Région instruit la demande et verse l’aide après décision favorable; les délais de traitement et le suivi détaillé ne sont pas précisés dans les sources consultées.", sourceIds: [pageId, regulationId], status: "verified_conditional" },
    ],
    followUp: { status: "partially_verified", text: "Versement après instruction favorable; modalités détaillées de suivi non publiées sur les pages consultées.", sourceIds: [pageId, regulationId] },
    renewal: { status: "not_applicable", text: "Aide ponctuelle à l’achat; une seule attribution par bénéficiaire selon la règle de non-cumul.", sourceIds: [regulationId] },
    portalUrl: "https://mesaidesenligne.laregion.fr/", competentOrganization: "Région Occitanie — Direction Générale Déléguée Infrastructures et Mobilités",
    remainingChecks: ["Les délais de traitement, motifs de rejet et voies de recours ne sont pas précisés dans les sources examinées."],
  },
  notes: [...new Set([...(prior?.notes ?? []), "Montant, critères, période et justificatifs documentés depuis la page et le règlement officiel 2026. Délai d’instruction et recours non précisés."])],
};
const regionalSource = registry.sources.find((entry) => entry.id === "region-occitanie-catalogue");
if (regionalSource) {
  regionalSource.evidence = [...(regionalSource.evidence ?? []), { aidId: aid.id, url, pageVerifiedAt: consultedAt }, { aidId: aid.id, url: regulationUrl, pageVerifiedAt: consultedAt }].filter((entry, index, all) => all.findIndex((candidate) => candidate.aidId === entry.aidId && candidate.url === entry.url) === index);
}
await Promise.all([write("src/data/catalogue.json", catalogue), write("src/data/review.json", review), write("src/data/source-registry.json", registry)]);
console.log(JSON.stringify({ id: aid.id, informationStatus: review[aid.id].informationPublicationStatus, procedureStatus: review[aid.id].applicationProcedure.status, sourceCount: review[aid.id].factSources.length }, null, 2));
