# Imports des sources officielles

## Exécuter depuis un terminal de confiance

Les imports n'ajoutent aucune dépendance et utilisent `fetch` fourni par Node.js 20+. Depuis un terminal local VS Code dont la politique réseau autorise ces hôtes :

Après avoir pris connaissance des conditions d'utilisation du portail Région et accepté ces conditions pour ce téléchargement, lancer dans PowerShell :

```powershell
$env:SOLOMAM_REGION_TERMS_ACCEPTED = "1"
npm run data:import
```

Sans cette variable explicite, l'import Région s'arrête avec `CONSENT_REQUIRED`; les autres sources indépendantes sont tout de même tentées.

Le script n'écrase ni le catalogue métier ni les statuts de publication. Il écrit les réponses brutes et les projections en brouillon sous `src/data/imports/`, et un `import-report.json` décrit les volumes et erreurs. Ne publier aucun enregistrement importé avant relecture de ses champs et vérification de sa page officielle. Les enregistrements de type « Aide » dont le public n'est pas explicite restent en révision manuelle. Les appels à projets et audiences explicitement organisationnelles sont écartés des fiches d'aide.

## Sorties

- `occitanie/raw/dataset.json` : métadonnées, schéma disponible et lignes renvoyées par l'API Huwise v2.1.
- `occitanie/normalized/aids.json` : candidats dédupliqués par titre, public, URL, dates de validité et statut de revue. Conditions, justificatifs et démarches ne sont remplis que s'ils existent comme champs structurés dans la source et restent à vérifier par référence officielle.
- `geography/raw/communes-occitanie.json` : snapshot API Géo des départements et communes, avec code INSEE, EPCI et codes postaux.
- `geography/normalized/communes-occitanie.json` : communes normalisées; les erreurs La Poste ne font pas échouer ce flux.
- `geography/normalized/geo-api-postal-codes-occitanie.json` : correspondances postales issues directement des `codesPostaux` API Géo, identifiées séparément de La Poste.
- `geography/raw/la-poste-hexasmal.csv` : octets CSV La Poste conservés avant le décodage et le parsing, même si une étape de normalisation échoue.
- `geography/raw/postal-codes-dataset.json` : métadonnées, encodage détecté, colonnes et lignes CSV analysées.
- `geography/normalized/postal-codes-occitanie.json` : correspondances La Poste filtrées par codes INSEE API Géo lorsque disponibles.
- `import-report.json` : compteurs pour chaque flux, consentement Région séparé des erreurs techniques, snapshot réutilisé s'il existe, et erreurs qualifiées (`DNS_ERROR`, `ENVIRONMENT_NETWORK_DENIED`, `HTTP_ERROR`, `CONTENT_TYPE_ERROR`, `JSON_PARSE_ERROR`, `RESPONSE_SHAPE_ERROR`, `SCHEMA_ERROR`, ou assertion géographique).

Le script vérifie automatiquement les codes INSEE de Montpellier (`34172`), Frontignan (`34108`), Sète (`34301`) et Béziers (`34032`), ainsi que le rattachement des communes aux 13 départements de la région Occitanie (`76`). Les correspondances `codesPostaux` de l'API Géo et celles de La Poste sont comptées séparément. La Base officielle des codes postaux de La Poste affichait une dernière mise à jour du 9 juillet 2023 à la revue ; son horodatage source est séparé de celui du téléchargement.

Le fichier reçu de La Poste utilise les colonnes `#Code_commune_INSEE`, `Nom_de_la_commune`, `Code_postal`, `Libellé_d_acheminement`, `Ligne_5`. Le parseur enlève le `#` et les accents uniquement pour reconnaître les noms de colonnes. Il détecte l'UTF-8 strict, puis retombe sur Windows-1252; les codes restent des chaînes, y compris `2A`/`2B` pour les codes INSEE corses. Les doublons de correspondance sont regroupés par couple code INSEE/code postal, et les libellés/lieux-dits distincts restent conservés en variantes.

Lors du premier import local, l'API Géo a réellement retourné et écrit 13 départements et 4 446 communes. L'ancien code appelait ensuite La Poste dans la fonction géographique : le `SCHEMA_ERROR` La Poste faisait échouer toute la fonction et masquait les compteurs Geo; la couche supérieure rappelait La Poste, d'où les deux erreurs identiques. Le code corrigé sépare ces flux et relit/normalise le snapshot Geo déjà présent si un rafraîchissement réseau échoue.

## Diagnostic réseau observé dans l'environnement actuel

Lors d'un import précédent du 23 novembre 2026, `Resolve-DnsName` avait renvoyé des enregistrements. Lors de la relance du 23 novembre 2026 dans Codex, Node a cette fois renvoyé `ENOTFOUND` pour les trois hôtes (`data.laregion.fr`, `geo.api.gouv.fr`, `www.data.gouv.fr`) avant toute réponse HTTP; `Resolve-DnsName` depuis PowerShell a répondu `Access is denied`. L'importeur a alors réutilisé les snapshots géographiques et postaux disponibles. Ces observations ne montrent ni endpoint obsolète, ni réponse HTTP, ni refus d'authentification ou de conditions d'accès. Elles sont compatibles avec une restriction DNS/réseau de l'environnement, mais ne permettent pas d'en attribuer précisément la cause à la sandbox ou à la politique hôte. Aucun contournement, proxy alternatif ou élévation de privilèges n'a été tenté.

Si le terminal VS Code local hors de l'environnement Codex dispose d'un accès autorisé à ces sources, accepter d'abord les conditions Région et relancer la commande ci-dessus. Le terminal local n'est pas piloté par Codex ici et cette réussite reste à vérifier par l'opérateur. Si les appels échouent également, le rapport qualifie l'erreur réseau précise disponible dans Node (`cause.code`) ; demander alors l'accès normal aux destinations à l'administrateur réseau concerné.

## PostgreSQL

Aucun service ni client PostgreSQL n'a été trouvé localement, et les ports `127.0.0.1:5432` et `5433` ne répondent pas. Le schéma `database/schema.sql` est donc une cible de conception non appliquée. Pour une base locale, installer et démarrer PostgreSQL séparément, créer la base et appliquer le schéma avec `psql -v ON_ERROR_STOP=1 -d <base> -f database/schema.sql`; renseigner ensuite un adaptateur de dépôt et des identifiants locaux hors Git. Le schéma n'est pas encore un import PostgreSQL prêt à l'emploi et aucun service externe n'a été créé.
