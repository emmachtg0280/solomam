"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";
import { aids, publishedAids } from "@/lib/aids";
import { readSavedAidIds, setAidSaved, subscribeSavedAids } from "@/lib/saved-aids.mjs";

const validAidIds = aids.map(({ id }) => id);

export function Demarches() {
  const subscribe = useCallback((onChange: () => void) => subscribeSavedAids(onChange), []);
  const getSnapshot = useCallback(() => JSON.stringify(readSavedAidIds(validAidIds)), []);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const savedIds = JSON.parse(snapshot) as string[];
  const [storageError, setStorageError] = useState(false);
  const items = publishedAids.filter((aid) => savedIds.includes(aid.id));
  const unavailableCount = savedIds.length - items.length;

  const removeAid = (id: string) => setStorageError(!setAidSaved(id, false, validAidIds));

  return <main className="container page favorites-page">
    <div className="catalogue-intro"><p className="eyebrow">Aides enregistrées</p><h1 className="page-heading">Mes favoris</h1><p>Cette liste reste dans ce navigateur, sans compte.</p></div>
    {storageError && <p role="alert">Le navigateur n’a pas pu modifier cette liste. Vérifiez ses réglages de stockage.</p>}
    {unavailableCount > 0 && <p className="muted">{unavailableCount === 1 ? "Une aide enregistrée n’est pas consultable" : `${unavailableCount} aides enregistrées ne sont pas consultables`} publiquement car les fiches sont en cours de vérification. {unavailableCount === 1 ? "Son identifiant reste conservé" : "Leurs identifiants restent conservés"} dans cette liste locale.</p>}
    {items.length ? <div className="track-list">{items.map((aid) => <article className="track-card" key={aid.id}>
      <h2><Link href={`/aides/${aid.slug}`}>{aid.name}</Link></h2>
      <p>{aid.description}</p>
      {aid.steps.length > 0 && <>
        <h3>Étapes de la demande</h3>
        <ol>{aid.steps.map((step) => <li key={step}>{step}</li>)}</ol>
      </>}
      {aid.steps.length === 0 && <p className="muted">Les étapes détaillées ne sont pas publiées. Consultez les informations officielles avant d’engager la démarche.</p>}
      <div className="status-row saved-aid-actions">
        {aid.applicationUrl
          ? <a className="button button-primary" href={aid.applicationUrl} target="_blank" rel="noopener noreferrer">Faire la demande sur le site officiel</a>
          : <a className="button button-primary" href={aid.officialUrl} target="_blank" rel="noopener noreferrer">Consulter les informations officielles</a>}
        <Link className="button button-secondary" href={`/aides/${aid.slug}`}>Voir la fiche</Link>
        <Button type="button" variant="ghost" aria-label={`Retirer ${aid.name} des favoris`} onClick={() => removeAid(aid.id)}>Retirer des favoris</Button>
      </div>
    </article>)}</div> : <div className="empty-state">
      <h2>Aucune aide enregistrée</h2><p>Parcours les aides et enregistre celles que tu veux retrouver.</p><Link className="button button-dark" href="/aides">Parcourir les aides</Link>
    </div>}
  </main>;
}
