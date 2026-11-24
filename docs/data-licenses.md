# Données réutilisées et attributions

État du contrôle : 23 novembre 2026. Les snapshots sont des extractions datées et ne remplacent pas les versions courantes des producteurs. Ils ne contiennent pas de profils ni de dossiers de personnes accompagnées.

## Aides et appels à projets de la Région Occitanie

- Producteur : Région Occitanie.
- Jeu : [Aides et appels à projets de la Région Occitanie](https://data.laregion.fr/explore/dataset/aides-et-appels-a-projets-de-la-region-occitanie/).
- Licence indiquée sur le portail : Licence Ouverte / Open Licence 2.0 (Etalab). Le portail demande d'accepter ses conditions générales et la licence pour télécharger les exports. Le snapshot présent dans ce dépôt a été importé après acceptation explicite de ces conditions.
- Attribution : « Source : Région Occitanie — Aides et appels à projets, données mises à jour le 30 octobre 2026 ; snapshot récupéré le 23 novembre 2026 (heure locale). »
- Le snapshot local comporte 229 lignes, dont 153 de type « Aides ». La page du portail consultée lors de ce contrôle affichait 228 enregistrements, dont 152 « Aides ». Cet écart doit être vérifié au prochain import avant de traiter le snapshot local comme la version la plus récente.
- Les mentions factuelles du jeu et les URL officielles sont conservées. Les pages HTML, images et logos des dispositifs ne sont pas copiés comme ressources.

## Géographie administrative — API Géo

- Service : [API Découpage administratif (API Géo)](https://www.data.gouv.fr/dataservices/api-decoupage-administratif-api-geo) et [documentation API Géo](https://geo.api.gouv.fr/decoupage-administratif).
- Producteurs et partenaires indiqués par la fiche data.gouv.fr : DINUM, INSEE et OpenStreetMap. Les données sont déclarées « sous licences Open Data » ; la fiche ne nomme pas une licence unique pour tous les champs. Les données administratives reprises dans le snapshot sont les noms et codes officiels, les rattachements région/département/EPCI et les correspondances postales.
- Attribution : « Source : API Géo (Etalab / DINUM), référentiels administratifs INSEE ; snapshot récupéré le 23 novembre 2026 (heure locale). »
- Le snapshot contient 13 départements et 4 446 communes d'Occitanie. La relation postale ne suffit pas à déterminer l'application juridique d'une aide.

## Codes postaux — La Poste

- Producteur : La Poste. Jeu : [Base officielle des codes postaux](https://www.data.gouv.fr/datasets/base-officielle-des-codes-postaux).
- Licence indiquée par data.gouv.fr : Licence Ouverte / Open Licence 2.0.
- Date de mise à jour publiée pour la source : 9 juillet 2023. Attribution : « Source : La Poste — Base officielle des codes postaux, mise à jour du 9 juillet 2023 ; snapshot récupéré le 23 novembre 2026 (heure locale). »
- Les 39 192 lignes d'origine sont conservées. Les 4 482 paires distinctes commune/code postal d'Occitanie sont normalisées ; les libellés d'acheminement et lignes 5 alternatives sont gardés. Les répétitions légitimes de paires ne sont pas supprimées.
- Ce dataset ne publie pas les contours des codes postaux. La date de mise à jour de 2023 impose un contrôle de fraîcheur avant d'en faire une source actuelle d'adressage.

## Références sans données réutilisées

Les dépôts OpenFisca France, Aides Simplifiées et Aides Jeunes sont référencés dans le registre des sources, mais leur code et leurs jeux de règles ne sont pas copiés dans l'application. Leurs licences ne s'appliquent donc pas au code Solomam du seul fait de les citer.
