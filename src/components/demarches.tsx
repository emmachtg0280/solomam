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

  return <main className="container page">
    <h1 className="page-heading">Mes démarches</h1>
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
        <Button type="button" variant="ghost" aria-label={`Retirer ${aid.name} de Mes démarches`} onClick={() => removeAid(aid.id)}>Retirer</Button>
      </div>
    </article>)}</div> : <div className="empty-state">
      Aucune aide enregistrée pour le moment. <Link href="/">Parcourir les aides publiées</Link>.
    </div>}
  </main>;
}
