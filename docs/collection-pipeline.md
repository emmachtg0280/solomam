# Pipeline de collecte et de qualification

État vérifié le 23 novembre 2026 dans Codex. La branche de travail demandée n'a pas pu être créée : l'accès au répertoire Git `.git/refs/heads` est en lecture seule dans cet environnement. Le dépôt est resté sur `data/catalogue-enrichment`; les fichiers de travail sont modifiés dans l'espace autorisé.

## Architecture en place

Le pipeline réutilise les outils existants :

1. `data:import` collecte le dataset Région Occitanie via l'API Explore v2.1, les communes via API Géo, et le fichier postal CSV après lecture des métadonnées data.gouv.fr. Il conserve les réponses brutes et écrit `import-report.json` avec compteurs, erreurs, état du consentement et réemploi éventuel des snapshots locaux.
2. `data:qualify` normalise chaque ligne du snapshot régional en décision liée à l'index, au hash du contenu, à l'extrait et à l'URL officielle. Les décisions manuelles connues restent dans le script de qualification; le dataset seul ne vérifie ni critères ni période.
3. `data:integrate` ajoute les 23 candidates régionales au catalogue comme fiches en attente et préserve les fiches d'information déjà vérifiées.
4. `data:registry:departments` inscrit les points de découverte régionaux/départementaux et met à jour la matrice sans déclarer examinés les territoires sans revue de leurs règlements.
5. `data:integrate:herault-local` et `data:integrate:fsl30` intègrent de manière déterministe des candidates locales sourcées; seules les informations dont les faits essentiels sont vérifiés passent le contrôle de publication d'information. Le statut de procédure reste séparé.

L'importeur réessaie jusqu'à trois fois les erreurs réseau de connexion et les réponses HTTP 429/5xx, en respectant `Retry-After` avec un plafond. Il ne réessaie pas `EACCES`/`EPERM`, les erreurs DNS, les refus d'accès ni les autres 4xx. L'erreur conserve le code, l'URL et le nombre d'essais. `data:test` comprend un cas transitoire et confirme qu'une permission refusée est remontée sans boucle de retries.

## Sources et imports

Les seules intégrations structurées directement connectées par l'importeur sont :

- Région Occitanie : API Explore, JSON paginé; consentement préalable du portail obligatoire.
- API Géo : API JSON de géographie et codes postaux.
- data.gouv.fr puis La Poste : métadonnées JSON et ressource CSV; l'import accepte UTF-8 et Windows-1252 et conserve les zéros de tête.

Les pages détaillées de dispositifs, règlements PDF (CAF, Département, Métropole et communes) et services sont encore sélectionnées et examinées individuellement. Aucun export API CAF ni annuaire data·inclusion n'est connecté. Le registre contient 26 points de découverte (Département + Caf dans chacun des 13 départements), 10 pages/sources spécifiques Hérault, deux sources ADHL Gard vérifiées et un RDAS officiel d'Ariège dont la version en vigueur reste incertaine. Les 26 points sont explicitement marqués « découverte uniquement » et leurs URLs locales hors Hérault ne sont pas réputées testées. Une page de découverte ne sert pas à justifier les règles d'une aide.

## État régional Occitanie

Snapshot conservé : 229 lignes, dont 153 entrées de type « Aides ». Répartition enregistrée : 23 pertinentes, 41 hors cible, 2 expirées et 87 à examiner. Les 66 décisions non-pendantes proviennent de pages officielles examinées précédemment et sont datées dans le registre; la passe actuelle n'a pas ouvert les 87 pages en attente et ne les compte pas comme traitées. Les fiches candidates restent soumises à vérification des règles, période, documents et procédure; aucune candidate régionale nouvelle n'est publiée par cette passe.

La collecte réseau live exécutée le 23 novembre a échoué avant une réponse HTTP pour les trois services. Node a remonté `ENOTFOUND` pour `data.laregion.fr`, `geo.api.gouv.fr` et `www.data.gouv.fr`. Les appels DNS équivalents depuis PowerShell ont renvoyé `Access is denied`. Il n'y a donc pas de preuve d'une erreur HTTP fournisseur, d'un refus d'authentification ou d'une acceptation/refus de conditions. L'environnement empêche actuellement la résolution réseau; le diagnostic ne permet pas d'affirmer si cela vient seulement de la sandbox ou d'une politique hôte. Aucun contournement n'a été tenté.

