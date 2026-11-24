import { readFile, writeFile } from "node:fs/promises";

const today = "2026-11-23";
const read = async (file) => JSON.parse(await readFile(new URL(file, import.meta.url), "utf8"));
const write = async (file, value) => writeFile(new URL(file, import.meta.url), `${JSON.stringify(value, null, 2)}\n`, "utf8");
const catalogue = await read("../src/data/catalogue.json");
const review = await read("../src/data/review.json");
const registry = await read("../src/data/source-registry.json");

const sources = {
  apl: [
    { id: "sp-apl-2026", label: "Service-Public — Aide personnalisée au logement (APL)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F12006", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-07-01" },
    { id: "sp-housing-request-2026", label: "Service-Public — Demande d'aide au logement", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R1292", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-03-02" },
  ],
  alf: [
    { id: "sp-alf-2026", label: "Service-Public — Allocation de logement familiale (ALF)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F13132", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-07-01" },
    { id: "sp-housing-request-2026", label: "Service-Public — Demande d'aide au logement", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R1292", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-03-02" },
  ],
  als: [
    { id: "sp-als-2026", label: "Service-Public — Allocation de logement sociale (ALS)", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F1280", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-07-01" },
    { id: "sp-housing-request-2026", label: "Service-Public — Demande d'aide au logement", url: "https://www.service-public.gouv.fr/particuliers/vosdroits/R1292", kind: "official-guidance", consultedAt: today, pageVerifiedAt: "2026-03-02" },
  ],
};

const directApplication = "https://wwwd.caf.fr/wps/portal/caffr/aidesetservices/lesservicesenligne/faireunedemandedeprestation/demanderlaideaulogement";
const benefits = [
  {
    id: "apl", name: "Aide personnalisée au logement (APL)", url: sources.apl[0].url,
    description: "Aide au logement attribuée sous conditions, notamment lorsque le logement est conventionné.",
    audience: "Locataires, colocataires et certains sous-locataires; certains résidents en établissement peuvent aussi y avoir droit. Le logement doit notamment être la résidence principale en France, décent et conventionné. Des règles particulières s'appliquent à certaines situations de séjour et aux étudiants.",
    conditions: ["Les ressources du foyer et la composition du ménage sont prises en compte sur les 12 derniers mois et actualisées tous les 3 mois.", "L'APL concerne un logement conventionné; d'autres critères d'occupation et situations particulières s'appliquent."],
    docs: "Pour une demande de locataire, Service-Public indique une pièce d'identité ou un titre de séjour, une attestation de loyer remplie par le bailleur et, si le versement est fait directement à la personne, un RIB. La liste affichée dans le parcours peut dépendre du dossier.",
    steps: ["Faire la demande en ligne auprès de la Caf; les personnes sans compte doivent créer leur espace personnel.", "Renseigner le logement et le foyer, transmettre les justificatifs demandés, vérifier les informations puis valider la demande."],
    audienceShort: "Locataires ou certains résidents en logement conventionné, sous conditions de logement, de résidence et de ressources.",
  },
  {
    id: "alf", name: "Allocation de logement familiale (ALF)", url: sources.alf[0].url,
    description: "Aide au logement destinée à certains foyers qui ne relèvent pas de l'APL.",
    audience: "Personnes qui ne peuvent pas bénéficier de l'APL et remplissent une situation familiale prévue, notamment percevoir une prestation familiale ou l'AEEH, avoir un enfant à charge de moins de 21 ans dans certaines conditions, ou être enceinte et seule à partir du mois suivant le 4e mois de grossesse jusqu'à la naissance. D'autres situations familiales prévues par la règle existent.",
    conditions: ["Le logement doit notamment être la résidence principale en France, décent et occupé selon les conditions prévues.", "Les ressources des 12 derniers mois sont prises en compte et actualisées tous les 3 mois.", "L'ALF n'est pas cumulable avec l'APL ou l'ALS pour le même logement."],
    docs: "Pour une demande de locataire, Service-Public indique une pièce d'identité ou un titre de séjour, une attestation de loyer remplie par le bailleur et, si le versement est fait directement à la personne, un RIB. La liste affichée dans le parcours peut dépendre du dossier.",
    steps: ["Faire la demande d'aide au logement en ligne auprès de la Caf; les personnes sans compte doivent créer leur espace personnel.", "Renseigner le logement et le foyer, transmettre les justificatifs demandés, vérifier les informations puis valider la demande."],
    audienceShort: "Foyers remplissant une situation familiale définie et ne pouvant pas bénéficier de l'APL, sous conditions.",
  },
  {
    id: "als", name: "Allocation de logement sociale (ALS)", url: sources.als[0].url,
    description: "Aide au logement attribuée sous conditions lorsque le foyer ne peut bénéficier ni de l'APL ni de l'ALF.",
    audience: "Locataires ou sous-locataires répondant aux conditions de la page officielle, ainsi que certains résidents en établissement. L'ALS n'est envisagée que si la personne ne peut bénéficier ni de l'APL ni de l'ALF.",
    conditions: ["Le logement doit notamment être la résidence principale en France, décent et occupé selon les conditions prévues.", "Les ressources des 12 derniers mois et la composition du foyer sont prises en compte; les plafonds varient notamment selon le lieu et le foyer.", "L'ALS n'est pas cumulable avec l'APL ou l'ALF pour le même logement."],
    docs: "Pour une demande de locataire, Service-Public indique une pièce d'identité ou un titre de séjour, une attestation de loyer remplie par le bailleur et, si le versement est fait directement à la personne, un RIB. Les justificatifs des résidents en établissement peuvent différer; suivre la liste du parcours.",
    steps: ["Faire la demande en ligne auprès de la Caf ou de la MSA selon le régime; suivre le parcours de l'organisme compétent.", "Renseigner le logement et le foyer, transmettre les justificatifs demandés, vérifier les informations puis valider la demande."],
    audienceShort: "Locataires ou certains résidents qui ne relèvent ni de l'APL ni de l'ALF, sous conditions.",
  },
];

for (const benefit of benefits) {
  const record = {
    id: benefit.id, name: benefit.name, category: "Logement", org: "Caf ou MSA selon le régime", zone: "national",
    description: benefit.description, when: benefit.audienceShort, steps: benefit.steps,
    url: benefit.url,
  };
  const previous = catalogue.findIndex(({ id }) => id === benefit.id);
  if (previous >= 0) catalogue[previous] = record;
  else catalogue.push(record);

  const field = (name, value, validFor = "Page officielle vérifiée le 01-07-2026; consultée le 23-11-2026") => ({ field: name, status: "verified", value, sourceIds: [sources[benefit.id][0].id], validFor });
  review[benefit.id] = {
    publicationStatus: "pending", reviewedAt: today, currentForPeriod: null, eligibilityRulesReady: false, testCases: 0,
    notes: ["Information publiée après vérification des faits essentiels. Cette fiche ne calcule pas l'éligibilité.", "Montant individuel non indiqué: il dépend du calcul applicable à la situation et aux règles en vigueur.", "Le parcours détaillé reste partiel: appliquer les branches Caf/MSA, locataire/résident et les justificatifs affichés dans le dossier.", "La date de mise à jour de la page (01-07-2026) est distincte de la date de consultation (23-11-2026)."],
    sources: [], factSources: sources[benefit.id],
    facts: [
      field("current_status", "Aide au logement présentée comme prestation en vigueur sur la fiche officielle consultée.", "Page vérifiée le 01-07-2026; consultée le 23-11-2026"),
      field("territory", "Dispositif national; conditions particulières de résidence et de logement, y compris des règles particulières selon les territoires ultramarins.", "Page vérifiée le 01-07-2026; consultée le 23-11-2026"),
      field("audience", benefit.audience),
      field("core_conditions", benefit.conditions.join(" ")),
      field("resource_condition", benefit.conditions.find((condition) => condition.includes("ressources")) ?? "Conditions spécifiques détaillées par la source officielle."),
      field("documents", benefit.docs, "Demande de locataire; la liste dépend du dossier et le parcours résident peut différer. Page demande vérifiée le 02-03-2026."),
    ],
    applicationProcedure: {
      status: "partially_complete", competentOrganization: "Caf ou MSA selon le régime; la demande Caf suit le parcours d'aide au logement.",
      portalUrl: sources[benefit.id][1].url, steps: benefit.steps.map((text) => ({ text, sourceIds: [sources[benefit.id][1].id], status: "verified" })),
      documents: { status: "verified", text: benefit.docs, sourceIds: [sources[benefit.id][1].id] },
      followUp: { status: "partially_verified", text: "Les modalités de suivi et les pièces complémentaires sont indiquées par l'organisme dans l'espace de demande; la page générale ne confirme pas tous les cas.", sourceIds: [sources[benefit.id][1].id] },
      renewal: { status: "partially_verified", text: "Les ressources sont actualisées périodiquement; les obligations de déclaration des changements et les renouvellements spécifiques doivent être vérifiés selon la situation.", sourceIds: [sources[benefit.id][0].id] },
      remainingChecks: ["Confirmer les branches Caf et MSA et les justificatifs conditionnels pour chaque situation.", "Vérifier les modalités de suivi et de renouvellement propres au logement et à l'organisme instructeur."],
    },
    applicationUrl: benefit.id === "als" ? null : directApplication,
    informationPublicationStatus: "verified", informationVerifiedAt: today, procedurePublicationStatus: "pending",
  };
}

const legacyIndex = catalogue.findIndex(({ id }) => id === "logement");
if (legacyIndex >= 0) catalogue.splice(legacyIndex, 1);
review.logement.recordLifecycle = "superseded";
review.logement.supersededBy = benefits.map(({ id }) => id);
review.logement.informationPublicationStatus = "pending";
review.logement.procedurePublicationStatus = "pending";
const supersededNote = "Fiche remplacée le 23-11-2026 par trois fiches distinctes APL, ALF et ALS; conserver cet audit pour la traçabilité, ne pas publier cet enregistrement.";
if (!review.logement.notes.includes(supersededNote)) review.logement.notes.push(supersededNote);

if (catalogue.length !== 45 || new Set(catalogue.map(({ id }) => id)).size !== catalogue.length) throw new Error(`Unexpected catalogue size/duplicate IDs: ${catalogue.length}`);
await write("../src/data/catalogue.json", catalogue);
await write("../src/data/review.json", review);
const servicePublic = registry.sources.find(({ id }) => id === "service-public");
if (servicePublic) {
  servicePublic.status = "ten-national-aid-records-reviewed-three-new-information-pages-published";
  servicePublic.coverage = "National official guidance pages for ASF, family benefits, activity bonus, CSS, RSA parent isolé, PreParE, AEEH, APL, ALF and ALS; information-publication and request-procedure states remain independent in review.json";
  servicePublic.candidateRecordsIntegrated = 5;
  servicePublic.factsEnrichedForAids = 5;
  servicePublic.publishableRecords = 3;
  servicePublic.evidence = (servicePublic.evidence ?? []).filter(({ aidId }) => !["logement", "apl", "alf", "als"].includes(aidId));
  for (const benefit of benefits) {
    servicePublic.evidence.push({ aidId: benefit.id, url: benefit.url, pageVerifiedAt: "2026-07-01" });
    servicePublic.evidence.push({ aidId: benefit.id, url: sources[benefit.id][1].url, pageVerifiedAt: "2026-03-02" });
  }
}
await write("../src/data/source-registry.json", registry);
console.log(JSON.stringify({ catalogueRecords: catalogue.length, splitBenefits: benefits.map(({ id }) => id), superseded: "logement" }, null, 2));
