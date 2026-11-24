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
const id = "fsl-gard-acces";
const url = "https://adhl.gard.fr/acceder-a-un-logement/le-fonds-solidarite-logement-fsl-volet-acces.html";
const sources = [
  { id: "adhl-gard-fsl-access", label: "ADHL Gard — FSL volet Accès", url, kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
  { id: "adhl-gard-fsl-scale-2026", label: "ADHL Gard — Barèmes FSL au 1er avril 2026", url: "https://adhl.gard.fr/acceder-a-un-logement/le-fonds-solidarite-logement-fsl-volet-acces/baremes-fsl.html", kind: "official-guidance", consultedAt: checkedAt, pageVerifiedAt: checkedAt },
];
const record = {
  id, name: "Fonds de solidarité pour le logement — accès au logement (Gard)", category: "Logement", zone: "30",
  org: "Conseil départemental du Gard (financeur); Agence Départementale de l’Habitat et du Logement (instructeur)",
  description: "Le volet Accès du FSL du Gard aide les ménages à accéder à un logement. Il peut contribuer au dépôt de garantie, premier loyer, frais d’agence, déménagement ou assurance locative, selon les règles et ressources applicables. L’ADHL instruit; le Département verse.",
  when: "Ménages du Gard qui rencontrent des difficultés pour accéder à un logement, sous plafonds de ressources variables selon la composition du foyer et selon les conditions propres à l’aide demandée.", url,
};
let canonical = catalogue.find((item) => item.id === id);
if (!canonical) { catalogue.push(record); canonical = record; }
const facts = [
  { field: "current_status", status: "verified", value: "Barème du FSL affiché comme applicable au 1er avril 2026.", sourceIds: ["adhl-gard-fsl-scale-2026"], validFor: "Barèmes au 01-04-2026" },
  { field: "territory", status: "verified", value: "Département du Gard.", sourceIds: ["adhl-gard-fsl-access"], validFor: "Page officielle consultée le 23-11-2026" },
  { field: "audience", status: "verified", value: "Ménages rencontrant des difficultés pour accéder à un logement; soumis aux plafonds de ressources FSL établis selon la composition du ménage.", sourceIds: ["adhl-gard-fsl-access", "adhl-gard-fsl-scale-2026"], validFor: "Page FSL et barème du 01-04-2026" },
  { field: "core_conditions", status: "verified", value: "Pour le volet Accès, taux d’effort logement inférieur à 33 % et DPE classé A à E. La demande doit être signée par les membres du ménage signataires du bail, adressée par un service social avec accompagnement et évaluation sociale. Le barème au 01-04-2026 plafonne les ressources à 1 288 € pour une personne isolée, 1 803 € avec 1 enfant, 2 318 € avec 2, 2 834 € avec 3, puis +515 € par enfant supplémentaire.", sourceIds: ["adhl-gard-fsl-access", "adhl-gard-fsl-scale-2026"], validFor: "Barèmes au 01-04-2026; critères d’accès vérifiés le 23-11-2026" },
  { field: "eligible_needs", status: "verified", value: "Dépôt de garantie (plafond d’un mois de loyer hors charges, deux mois en logement meublé; prêt), premier mois de loyer dans certains cas d’accès ou changement ouvrant un droit au logement, frais d’agence, déménagement via structure d’insertion conventionnée (plafond 300 €), assurance locative lorsque le paiement échelonné ne peut être négocié.", sourceIds: ["adhl-gard-fsl-access"], validFor: "Page officielle consultée le 23-11-2026" },
  { field: "documents", status: "partially_verified", value: "Justificatifs utiles à l’instruction; demande signée par le ou les membres du ménage signataires du bail. La liste exhaustive dépend de l’aide sollicitée.", sourceIds: ["adhl-gard-fsl-access"], validFor: "Page officielle consultée le 23-11-2026" },
];
const audit = {
  informationPublicationStatus: "verified", informationVerifiedAt: checkedAt, publicationStatus: "published", procedurePublicationStatus: "pending",
  reviewedAt: checkedAt, currentForPeriod: "Barème FSL au 01-04-2026", eligibilityRulesReady: false, testCases: 0, sources: [], factSources: sources, facts,
  applicationProcedure: { status: "incomplete", steps: [{ text: "Prendre contact avec un service social pour constituer et transmettre le dossier avec accompagnement et évaluation sociale.", status: "verified", sourceIds: ["adhl-gard-fsl-access"] }], documents: { status: "unverified", sourceIds: ["adhl-gard-fsl-access"] }, followUp: { status: "unverified", text: "Délais, décision et suivi du dossier à vérifier dans le règlement intérieur complet.", sourceIds: ["adhl-gard-fsl-access"] }, renewal: { status: "unverified", text: "À vérifier selon l’aide et la situation.", sourceIds: ["adhl-gard-fsl-access"] }, portalUrl: null, competentOrganization: "Conseil départemental du Gard (financeur); ADHL Gard (instructeur).", remainingChecks: ["Vérifier les délais, voies de recours et documents détaillés dans le règlement intérieur complet.", "Vérifier les règles FSL distinctes pour maintien et charges; cette fiche ne couvre que le volet accès."] },
  notes: ["Fiche limitée au volet Accès; ne pas la confondre avec les volets FSL Maintien et Charges."],
};
const eligible = canPublishInformation(canonical, audit);
if (!eligible) throw new Error("FSL Gard information failed the publication evidence gate");
review[id] = audit;
if (new Set(catalogue.map((item) => item.id)).size !== catalogue.length) throw new Error("Duplicate canonical aid ID");
await writeFile(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ id, informationPublished: eligible, procedurePublished: false, coverage: "department 30 — FSL Accès only" }, null, 2));
