import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reviewPath = path.join(root, "src/data/review.json");
const review = JSON.parse(await readFile(reviewPath, "utf8"));
const consultedAt = "2026-11-23";

// Data is recorded at fact level. Unknown fields stay explicit and are never
// inferred from the existence of a benefit or from a calculator.
const enrichments = {
  asf: {
    factSources: [
      { id: "sp-asf-2026", label: "Service-Public — Allocation de soutien familial : parents séparés", url: "https://www.service-public.fr/particuliers/vosdroits/F815", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-04-01" },
      { id: "css-benefits-resources-2026", label: "Service-Public — Prestations familiales et conditions de ressources", url: "https://www.service-public.fr/particuliers/vosdroits/F13212", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-06-01" },
    ],
    facts: [
      { field: "audience", status: "verified", value: "Personne qui élève seule au moins un enfant à charge privé de la contribution de l'autre parent, ou recevant une pension alimentaire inférieure au seuil officiel.", sourceIds: ["sp-asf-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "living_situation", status: "verified", value: "La personne doit vivre seule; le droit ASF cesse si elle vit en couple.", sourceIds: ["sp-asf-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "residence", status: "verified", value: "Résider en France; les conditions détaillées de résidence sont celles de la page officielle liée.", sourceIds: ["sp-asf-2026"], validFor: "Page vérifiée le 01-04-2026" },
      { field: "resource_condition", status: "verified", value: "Pas de condition de ressources pour l'ASF.", sourceIds: ["css-benefits-resources-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "pension_scenarios", status: "verified", value: "Cas distincts : pension fixée mais impayée (avance et recouvrement), impossibilité de paiement évaluée par la caisse, pension non fixée (ASF pendant 4 mois puis saisine du juge aux affaires familiales ou révision), pension inférieure à 200,78 € (différentielle; pas de versement si différence inférieure à 15 €).", sourceIds: ["sp-asf-2026"], validFor: "Montants applicables selon page vérifiée le 01-04-2026" },
      { field: "amount", status: "verified", value: "200,78 € par mois et par enfant; différentielle selon pension perçue.", sourceIds: ["sp-asf-2026"], validFor: "Montant applicable selon page vérifiée le 01-04-2026" },
      { field: "documents", status: "verified", value: "Formulaire Cerfa 12038 et déclaration de situation Cerfa 11423; joindre les pièces précisées dans les formulaires selon le cas. La liste ne peut pas être uniformisée sans connaître le scénario de pension.", sourceIds: ["sp-asf-2026"], validFor: "Page vérifiée le 01-04-2026" },
    ],
    applicationProcedure: {
      status: "partially_complete",
      steps: [
        { text: "Identifier le scénario de pension : absence, impayé, pension non fixée, impossibilité de payer ou pension inférieure au seuil.", sourceIds: ["sp-asf-2026"], status: "verified" },
        { text: "Régime Caf : remplir le Cerfa 12038 et la déclaration de situation Cerfa 11423; joindre les pièces demandées dans le formulaire selon la situation.", sourceIds: ["sp-asf-2026"], status: "verified" },
        { text: "Envoyer le dossier à la Caf compétente. Régime agricole : utiliser les formulaires et l'adresse MSA indiqués par Service-Public.", sourceIds: ["sp-asf-2026"], status: "verified" },
        { text: "Si aucune pension n'a été fixée, engager dans les quatre mois l'action ou la révision auprès du juge aux affaires familiales pour maintenir le droit.", sourceIds: ["sp-asf-2026"], status: "verified_conditional" },
      ],
      followUp: { status: "verified", text: "Déclarer rapidement tout changement familial; le suivi relève de l'espace Caf ou MSA. Le délai de traitement initial n'est pas indiqué dans la page consultée.", sourceIds: ["sp-asf-2026"] },
      renewal: { status: "not_applicable_or_not_stated", text: "Aucune périodicité de renouvellement générale n'est indiquée sur la page; les obligations changent selon le scénario de pension.", sourceIds: ["sp-asf-2026"] },
      portalUrl: "https://www.service-public.fr/particuliers/vosdroits/F815",
      competentOrganization: "Caf ou MSA selon le régime; juge aux affaires familiales pour fixer/réviser une pension dans le scénario indiqué.",
      remainingChecks: ["Confirmer la version courante des formulaires avant chaque demande.", "Ne pas automatiser les règles de pension ou la décision d'éligibilité."],
    },
    eligibilityRulesReady: false,
    testCases: 0,
    publicationStatus: "pending",
    notesAppend: ["Faits de base et démarches recensés depuis Service-Public; la fiche reste non publiée tant que les branches juridiques et formulaires actuels ne sont pas validés par contrôle opérationnel."]
  },
  af: {
    factSources: [
      { id: "sp-af-2026", label: "Service-Public — Allocations familiales (famille de 2 enfants ou plus)", url: "https://www.service-public.fr/particuliers/vosdroits/F13213", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-06-01" },
      { id: "sp-family-resources-2026", label: "Service-Public — Prestations familiales et conditions de ressources", url: "https://www.service-public.fr/particuliers/vosdroits/F13212", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-06-01" },
    ],
    facts: [
      { field: "audience", status: "verified", value: "Personnes ayant au moins deux enfants à charge de moins de 20 ans.", sourceIds: ["sp-af-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "residence", status: "verified", value: "Résidence habituelle en France ou plus de neuf mois de séjour dans l'année; conditions de résidence des enfants et de régularité du séjour à vérifier selon nationalité/situation.", sourceIds: ["sp-af-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "resource_condition", status: "verified", value: "Le montant est modulé selon le revenu net catégoriel de 2024 pour les droits 2026, le nombre d'enfants et leur âge; seuils différents selon la composition.", sourceIds: ["sp-af-2026", "sp-family-resources-2026"], validFor: "Droits 2026; revenus de référence 2024" },
      { field: "shared_care", status: "verified", value: "La page officielle prévoit un cas spécifique de résidence alternée et de partage des prestations; attribution au parent à vérifier selon la situation.", sourceIds: ["sp-af-2026"], validFor: "Page vérifiée le 01-06-2026" },
      { field: "documents", status: "partially_verified", value: "Déclaration de situation Caf (Cerfa 11423 mentionné pour MSA); justificatifs de résidence et d'identité selon le dossier. Liste exhaustive à confirmer avec le régime et la situation.", sourceIds: ["sp-af-2026"], validFor: "Page vérifiée le 01-06-2026" },
    ],
    applicationProcedure: {
      status: "incomplete",
      steps: [
        { text: "Déclarer la naissance ou l'arrivée du deuxième enfant et tenir à jour la situation familiale auprès de la Caf ou de la MSA.", sourceIds: ["sp-af-2026"], status: "verified" },
        { text: "Vérifier la prise en compte des enfants à charge, du régime et, le cas échéant, de la résidence alternée dans son espace organisme.", sourceIds: ["sp-af-2026"], status: "verified" },
        { text: "Pour la MSA, Service-Public indique la déclaration de situation Cerfa 11423 par courrier ou accueil; le parcours exact Caf de première ouverture reste à valider.", sourceIds: ["sp-af-2026"], status: "verified_conditional" },
      ],
      followUp: { status: "verified", text: "Déclarer rapidement les changements familiaux; prestations versées mensuellement à terme échu lorsque le droit est ouvert.", sourceIds: ["sp-af-2026"] },
      renewal: { status: "not_applicable_or_not_stated", text: "Pas de renouvellement périodique général indiqué; la caisse réévalue les droits selon la situation et les revenus de référence.", sourceIds: ["sp-af-2026"] },
      portalUrl: "https://www.service-public.fr/particuliers/vosdroits/F13213",
      competentOrganization: "Caf ou MSA selon le régime.",
      remainingChecks: ["Confirmer les pièces exhaustives et le premier parcours de demande Caf/MSA.", "Ne pas figer les montants: barèmes indexés annuellement.", "Valider le traitement détaillé de la résidence alternée avant toute règle automatique."],
    },
    eligibilityRulesReady: false,
    testCases: 0,
    publicationStatus: "pending",
    notesAppend: ["Conditions, modulation de ressources et attribution mensuelle sourcées; démarche de première ouverture et justificatifs exhaustifs encore à vérifier."]
  },
  css: {
    factSources: [
      { id: "ameli-css-2026", label: "Assurance Maladie — Complémentaire santé solidaire : l'essentiel", url: "https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante/complementaire-sante-solidaire", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-09-18" },
    ],
    facts: [
      { field: "audience", status: "verified", value: "Personne affiliée à la Sécurité sociale dont le foyer ne dépasse pas les plafonds de ressources; salariés, étudiants, demandeurs d'emploi, indépendants et familles inclus.", sourceIds: ["ameli-css-2026"], validFor: "Page mise à jour le 18-09-2026" },
      { field: "resource_condition", status: "verified", value: "Plafonds métropole applicables depuis le 01-04-2026. Pour 1 personne : 868,44 €/mois sans participation ou 1 172,40 €/mois avec participation; pour 2 personnes : 1 302,66 € ou 1 758,59 €. Ressources prises en compte selon la composition du foyer; les montants sont des moyennes indicatives publiées par Ameli.", sourceIds: ["ameli-css-2026"], validFor: "Depuis le 01-04-2026; réviser aux prochains barèmes" },
      { field: "benefit", status: "verified", value: "Prise en charge complémentaire pour le foyer pendant un an; gratuite ou avec participation de 8 à 30 € maximum par mois et par personne selon ressources et âge.", sourceIds: ["ameli-css-2026"], validFor: "Page mise à jour le 18-09-2026" },
      { field: "documents", status: "partially_verified", value: "Demande en ligne ou formulaire papier avec justificatifs demandés. La liste exhaustive dépend de la période et de la composition du foyer et doit être reprise du formulaire courant.", sourceIds: ["ameli-css-2026"], validFor: "Page mise à jour le 18-09-2026" },
    ],
    applicationProcedure: {
      status: "partially_complete",
      steps: [
        { text: "Vérifier le droit à l'aide sur le simulateur Mes droits sociaux; cette estimation ne vaut pas décision.", sourceIds: ["ameli-css-2026"], status: "verified" },
        { text: "Déposer la demande dans le compte ameli (Démarches > Frais de santé > Demander la Complémentaire santé solidaire) ou transmettre/déposer le formulaire et les justificatifs à la caisse d'assurance maladie.", sourceIds: ["ameli-css-2026"], status: "verified" },
        { text: "Lors de la première demande, choisir l'organisme gestionnaire : caisse d'assurance maladie ou organisme complémentaire habilité.", sourceIds: ["ameli-css-2026"], status: "verified" },
        { text: "Après réception d'un dossier complet, la caisse annonce un délai d'étude de deux mois et notifie sa décision; attestation dans ameli ou par courrier.", sourceIds: ["ameli-css-2026"], status: "verified" },
      ],
      followUp: { status: "verified", text: "Décision et attestation consultables dans ameli ou reçues par courrier; délai d'instruction de deux mois à compter du dossier complet.", sourceIds: ["ameli-css-2026"] },
      renewal: { status: "verified", text: "Droit accordé pour un an; demande de renouvellement annuelle sauf exceptions mentionnées par l'Assurance Maladie.", sourceIds: ["ameli-css-2026"] },
      portalUrl: "https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante/complementaire-sante-solidaire",
      competentOrganization: "Caisse primaire d'assurance maladie ou organisme complémentaire habilité choisi par la personne.",
      remainingChecks: ["Contrôler la définition exacte du foyer CSS et l'ensemble des ressources de référence.", "Extraire la liste des justificatifs du formulaire versionné au moment de la demande.", "Vérifier les cas de renouvellement automatique, dont les bénéficiaires du RSA."],
    },
    eligibilityRulesReady: false,
    testCases: 0,
    publicationStatus: "pending",
    notesAppend: ["Parcours, délai d'instruction, durée du droit et barème de ressources datés intégrés; périmètre exact du foyer et justificatifs à valider avant publication."]
  },
  logement: {
    factSources: [
      { id: "sp-apl-2026", label: "Service-Public — Aide personnalisée au logement", url: "https://www.service-public.fr/particuliers/vosdroits/F12006", kind: "official-guidance", consultedAt, pageVerifiedAt: "2026-07-01" },
      { id: "caf34-housing-steps", label: "Caf de l'Hérault — Les 3 étapes de l'aide au logement", url: "https://www.caf.fr/allocataires/caf-de-l-herault/offre-de-service/logement/aideaulogementmontpellier/les-3-etapes-de-l-aide-au-logement", kind: "official-guidance", consultedAt, pageVerifiedAt: null },
    ],
    facts: [
      { field: "benefit_scope", status: "verified", value: "La fiche prototype regroupe APL, ALF et ALS, qui sont des prestations distinctes. La page source consultée décrit ici l'APL; les trois dispositifs ne doivent pas être fusionnés en une décision juridique unique.", sourceIds: ["sp-apl-2026"], validFor: "Page vérifiée le 01-07-2026" },
      { field: "audience", status: "verified", value: "Pour l'APL locataire : locataire, colocataire ou certains sous-locataires; logement résidence principale en France, décent et conventionné. Cas de séjour et de statut étudiant comportent des règles particulières.", sourceIds: ["sp-apl-2026"], validFor: "Page vérifiée le 01-07-2026" },
      { field: "resource_condition", status: "verified", value: "Conditions de ressources selon composition et lieu; ressources de l'ensemble du foyer prises sur les douze derniers mois et actualisées automatiquement tous les trois mois.", sourceIds: ["sp-apl-2026"], validFor: "Page vérifiée le 01-07-2026" },
      { field: "documents", status: "verified", value: "La Caf de l'Hérault demande notamment bail ou contrat de location, attestation de loyer, pièce d'identité et RIB; la liste complète est liée depuis son parcours et dépend du dossier.", sourceIds: ["caf34-housing-steps"], validFor: "Page consultée le 23-11-2026; liste complète à récupérer" },
    ],
    applicationProcedure: {
      status: "partially_complete",
      steps: [
        { text: "La Caf de l'Hérault recommande de faire une simulation, puis de déposer la demande après l'emménagement.", sourceIds: ["caf34-housing-steps"], status: "verified" },
        { text: "Déposer la demande APL/ALF/ALS via le téléservice Caf; une personne non allocataire doit créer un compte pour demander une prestation.", sourceIds: ["sp-apl-2026"], status: "verified" },
        { text: "Préparer les informations du logement, bail/contrat, attestation de loyer, pièce d'identité et RIB selon le parcours Caf de l'Hérault; la liste complète reste à consulter.", sourceIds: ["caf34-housing-steps"], status: "verified" },
        { text: "Activer Mon Compte pour suivre l'avancement et transmettre les documents réclamés; conserver le récapitulatif de demande.", sourceIds: ["caf34-housing-steps"], status: "verified" },
      ],
      followUp: { status: "verified", text: "Suivi d'avancement et envoi de pièces depuis le compte Caf; Service-Public indique un délai moyen publié de 36,5 jours pour un dossier complet au moment de sa vérification.", sourceIds: ["sp-apl-2026", "caf34-housing-steps"] },
      renewal: { status: "partially_verified", text: "La page décrit l'actualisation trimestrielle automatique des ressources; les obligations de renouvellement de situation/logement ne sont pas détaillées ici.", sourceIds: ["sp-apl-2026"] },
      portalUrl: "https://www.caf.fr/allocataires/aides-et-demarches/droits-et-prestations/logement",
      competentOrganization: "Caf ou MSA selon le régime; les étapes locales décrites sont celles de la Caf de l'Hérault.",
      remainingChecks: ["Séparer les fiches APL, ALF et ALS ou documenter précisément le parcours d'orientation entre elles.", "Récupérer et vérifier la liste complète des pièces liée par la Caf de l'Hérault.", "Compléter le parcours MSA.", "Vérifier si le délai de traitement publié est toujours actuel."],
    },
    eligibilityRulesReady: false,
    testCases: 0,
    publicationStatus: "pending",
    notesAppend: ["Le parcours local Caf 34 est étayé (simulation, demande après emménagement, pièces, suivi); le catalogue regroupe encore APL/ALF/ALS et doit être scindé ou clarifié avant publication."]
  }
};

for (const [id, enrichment] of Object.entries(enrichments)) {
  const entry = review[id];
  if (!entry) throw new Error(`Missing review record: ${id}`);
  entry.factSources = enrichment.factSources;
  entry.facts = enrichment.facts;
  entry.applicationProcedure = enrichment.applicationProcedure;
  entry.eligibilityRulesReady = enrichment.eligibilityRulesReady;
  entry.testCases = enrichment.testCases;
  entry.publicationStatus = enrichment.publicationStatus;
  entry.notes = [...new Set([...entry.notes, ...enrichment.notesAppend])];
}

await writeFile(reviewPath, `${JSON.stringify(review, null, 2)}\n`, "utf8");
console.log(`Enriched ${Object.keys(enrichments).length} national/local aid records with sourced facts and procedures.`);
