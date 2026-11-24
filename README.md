# Solomam

Application Next.js App Router en TypeScript strict, Tailwind CSS et composants natifs accessibles. Le prototype conservé dans [`solomam/`](./solomam/) n'est pas modifié.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm run lint
npm run typecheck
npm run build
```

## Données

Le catalogue source est dans `src/data/catalogue.json`; les preuves, périodes et réserves de publication sont dans `src/data/review.json`. Les sources prioritaires et leur statut réel (consultée, documentée, extraite, importée) sont tracées dans [`src/data/source-registry.json`](./src/data/source-registry.json). Les 17 entrées du prototype sont en attente et aucune fiche n'est publiée. Un snapshot API Géo comporte 4 446 communes et 4 482 correspondances postales; aucun dispositif externe n'est encore normalisé ou publié. Le journal de gouvernance et les résultats de la première recherche sont dans [`docs/data-governance.md`](./docs/data-governance.md). Les calculs d'éligibilité ne sont pas implémentés.

La cible relationnelle PostgreSQL/RLS est documentée dans [`database/schema.sql`](./database/schema.sql) et n'est pas appliquée à un service.

Pour tenter les imports officiels depuis un terminal local autorisé et après acceptation des conditions du portail Région, suivre [`docs/data-import-runbook.md`](./docs/data-import-runbook.md). L'importeur n'active aucune publication.
