# Qualification du catalogue régional Occitanie

Dernière qualification manuelle : 23 novembre 2026. Le snapshot source est conservé dans `src/data/imports/occitanie/raw/dataset.json` et le registre des décisions dans `src/data/imports/occitanie/normalized/qualifications.json`.

## État des données

| Mesure | Résultat |
| --- | ---: |
| Lignes source récupérées | 229 |
| Lignes dont `type` vaut `Aides` | 153 |
| Hors type aide dans cette revue | 76 |
| `relevant` après consultation de pages officielles | 22 |
| `not_relevant` confirmé par la page officielle | 28 |
| `expired` selon la période explicitement indiquée | 2 |
| À examiner manuellement faute de preuve suffisante | 101 |
| Cartes nouvelles publiées | 0 |

Une page régionale détaillée et la fiche source ont été consultées pour les 52 décisions qui ne sont pas en attente. Les 22 éléments pertinents sont des pistes de catalogue, pas des fiches prêtes à publier : la normalisation complète des pièces, des procédures de dépôt et de suivi, ainsi que la validité annuelle reste à faire. Ces 22 éléments sont maintenant projetés dans le catalogue canonique avec le statut `pending`; ils ne sont pas publiés. Les 101 autres enregistrements demeurent en revue manuelle plutôt que d'être déclarés non pertinents sur le seul titre.

Une absence de dates de validité dans la ligne du dataset n'est pas interprétée comme une aide active. `date_publication` et `date_modification` sont conservées comme métadonnées éditoriales et jamais prises pour les dates d'application.

Le dataset d'origine ne fournit pas d'identifiant de ligne stable dans le snapshot. Chaque entrée est donc rattachée à son index dans le snapshot, à une empreinte SHA-256 du contenu brut et à un identifiant dérivé. Une réimportation de contenu modifié produira une nouvelle empreinte; l'index reste un lien vers la version brute enregistrée.

## Pages officielles consultées

Toutes les sources ci-dessous sont des pages de la Région Occitanie. La date de consultation enregistrée est le 23 novembre 2026.

