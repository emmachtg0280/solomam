"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";
import { aids, publishedAids } from "@/lib/aids";
import { readSavedAidIds, setAidSaved, subscribeSavedAids } from "@/lib/saved-aids.mjs";
import { publishedServices } from "@/lib/services";
import { readSavedServiceIds, setServiceSaved, subscribeSavedServices } from "@/lib/saved-services.mjs";

const validAidIds = aids.map(({ id }) => id);
const validServiceIds = publishedServices.filter(({ allowFavorite }) => allowFavorite).map(({ id }) => id);

export function Demarches() {
  const subscribe = useCallback((onChange: () => void) => subscribeSavedAids(onChange), []);
  const getSnapshot = useCallback(() => JSON.stringify(readSavedAidIds(validAidIds)), []);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const savedIds = JSON.parse(snapshot) as string[];
  const subscribeServices = useCallback((onChange: () => void) => subscribeSavedServices(onChange), []);
  const getServiceSnapshot = useCallback(() => JSON.stringify(readSavedServiceIds(validServiceIds)), []);
  const serviceSnapshot = useSyncExternalStore(subscribeServices, getServiceSnapshot, () => "[]");
  const savedServiceIds = JSON.parse(serviceSnapshot) as string[];
  const [storageError, setStorageError] = useState(false);
  const items = publishedAids.filter((aid) => savedIds.includes(aid.id));
  const serviceItems = publishedServices.filter((service) => service.allowFavorite && savedServiceIds.includes(service.id));
  const unavailableCount = (savedIds.length - items.length) + (savedServiceIds.length - serviceItems.length);

  const removeAid = (id: string) => setStorageError(!setAidSaved(id, false, validAidIds));
  const removeService = (id: string) => setStorageError(!setServiceSaved(id, false, validServiceIds));

  return <main className="container page favorites-page">
    <div className="catalogue-intro"><p className="eyebrow">Aides et ressources enregistrées</p><h1 className="page-heading">Mes favoris</h1><p>Cette liste reste dans ce navigateur, sans compte.</p></div>
    {storageError && <p role="alert">Le navigateur n’a pas pu modifier cette liste. Vérifiez ses réglages de stockage.</p>}
    {unavailableCount > 0 && <p className="muted">{unavailableCount === 1 ? "Une aide enregistrée n’est pas consultable" : `${unavailableCount} aides enregistrées ne sont pas consultables`} publiquement car les fiches sont en cours de vérification. {unavailableCount === 1 ? "Son identifiant reste conservé" : "Leurs identifiants restent conservés"} dans cette liste locale.</p>}
    {items.length ? <><h2 className="favorites-section-heading">Aides</h2><div className="track-list">{items.map((aid) => <article className="track-card" key={aid.id}>
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
    </article>)}</div></> : null}
    {serviceItems.length ? <><h2 className="favorites-section-heading">Ressources</h2><div className="resource-grid">{serviceItems.map((service) => <article className={"resource-card" + (service.cardImage ? " resource-card-with-image" : " resource-card-no-image")} key={service.id}>
      {service.cardImage ? <span className={`resource-card-image${service.cardImageFit === "contain" ? " resource-card-image-contain" : ""}`} style={{ backgroundImage: 'url("' + service.cardImage + '")' }} aria-hidden="true" /> : null}
      <div className="resource-card-copy"><h3><Link href={`/services/${service.slug}`}>{service.name}</Link></h3><p>{service.description}</p><div className="resource-card-footer"><Link className="resource-card-link" href={`/services/${service.slug}`}>Voir la fiche</Link><Button type="button" variant="ghost" aria-label={`Retirer ${service.name} des favoris`} onClick={() => removeService(service.id)}>Retirer</Button></div></div>
    </article>)}</div></> : null}
    {!items.length && !serviceItems.length && <div className="empty-state">
      <h2>Aucun favori enregistré</h2><p>Parcours les aides et les ressources, puis enregistre celles que tu veux retrouver.</p><Link className="button button-dark" href="/aides">Parcourir les aides</Link>
    </div>}
  </main>;
}
