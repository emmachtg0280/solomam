# Solomam — état de validation du catalogue

État constaté le 23 novembre 2026 sur la branche `data/catalogue-enrichment`.

## Publication

- 45 fiches canoniques conservées, sans doublon d'identifiant. L'ancienne fiche « Aides au logement » est conservée uniquement dans l'audit comme fiche remplacée.
- 10 fiches d'information publiables : les sept fiches nationales déjà validées, plus APL, ALF et ALS.
- 0 parcours de demande déclaré complet. Les éléments d'étapes affichés sont uniquement les étapes documentées et sourcées; l'interface précise si le parcours n'est pas exhaustif.
- 35 fiches demeurent hors du catalogue public : 22 aides régionales encore à examiner sur la validité et les critères complets, deux variantes FSL en attente du règlement applicable et 11 autres fiches initiales ou candidates sans preuves suffisantes au regard des contrôles obligatoires.
- Aucun moteur ne calcule l'éligibilité. Les filtres du catalogue ne constituent pas une décision de droit.

Une fiche d'information validée exige des faits sourcés pour le statut du dispositif, le territoire, le public et les conditions essentielles. La validation du parcours est indépendante et exige une procédure, un organisme instructeur, un canal de dépôt et des justificatifs vérifiés. Une date de consultation ne remplace pas la date de mise à jour ou d'effet d'une règle; les deux sont conservées séparément.

## Fiches publiées

| Fiche | Éléments vérifiés et limites affichées |
| --- | --- |
| ASF | Vie seule, situation de contribution/pension et démarches Caf/MSA documentées. La page Service-Public présente une incohérence entre 200,78 € et 201,78 €; le montant est donc marqué en conflit et ne figure pas parmi les faits validés. Vérifier le seuil auprès de la caisse. |
| Allocations familiales | Nombre et âge des enfants, résidence, modulation des ressources et cas de résidence alternée. Première ouverture et pièces exhaustives non consolidées. |
| Prime d'activité | Source publiée pour les salariées/fonctionnaires; l'information ne couvre pas les règles propres aux indépendantes, étudiantes, apprenties ou stagiaires. Conditions de séjour selon la situation. |
| Complémentaire santé solidaire | Affiliation, plafonds datés, portée, démarches générales et renouvellement. Les pièces exigées et la définition complète du foyer restent à vérifier. |
| RSA parent isolé | Définition, ressources, résidence/séjour et période de majoration. Les règles de calcul ne sont pas simulées; formulaire, pièces et parcours local restent à revalider. |
| PreParE | Âge, interruption/réduction, trimestres, montants datés et demande. Durées/cumuls selon les branches de situation à vérifier. |
| AEEH | Critères d'âge/handicap, limite de revenu propre de l'enfant, montant daté et formulaire MDPH. Compléments individualisés et téléservice dépendant du département. |
| APL | Public locataire/résident, résidence principale, logement conventionné et ressources datées. Les conditions particulières, branches MSA et pièces selon le dossier restent à compléter. |
| ALF | Situations familiales prévues, priorité d'examen après APL, logement et ressources. Les pièces et parcours selon le régime restent à compléter. |
| ALS | Aide examinée si ni APL ni ALF, logement et ressources. Les justificatifs et parcours des personnes en établissement ainsi que la branche MSA restent à compléter. |

## Couverture et points en attente

Le snapshot régional contient 153 entrées candidates: 22 qualifiées pertinentes, 28 hors cible, 2 expirées et 101 à examiner manuellement. Les 76 autres enregistrements du dataset sont exclus par les filtres préalables. Une qualification de public individuel ne confirme pas à elle seule la validité réglementaire, l'éligibilité ou le parcours.

Les procédures du FSL de l'Hérault sont juridiquement séparées entre le Département hors des 31 communes de Montpellier Méditerranée Métropole et la Métropole. La page de la Métropole confirme un passage par travailleur social, évaluation et examen local; le règlement actuellement applicable, les conditions de ressources, les barèmes et pièces précises n'ont pas été établis ici. La page du Département ne fournit pas les règles détaillées de dépôt.

Les fiches APL, ALF et ALS sont maintenant séparées. L'ancienne entrée « Aides au logement » est conservée dans `review.json` comme audit remplacé avec références vers les trois nouveaux identifiants. Les informations sont publiables, mais les procédures restent explicitement partielles : les branches Caf/MSA, les cas en établissement et les justificatifs affichés selon le dossier demandent une vérification supplémentaire. Les pages des prestations ont été vérifiées le 1er juillet 2026; la page de demande de logement le 2 mars 2026; consultation enregistrée le 23 novembre 2026. Aucune date de vérification de page n'est présentée comme date d'effet réglementaire.

La qualification des 101 enregistrements régionaux restants, l'extraction du règlement d'action sociale Caf 34 en vigueur et les aides des douze autres départements d'Occitanie restent à poursuivre. Les versions et dates d'effet devront être contrôlées pour chaque publication. Aucun appel à OpenFisca, Aides Simplifiées, API Géo ou data·inclusion n'est activé par ce changement; aucun calcul d'éligibilité automatisé n'est déployé.

## Sources nationales vérifiées pour cette publication

- [Service-Public — ASF, page vérifiée le 1er avril 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F815), consultée le 23 novembre 2026.
- [Service-Public — Allocations familiales, page vérifiée le 1er juin 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F13213), consultée le 23 novembre 2026.
- [Service-Public — Prime d'activité salarié ou fonctionnaire, page vérifiée le 1er juin 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F2882), consultée le 23 novembre 2026.
- [Ameli — Complémentaire santé solidaire, mise à jour le 18 septembre 2026](https://www.ameli.fr/assure/droits-demarches/difficultes-acces-droits-soins/complementaire-sante/complementaire-sante-solidaire), consultée le 23 novembre 2026.
- [Service-Public — RSA parent isolé, page vérifiée le 1er avril 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F15553), consultée le 23 novembre 2026.
- [Service-Public — PreParE, page vérifiée le 1er juin 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F32485), consultée le 23 novembre 2026.
- [Service-Public — AEEH, page vérifiée le 1er juin 2026](https://www.service-public.gouv.fr/particuliers/vosdroits/F14809) et [formulaire MDPH](https://www.service-public.gouv.fr/particuliers/vosdroits/R19993), consultés le 23 novembre 2026.
- [Service-Public — APL](https://www.service-public.gouv.fr/particuliers/vosdroits/F12006), [ALF](https://www.service-public.gouv.fr/particuliers/vosdroits/F13132), [ALS](https://www.service-public.gouv.fr/particuliers/vosdroits/F1280), pages vérifiées le 1er juillet 2026 et consultées le 23 novembre 2026; [demande d'aide au logement](https://www.service-public.gouv.fr/particuliers/vosdroits/R1292), page vérifiée le 2 mars 2026.

## Contrôles

`npm run data:test` vérifie les références de provenance, les portes de publication séparées, le rejet des informations non vérifiées ou mal sourcées, la séparation des FSL et des trois aides au logement, la migration de l'ancien stockage en favoris et les imports géographiques et régionaux. Les URL des fiches publiées ont été ouvertes sur leurs sources officielles durant la vérification; cela ne garantit pas leur disponibilité permanente.

Les données opérationnelles demeurent en JSON versionné. Aucun serveur PostgreSQL local n'est configuré. Aucun identifiant utilisateur, donnée personnelle ou profil sensible n'est ajouté.
