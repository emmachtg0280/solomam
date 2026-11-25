"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { publishedServices } from "@/lib/services";
import { readSavedServiceIds, setServiceSaved, subscribeSavedServices } from "@/lib/saved-services.mjs";

const validIds = publishedServices.filter(({ allowFavorite }) => allowFavorite).map(({ id }) => id);

export function ServiceFavoriteButton({ serviceId, compact = false }: { serviceId: string; compact?: boolean }) {
  const subscribe = useCallback((onChange: () => void) => subscribeSavedServices(onChange), []);
  const getSnapshot = useCallback(() => JSON.stringify(readSavedServiceIds(validIds)), []);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const saved = (JSON.parse(snapshot) as string[]).includes(serviceId);
  const [storageError, setStorageError] = useState(false);
  const toggle = () => setStorageError(!setServiceSaved(serviceId, !saved, validIds));

  return <span className={compact ? "resource-favorite-control resource-favorite-compact" : "resource-favorite-control"}>
    <Button type="button" variant={saved ? "secondary" : "ghost"} aria-pressed={saved} aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"} onClick={toggle}>
      {saved ? "♥" : "♡"}{!compact && (saved ? " Enregistrée · Retirer" : " Ajouter aux favoris")}
    </Button>
    {storageError && <span className="muted" role="alert">Impossible d’enregistrer ce favori.</span>}
  </span>;
}
