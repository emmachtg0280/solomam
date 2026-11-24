import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (file) => JSON.parse(await readFile(path.join(root, file), "utf8"));
const [catalogue, review] = await Promise.all([read("src/data/catalogue.json"), read("src/data/review.json")]);
const today = "2026-11-23";
const definitions = {
  asf: { source: "sp-asf-2026", current: "La fiche Service-Public est présentée comme applicable et a été consultée le 23-11-2026; date de mise à jour réglementaire distincte: 01-04-2026.", territory: "Dispositif national; régime Caf ou MSA selon l'affiliation.", core: "Droit lié à la situation de l'enfant et à l'absence ou à l'insuffisance de contribution de l'autre parent. La page officielle contient une incohérence typographique entre 200,78 € et 201,78 € dans deux passages; vérifier le seuil auprès de la caisse avant toute décision." },
  af: { source: "sp-af-2026", current: "Fiche Service-Public consultée le 23-11-2026, indiquant une vérification éditoriale au 01-06-2026.", territory: "France métropolitaine; règles différentes dans les départements d'outre-mer.", core: "Au moins deux enfants à charge de moins de 20 ans. Le montant dépend du revenu net catégoriel de référence, du nombre d'enfants et de leur âge; règles spécifiques de résidence et de séjour selon la situation." },
  prime: { source: "sp-prime-2026", current: "Fiche Service-Public « salarié ou fonctionnaire » consultée le 23-11-2026, vérifiée éditorialement le 01-06-2026.", territory: "France; conditions de séjour spécifiques selon la nationalité et le régime d'affiliation.", audience: "Salariées ou fonctionnaires âgées d'au moins 18 ans qui perçoivent des revenus modestes; les règles spécifiques des travailleuses indépendantes, étudiantes, stagiaires et apprenties ne sont pas détaillées dans cette fiche.", core: "Pour les personnes salariées ou fonctionnaires: avoir au moins 18 ans, exercer une activité professionnelle et percevoir des revenus modestes, résider en France de manière stable et effective; les règles varient selon le statut et la situation de séjour." },
  css: { source: "ameli-css-2026", current: "Page Ameli mise à jour le 18-09-2026 et consultée le 23-11-2026.", territory: "France métropolitaine et outre-mer, avec plafonds distincts; non applicable à plusieurs collectivités ultramarines indiquées par Ameli.", core: "Être affiliée à la Sécurité sociale et ne pas dépasser le plafond de ressources du foyer. Aide gratuite ou avec participation; plafonds en vigueur indiqués par Ameli au 01-04-2026." },
  "rsa-parent-isole": { source: "sp-rsa-parent-isole-2026", current: "Fiche Service-Public consultée le 23-11-2026, vérifiée éditorialement le 01-04-2026.", territory: "Dispositif national; la caisse et certains points de dépôt dépendent du régime et du département.", core: "Parent isolé selon la définition officielle, résidence stable et effective en France, conditions de ressources et, selon la nationalité, conditions de séjour. La séparation géographique d'un conjoint ne constitue pas l'isolement au sens de cette fiche." },
  prepare: { source: "sp-prepare-2026", current: "Fiche Service-Public consultée le 23-11-2026, vérifiée éditorialement le 01-06-2026.", territory: "Dispositif national; versement par Caf ou MSA selon le régime.", core: "Parent d'un enfant de moins de 3 ans (ou de moins de 20 ans en cas d'adoption), ayant interrompu ou réduit son activité et justifiant des trimestres de cotisation requis; règles de durée distinctes selon le nombre d'enfants et la situation familiale." },
  aeeh: { source: "sp-aeeh-2026", current: "Fiche Service-Public consultée le 23-11-2026, vérifiée éditorialement le 01-06-2026; certificat/formulaire MDPH consulté le 23-11-2026.", territory: "Dispositif national; demande à la MDPH du lieu de résidence, paiement Caf ou MSA.", core: "Enfant de moins de 20 ans, résident de façon permanente en France, avec taux d'incapacité d'au moins 80 %, ou de 50 % à moins de 80 % dans les situations d'accompagnement ou de soins définies; condition de revenu professionnel propre de l'enfant." },
};
const extraSources = {
  prime: { id: "sp-prime-2026", label: "Service-Public — Prime d'activité : salarié ou fonctionnaire", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2882", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-06-01" },
};

for (const record of catalogue) {
  const audit = review[record.id];
  audit.informationPublicationStatus ??= "pending";
  audit.informationVerifiedAt ??= null;
  audit.procedurePublicationStatus ??= "pending";
}

for (const [id, definition] of Object.entries(definitions)) {
  const record = catalogue.find((item) => item.id === id);
  const audit = review[id];
  if (!record || !audit) throw new Error(`Fiche absente: ${id}`);
  audit.factSources ??= [];
  if (extraSources[id] && !audit.factSources.some((source) => source.id === extraSources[id].id)) audit.factSources.push(extraSources[id]);
  const source = audit.factSources.find((item) => item.id === definition.source) ?? audit.sources?.find((item) => item.id === definition.source);
  if (!source) throw new Error(`Source non enregistrée pour ${id}: ${definition.source}`);
  audit.facts ??= [];
  for (const [field, value] of [["current_status", definition.current], ["territory", definition.territory], ...(definition.audience ? [["audience", definition.audience]] : []), ["core_conditions", definition.core]]) {
    const fact = audit.facts.find((item) => item.field === field);
    const normalized = { field, status: "verified", value, sourceIds: [definition.source], validFor: `Consulté le ${today}; date éditoriale/source précisée dans la valeur.` };
    if (fact) Object.assign(fact, normalized);
    else audit.facts.push(normalized);
  }
  audit.informationPublicationStatus = "verified";
  audit.informationVerifiedAt = today;
  audit.procedurePublicationStatus = "pending";
  audit.publicationStatus = "published"; // Catalogue visibility follows verified information; procedure completeness remains separate.
  const publicationNote = "Fiche d'information publiée après vérification des faits essentiels. Le statut ne valide pas le parcours de demande; voir les informations de vérification sur la fiche.";
  audit.notes = (audit.notes ?? []).filter((note) => !note.startsWith("Fiche d'information publiée après vérification des faits essentiels."));
  audit.notes.push(publicationNote);
  if (id === "asf") {
    const amount = audit.facts.find((fact) => fact.field === "amount");
    if (amount) {
      amount.status = "conflict";
      amount.value = "La page Service-Public affiche 200,78 € par mois et par enfant, mais une phrase de la même page évoque 201,78 €; montant et seuil laissés en conflit à confirmer avant usage.";
    }
  }
}

await writeFile(path.join(root, "src/data/review.json"), `${JSON.stringify(review, null, 2)}\n`);
console.log(`Information cards qualified: ${Object.keys(definitions).length}`);
