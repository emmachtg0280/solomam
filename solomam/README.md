# Solomam — base fonctionnelle V3

Ouvrir `index.html` avec Live Server dans VS Code. Aucun build nécessaire.

## Organisation
- `index.html` : structure et navigation (catalogue / mes démarches)
- `styles.css` : styles ; les variables en fin de fichier servent de base pour appliquer plus tard le système visuel inspiré de Grow Therapy
- `app.js` : catalogue de 17 aides/services, filtres, fiches et checklist locale

## Navigation
- Accueil : catalogue visible immédiatement, grille compacte sur ordinateur, organismes, recherche, filtres
- Header : Aides / Organismes / Mes démarches, personnalisation facultative
- Mes démarches : vue distincte, non répétée sur l’accueil
- Détail : panneau latéral, conditions, étapes, lien officiel

## État réel
- Pas de backend ni connexion aux organismes
- Pas de calcul fiable d'éligibilité ; pas de documents téléversés
- Suivi uniquement dans localStorage
- Libellés des organismes provisoires : pas de logos officiels intégrés
- Sources listées dans `index.html`; vérifier chaque fiche avant publication

## Étape suivante
Réutiliser ces composants et données dans Next.js (ou conserver ce prototype jusqu'à validation UX), puis appliquer les styles Grow Therapy sans dépendre de ses assets ni copier son code propriétaire.