| Décision | Page officielle | Vérification principale |
| --- | --- | --- |
| Pertinent | [Aide à la lecture de loisirs](https://www.laregion.fr/Aide-a-la-lecture-de-loisirs) | Lycéens détenteurs de la Carte Jeune Région; 20 €; usage en librairie affiliée |
| Pertinent | [Pass Mutuelle Étudiant](https://www.laregion.fr/Pass-Mutuelle-Etudiant-e) | Étudiants boursiers sans CSS ni couverture complémentaire alternative |
| Pertinent | [Rémunération des stagiaires de la formation professionnelle](https://www.laregion.fr/Remuneration-des-stagiaires-de-la-formation-professionnelle) | Stagiaires demandeurs d'emploi, avec critères d'âge et d'indemnisation |
| Pertinent | [Incitation financière aux covoitureurs](https://www.laregion.fr/Campagne-d-incitation-financiere-aux-covoitureurs) | Covoitureurs adultes et opérateurs partenaires |
| Pertinent | [Aide au mérite](https://www.laregion.fr/Aide-au-merite) | 900 €, bourse, mention très bien, dépôt Mes Aides en Ligne |
| Pertinent | [Vélo adapté PMR](https://www.laregion.fr/Eco-cheque-mobilite-Bonus-velo-adapte-PMR) | Adultes résidents en Occitanie, preuve de handicap; plafond de 1 000 € |
| Pertinent | [Hébergement en centre AFPA](https://www.laregion.fr/Hebergement-en-centre-AFPA-Occitanie) | Hébergement financé pour des demandeurs d'emploi en formation PRF |
| Pertinent | [Éco-chèque vélo à assistance électrique](https://www.laregion.fr/Eco-cheque-mobilite-velo-a-assistance-electrique) | 200 €, condition de RFR, vendeur régional, justificatifs et portail |
| Pertinent | [loRdi](https://www.laregion.fr/Aide-a-l-acquisition-d-un-ordinateur-portable-loRdi) | Lycées numériques et aide modulée selon établissement/ressources; calendrier 2026–2027 |
| Pertinent | [Projet d'écriture des auteurs](https://www.laregion.fr/Livre-Aide-individuelle-aux-auteurs-et-aux-autrices-Projet-d-ecriture) | Aide individuelle professionnelle, résidence et publications antérieures requises |
| Pertinent | [Bons Plans Carte Jeune](https://www.laregion.fr/Les-Bons-Plans-ou-les-Je-m-engage-de-la-Carte-Jeune-Region) | Offres gratuites ou à tarif préférentiel pour les jeunes titulaires |
| Pertinent | [Bourses sanitaires et sociales](https://www.laregion.fr/bourses-etudes-sanitaires-sociales) | Formations et centres autorisés/agréés par la Région; incompatibilités mentionnées |
| Pertinent | [Pacte pour l'Embauche](https://www.laregion.fr/pacte-embauche) | Orientation des personnes en recherche/reprise d'emploi vers garde, logement, mobilité et formation |
| Pertinent | [Solutions logement des moins de 30 ans](https://www.laregion.fr/Solutions-hebergement-et-logement-jeunes) | Service d'information, d'orientation et d'accompagnement, pas une allocation unique |
| Pertinent | [Premier équipement professionnel](https://www.laregion.fr/Premier-equipement-professionnel) | Lycéens professionnels, Carte Jeune Région et formation éligible |
| Pertinent | [Licence sportive UNSS](https://www.laregion.fr/Aide-a-l-acquisition-d-une-licence-sportive-UNSS) | 15 €, Carte Jeune Région et association sportive UNSS dans le lycée |
| Pertinent | [Mouv'Occitanie étudiants](https://www.laregion.fr/Aides-Mouv-Occitanie) | Mobilités étudiantes sélectionnées par l'établissement |
| Pertinent | [Formation premiers secours citoyen](https://www.laregion.fr/Formation-premiers-secours) | PSC gratuite pour les jeunes titulaires de la Carte Jeune Région |
| Pertinent | [Prêt des manuels scolaires](https://www.laregion.fr/Pret-des-manuels-scolaires) | Prêt gratuit aux lycéens éligibles titulaires de la Carte Jeune Région |
| Pertinent | [Aide à la garde d'enfants](https://www.laregion.fr/Aide-a-la-Garde-d-Enfants) | Parents, enfant à charge de moins de 10 ans et critères de formation/reprise d'emploi; 80/250 € selon situation |
| Pertinent | [Écochèque vélo pour lycéen boursier entrant en seconde](https://www.laregion.fr/Ecocheque-mobilite-lyceen-boursier) | 50% plafonné à 200 €; période annuelle septembre–janvier annoncée, campagne courante à confirmer avant publication |
| Pertinent | [Éco-chèque Bonus Forfait Mobilités Durables](https://www.laregion.fr/Eco-cheque-mobilite-Bonus-forfait-mobilite-durable) | Personne majeure, résidente d'Occitanie, bénéficiaire du FMD employeur et sous conditions de ressources; barème courant à extraire du règlement |
| Non pertinent | [Accompagnement transport maternelle](https://www.laregion.fr/Accompagnement-des-eleves-de-maternelle-dans-les-transports-scolaires) | Les communes, intercommunalités ou associations déposent et reçoivent la subvention |
| Non pertinent | [Mouv'Occitanie jeunes en insertion](https://www.laregion.fr/Aide-a-la-mobilite-internationale-des-jeunes-en-insertion-avec-Mouv-Occitanie) | Les organismes membres du consortium sont demandeurs; les jeunes participent à des mobilités organisées |
| Non pertinent | [Mouv'Occitanie élèves sanitaire/social](https://www.laregion.fr/Aide-a-la-mobilite-internationale-des-eleves-du-sanitaire-et-social-avec-Mouv) | Les structures membres sont demandeuses et les déplacements portent sur un groupe d'apprenants |
| Non pertinent | [Mobilité européenne des personnels](https://www.laregion.fr/Mobilite-europeenne-des-personnels-des-formations-sanitaires-et-sociales) | Aide réservée aux personnels de structures membres |
| Non pertinent | [Clubs sportifs « Ambassadeur Sport »](https://www.laregion.fr/Soutien-des-clubs-sportifs-Occitanie-Ambassadeur-Sport) | Aide aux clubs et à leurs projets de formation |
| Non pertinent | [Animation d'actions collectives d'économie circulaire](https://www.laregion.fr/Aides-regionales-a-l-animation-d-actions-collectives-en-matiere-d-economie) | Réseaux, personnes morales et observatoires |
| Non pertinent | [Projets locaux d'économie circulaire](https://www.laregion.fr/Aides-regionales-a-la-realisation-de-projets-locaux-en-matiere-d-economie-circulaire) | Personnes morales publiques et privées |
| Non pertinent | [Éducation à l'environnement, actions et réseaux](https://www.laregion.fr/Soutien-au-developpement-de-l-education-a-l-environnement-et-au-developpement) | Subvention à des personnes morales développant les projets |
| Non pertinent | [Fonds régional de garantie](https://www.laregion.fr/Fonds-Regional-de-Garantie-FRG-Occitanie) | Garantie de prêt pour les entreprises TPE/PME |
| Non pertinent | [Gestion durable de la ressource en eau](https://www.laregion.fr/Dispositif-regional-pour-la-gestion-durable-de-la-ressource-en-eau) | Projets de collectivités, associations/fondations ou entreprises |
| Non pertinent | [Centres de soins à la faune sauvage](https://www.laregion.fr/Biodiversite-Centres-de-soins-a-la-faune-sauvage) | Associations porteuses de centres habilités |
| Non pertinent | [Chaufferies biomasse](https://www.laregion.fr/Aide-regionale-au-developpement-des-chaufferies-biomasse) | Projets d'entreprises, collectivités, associations et bailleurs sociaux |
| Non pertinent | [Mobilité/export des maisons d'édition](https://www.laregion.fr/Livre-Aide-a-la-mobilite-hors-region-et-a-l-export-des-maisons-d-edition) | Entreprises éditoriales établies en Occitanie |
| Non pertinent | [Investissements des maisons d'édition indépendantes](https://www.laregion.fr/Livre-Aide-aux-investissements-des-maisons-d-edition-independantes) | Entreprises éditoriales indépendantes |
| Non pertinent | [Pôles d'échanges multimodaux](https://www.laregion.fr/Programme-Regional-d-intervention-en-faveur-des-Poles-d-Echanges-Multimodaux) | EPCI, communes et gestionnaires de gares pour des travaux d'infrastructure |
| Non pertinent | [CFA-OFA 2026](https://www.laregion.fr/Dispositif-regional-de-soutien-au-fonctionnement-des-CFA-OFA-2026) | Organismes de formation par apprentissage |
| Non pertinent | [Projets d'énergie renouvelable coopératifs et citoyens](https://www.laregion.fr/Dispositif-d-aides-pour-les-projets-d-energie-renouvelable-cooperatifs-et-citoyens-d) | Associations, personnes publiques ou entreprises porteuses de projets collectifs |
| Non pertinent | [Startup, industrie de demain](https://www.laregion.fr/Startup-industrie-de-demain) | Jeunes entreprises d'innovation technologique |
| Non pertinent | [Pass Transformation Écologique](https://www.laregion.fr/Pass-Transformation-Ecologique) | Entreprises d'au moins un salarié remplissant les conditions d'ancienneté et de secteur |
| Non pertinent | [Contrat 3S transformation](https://www.laregion.fr/Contrat-3S-Volet-transformation) | Entreprises et certaines associations à recettes commerciales |
| Non pertinent | [Arbres et haies champêtres](https://www.laregion.fr/Biodiversite-Arbres-et-haies-champetres) | Associations spécialisées, collectivités et syndicats mixtes |
| Non pertinent | [Preuve de concept](https://www.laregion.fr/Dispositif-Preuve-de-concept) | Établissements de recherche, universités, SATT et établissements publics |
| Non pertinent | [Établissements de formations sanitaires et sociales](https://www.laregion.fr/Soutien-aux-etablissements-de-formations-sanitaires-et-sociales) | Établissements ou organismes gestionnaires, pas les apprenants |
| Non pertinent | [Promotion collective agricole et agroalimentaire](https://www.laregion.fr/Promotion-collective-des-produits-agricoles-et-agroalimentaires) | Organisations interprofessionnelles et groupements régionaux |
| Non pertinent | [REALIS](https://www.laregion.fr/realis-42741) | Programme de développement d'entreprises de l'ESS sélectionnées |
| Non pertinent | [Convention Filières Territorialisées](https://www.laregion.fr/Dispositif-Convention-Filieres-Territorialisees) | Organisations de producteurs, coopératives, entreprises et associations agricoles invitées |
| Non pertinent | [Création audiovisuelle](https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-a-la-creation-audiovisuelle) | Dossier déposé par la société de production déléguée |
| Non pertinent | [Manifestations audiovisuelles](https://www.laregion.fr/Cinema-Audiovisuel-Multimedia-Aide-aux-manifestations-audiovisuelles) | Personnes morales organisatrices d'événements |
| Expiré | [Bourses aux athlètes](https://www.laregion.fr/Bourses-aux-athletes-Team-Occitanie-Haut-Niveau) | Campagne 2026 : dépôt du 1er janvier au 30 avril 2026; prochaine campagne non documentée |
| Expiré | [Expérimentation prêt VAE dans huit lycées](https://www.laregion.fr/Pret-gratuit-de-velos-a-assistance-electrique-dans-8-lycees-pilotes-d-Occitanie) | Expérimentation 2024, reconduite annoncée pour 2025/26; pas de continuation 2026/27 constatée |

## Géographie postale

Le fichier La Poste contient 39 192 lignes et provient d'un dataset dont la dernière mise à jour enregistrée est le 9 juillet 2023. L'import dispose de 35 511 paires distinctes commune/code postal. Les 3 681 lignes « en trop » correspondent à 2 177 paires avec plusieurs lignes (154 paires et 217 lignes supplémentaires en Occitanie). Les 39 192 lignes sont toutes distinctes sur leurs cinq colonnes : aucune ligne strictement identique n'a été comptée. Les différences de libellé d'acheminement ou de `Ligne_5` sont conservées dans les tableaux normalisés, ce qui évite de perdre les voies de distribution alternatives.

La relation est une table de correspondance et non une relation un-à-un : plusieurs codes postaux par commune et plusieurs communes pour un même code postal sont possibles. Les futures aides locales doivent porter un code INSEE de commune ou des codes territoriaux explicitement documentés; l'adresse postale seule ne suffit pas à établir l'application juridique.

## Suite nécessaire avant publication

- Revoir les 101 lignes en attente sur leurs pages officielles; confirmer cible et statut courant.
- Pour les 22 pertinentes, extraire les critères complets, règles ressources/composition/âge, justificatifs, étapes, portail, suivi et renouvellement depuis les pages et règlements en vigueur.
- Vérifier la date et le règlement applicables pour les aides annuelles ou les campagnes.
- Identifier les dispositifs distincts derrière les pages de synthèse; ne pas transformer une page d'orientation agrégée en plusieurs fausses prestations.
- La base cible PostgreSQL n'est pas raccordée dans cet environnement; le registre JSON versionné est le stockage reproductible actuel.
