# Gouvernance des données Solomam

## État initial

Le prototype contient 17 identifiants stables (`src/data/catalogue.json`). Ce fichier conserve les informations et liens originaux, mais ses descriptions et étapes ne sont pas considérées comme une preuve réglementaire. Il ne donne pas de pièces justificatives fiables et la date de vérification est absente. Les 17 entrées sont par conséquent `pending`, ne sont pas publiées et ne déclenchent aucun calcul.

`src/data/review.json` trace l’état de recherche par identifiant : sources officielles consultées, date de consultation, période de validité relevée, réserves, nombre de cas de test et feu vert explicite de publication. Les champs de revue ne remplacent pas le texte juridique. Une source d'organisme aide à suivre la démarche réelle; la base juridique primaire doit être liée lorsqu'une règle de droit est décrite.

## Règle de publication

Une aide n'est publiable que lorsque les conditions exactes et les exceptions, l'organisme et le périmètre territorial, la démarche et son canal de dépôt, les documents prouvés par une source, la période de validité et la date de consultation sont établis. Une campagne annuelle expirée est datée et ne devient pas une règle générale. Les montants ne sont ajoutés que s'ils sont datés et accompagnés de la période source. Les désaccords de source et les cas non couverts restent visibles comme réserves.

La validation est distincte pour :

1. le contenu factuel et sa provenance;
2. la traduction d'une règle de droit en règle calculable;
3. chaque cas fictif de test, sa source, sa période et son résultat attendu;
4. la validation par un responsable métier/juridique.

Une fiche peut être publiée comme information sourcée sans calcul d'éligibilité. Le parcours `/mes-aides` ne calcule jamais un droit. Aucun jeu de critères n'est activé par sa seule présence dans une fiche.

## Première revue (consultation : 2026-11-23)

- **ASF** : la page CAF/ARIPA consultée confirme absence de condition de ressources et plusieurs voies de droit (parent isolé, enfant recueilli, avance/complément); le barème est publié au 1er avril 2026. La page de demande et les justificatifs pour chaque branche restent à formaliser. Source : `https://pension-alimentaire.caf.fr/usagers/aides-et-demarches/allocation-de-soutien-familial`.
- **Allocations familiales** : Service-Public confirme le seuil de deux enfants à charge en métropole et renvoie à d'autres règles de ressources. La fiche prototype est trop sommaire pour préciser âge, charge, résidence, garde alternée, seuils et démarche : en attente.
- **Prime d'activité** : âge minimal 18 ans confirmé; règles détaillées de résidence, revenus, étudiants/apprentis, périodes et déclaration à rechercher dans les sources légales et CAF/MSA : en attente.
- **Aides au logement** : APL/ALF/ALS sont des droits distincts avec critères propres; la demande CAF/MSA et pièces dépendent du foyer et du parcours. Ne pas afficher un paquet unique sans expliquer l'attribution : en attente.
- **Complément familial** : CAF confirme trois enfants à charge, dernier enfant d'au moins 3 ans, condition de ressources, versement automatique sous conditions; barème constaté pour 01/04/2026–31/03/2027 : en attente de revue juridique complète.
- **ARS** : les règles, ressources N-2, montants et démarches pour la rentrée 2026 sont consultés. Campagne à expirer après 2026; ne pas réutiliser ces montants pour 2027.
- **CMG** : le prototype fusionne CMG emploi direct et CMG structure. La réforme a des dates d'effet distinctes (01/09/2025 et 01/12/2025) et des cas monoparentaux/garde alternée. Il faut séparer les sous-parcours avant publication.
- **FSL** : le code postal ne suffit pas à déterminer l'autorité : Montpellier Méditerranée Métropole gère le dispositif pour ses 31 communes; le Département gère le reste. Les règles et règlements doivent être édités comme variantes territoriales séparées. Les sources consultées indiquent une saisine par travailleur social.
- **Aide à domicile** : accès conditionnel à des motifs d'événement; l'intervention est évaluée par un SAAD. En Hérault, la famille s'adresse directement à un opérateur autorisé et conventionné; liste/tarifs et critères de motif sont à revalider.
- **AVF** : critères et barème de la campagne Hérault 2026 consultés, dont QF de janvier, notification, durée et structure VACAF. Ce n'est pas une règle permanente.
- **Carte Jeune Région** : c'est un support donnant accès à plusieurs dispositifs; ne pas la fusionner avec ses aides juridiquement distinctes. Procédure/justificatifs 2026-2027 repérés.
- **Transports scolaires** : règles de desserte, âge scolaire, distance, secteur, régularité, autorité organisatrice, calendrier et éventuelle aide individuelle sont distincts. Page liO 2026-2027 consultée; la décision appartient à l'instruction régionale ou à l'autorité compétente.
- **AVES** : premier séjour d'été pour enfants de 6 à 16 ans dans le règlement CAF Hérault 2026, QF ≤ 700 €, places limitées et partenaire relais obligatoire. À distinguer d'AVE (enfants), AVS (vacances sociales) et AVF (famille). Campagne 2026 expirée.
- **Complémentaire santé solidaire** : parcours CPAM, période de référence, composition du foyer, pièces et plafonds au 01/04/2026 consultés. Les plafonds et périodes de référence sont à contrôler à nouveau à la demande.
- **ARIPA** : la fiche fusionne intermédiation et recouvrement; mécanismes et formulaires varient selon l'existence d'un titre et l'impayé. À distinguer de l'ASF.
- **AGE (anciennement AGEPI dans des pages anciennes)** : France Travail décrit des critères distincts emploi/formation, tranche d'âge, statut d'inscription, conditions d'indemnisation, délai et pièces. Le nom et le contenu du prototype sont périmés/incomplets.
- **Planning Familial 34** : service local de santé/orientation, et non prestation financière. Horaires, points d'accueil, rendez-vous et offre médicale doivent être actualisés avant diffusion.