Malgré ces échecs, l'import a réutilisé le snapshot API Géo (13 départements, 4 446 communes, 4 482 correspondances postales) et retraité le CSV postal local (39 192 lignes source, 4 482 correspondances Occitanie, encodage Windows-1252). Les trois erreurs live sont visibles dans `src/data/imports/import-report.json`. Une collecte régionale fraîche reste à exécuter dans un environnement dont le DNS réseau normal est autorisé.

## Hérault : sources examinées et candidates

- **AFIE** : la section 98–99 du RDAS Hérault décrit l'aide à la mobilité, à la garde et à la reprise d'activité pour certains bénéficiaires du RSA, les fenêtres de dépôt et l'instruction par des organismes habilités/commission. Une fiche AFIE est intégrée et publiée au niveau de l'information générale. Le montant est volontairement omis : les plafonds par dépense de l'annexe n'ont pas été normalisés. La procédure reste incomplète et la publication de démarche n'est pas activée.
- **Secours et prêts sociaux Caf Hérault** : la page officielle confirme les formes d'aide et les situations étudiées. Le lien RIAS 2026 aboutit à une page de maintenance lors de l'extraction; montant, critères généraux et dossier restent en attente. Candidate intégrée, non publiée.
- **Bouclier social Petite Enfance de Montpellier** : les documents municipaux 2025 documentent les critères de famille monoparentale, enfant de moins de 3 ans, horaires atypiques, quotient familial, CMG et organisme affilié. La page actuelle n'a pas pu être ouverte (405) et le règlement trouvé est daté 2025; maintien et campagne 2026 à confirmer. Candidate intégrée, non publiée.
- Les deux fiches FSL déjà présentes demeurent séparées : FSL Département hors des 31 communes de Montpellier Méditerranée Métropole et FSL métropolitain.
- Le CCAS de Montpellier confirme l'existence d'aides facultatives pour les ménages accompagnés par un travailleur social, mais cette page générale ne suffit pas à créer une fiche de prestation.
- **FSL Gard — volet Accès** : la page ADHL confirme les dépenses couvertes, le seuil de taux d'effort (<33 %), le critère DPE A–E, l'instruction par l'ADHL et le versement par le Département. Le barème officiel est daté du 1er avril 2026. Une fiche d'information est intégrée et publiée; sa procédure reste incomplète et distincte des volets FSL Maintien et Charges.

## Registre et couverture départementale

Le registre indique pour chaque source l'organisme, le département, l'URL, le type, une fréquence potentielle, les conditions de réutilisation à contrôler, l'accessibilité, la dernière collecte, le volume intégré et les limites. Après la collecte FSL Gard, le Gard est marqué `partially_integrated` pour le seul volet Accès. L'Ariège reste `identified`: le RDAS trouvé décrit le FUH/FSL mais indique une adoption en 2022; sa validité actuelle et le règlement intérieur courant doivent être confirmés. L'Aude, l'Aveyron, la Haute-Garonne, le Gers, le Lot, la Lozère, les Hautes-Pyrénées, les Pyrénées-Orientales, le Tarn et le Tarn-et-Garonne restent au stade des points de découverte. Aucun de ces territoires n'est décrit comme couvert ou exhaustif.

## Commandes

```powershell
npm.cmd run data:import
npm.cmd run data:qualify
npm.cmd run data:integrate
npm.cmd run data:registry:departments
npm.cmd run data:integrate:herault-local
npm.cmd run data:integrate:fsl30
npm.cmd run data:refresh-local-catalogue
```

`data:import` peut terminer en erreur lorsqu'une source live échoue, même si les snapshots disponibles sont correctement réutilisés. Pour des tests/reconstructions sans réseau, `data:qualify` et les commandes d'intégration s'appuient sur le snapshot régional versionné.

## Travail restant

- Examiner individuellement les 87 pages régionales en attente; enrichir les raisons d'attente avec le blocage constaté pour chaque page.
- Réexécuter l'import live une fois le DNS de l'environnement autorisé et accepter les conditions du portail régional avant l'appel.
- Extraire le règlement Caf Hérault 2026 et les annexes de plafonds AFIE; confirmer le Bouclier social 2026, son dossier courant et les organismes affiliés.
- Remplacer les 22 points de découverte départementaux restants hors Gard/Hérault par des pages officielles détaillées, puis collecter leurs exports et règlements accessibles.
- Tester l'intégrité après reconstruction complète et ajouter des tests directs d'idempotence des scripts de qualification et d'intégration régionale.