Cette revue est un journal de recherche, pas une approbation de publication. Aucun profil de test d'éligibilité ni aucune règle exécutable ne sont encore validés (`testCases: 0`).

## Sources d'intégration étudiées

- **OpenFisca-France** : modèle socio-fiscal français avec variables, paramètres temporels, formules et tests. Le dépôt amont contient son propre modèle et indique une licence AGPL-3.0; il faut examiner la licence et confirmer qu'une variable couvre précisément l'aide, sa version temporelle et ses limites avant réutilisation. Le code n'est pas une décision opposable de l'organisme liquidateur. Préférer un adaptateur isolé et une version épinglée plutôt que recopier une règle sans provenance.
- **Aides Simplifiées** : le dépôt public trouvé est une application complète AdonisJS/Inertia/Vue/DSFR avec PostgreSQL, OpenFisca et LexImpact, sous AGPL-3.0. Il n'est pas un catalogue de règles importable tel quel. Les pages de méthode DINUM recommandent de relier conditions, exceptions, dates et textes, puis de séparer modèle de règle et modèle de parcours et de tester des cas types validés par métier. Une intégration de leurs simulateurs/API est à cadrer avec l'équipe propriétaire; pas d'import du dépôt dans ce MVP.
- **API Géo** : utile pour normaliser communes, départements, codes et appartenance territoriale; elle ne définit pas à elle seule le périmètre juridique d'une aide locale.
- **data·inclusion** : catalogue de services/structures d'insertion, pas moteur d'éligibilité aux prestations. Le jeu open data public est documenté comme hebdomadaire et sans données sensibles d'API; l'API complète est restreinte, contient des contacts de référents et demande des jetons/validation d'usage. N'utiliser que les champs pertinents et respecter le détail d'une fiche au clic.
- **Données Occitanie / collectivités** : source à choisir par jeu et producteur; conserver licence, date du dépôt, territoire, période et historique. Une ligne open-data ne constitue pas une règle d'attribution.

## Modèle relationnel cible

Le type canonique `Aid` est indépendant d'un fournisseur. Les contrats d'intégration sous `src/lib/integrations` portent les identifiants externes sans remplacer le contenu canonique. La structure PostgreSQL cible doit normaliser les sources, variantes territoriales, conditions, documents, étapes, révisions, règles et cas de test. La couche actuelle est JSON statique; aucun compte, secret, service ou backend n'est configuré.

## Registre prioritaire des sources

Le registre machine-readable est [`src/data/source-registry.json`](../src/data/source-registry.json). Pour chaque entrée il indique le rôle, l'état observé, la version/date connue, les droits lorsqu'ils ont pu être établis, le nombre d'enregistrements effectivement importés et les limites. La politique de comptage exclut les simples consultations, pages catalogue, dépôts de code et métadonnées. Les 17 identifiants historiques du prototype sont conservés, 17 sources prioritaires sont inventoriées, les 17 aides restent en revue et zéro fiche n'est approuvée/publiée. Le snapshot API Géo effectivement récupéré fournit 13 départements, 4 446 communes uniques et 4 482 couples commune/code postal; ce sont des données géographiques, pas des aides. Les 228 lignes et 152 lignes catégorisées « Aides » du portail Occitanie restent des métadonnées uniquement : aucune ligne du dataset n'a été extraite.

Les sources nationales de calcul et de méthode restent des références d'architecture, sans activation de règles. Le dataset Région n'a pas été téléchargé faute d'acceptation des conditions. Le CSV La Poste a été reçu dans une exécution locale antérieure, mais l'ancien parseur a échoué sur son schéma et n'a pas enregistré le contenu brut; le nombre de lignes de cette réponse n'a pas été conservé. Les appels directs depuis l'environnement actuel échouent avec `EACCES`. Toute extraction future conserve immédiatement le fichier brut, son URL/version, licence, empreinte, date de récupération, transformations et décisions de déduplication.
