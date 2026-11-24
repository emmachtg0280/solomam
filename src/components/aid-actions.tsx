"use client";

import { useCallback, useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";
import { aids } from "@/lib/aids";
import { readSavedAidIds, setAidSaved, subscribeSavedAids } from "@/lib/saved-aids.mjs";
import type { Aid } from "@/lib/types";

const validAidIds = aids.map(({ id }) => id);

export function AidActions({ aid }: { aid: Aid }) {
  const subscribe = useCallback((onChange: () => void) => subscribeSavedAids(onChange), []);
  const getSnapshot = useCallback(() => JSON.stringify(readSavedAidIds(validAidIds)), []);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const savedIds = JSON.parse(snapshot) as string[];
  const saved = savedIds.includes(aid.id);
  const [storageError, setStorageError] = useState(false);

  const toggle = () => setStorageError(!setAidSaved(aid.id, !saved, validAidIds));

  return <section className="detail-section" aria-labelledby="save-aid-title">
    <h2 id="save-aid-title">Mes démarches</h2>
    <Button type="button" variant={saved ? "secondary" : "primary"} aria-pressed={saved} onClick={toggle}>
      {saved ? "Retirer de Mes démarches" : "Enregistrer dans Mes démarches"}
    </Button>
    <p className="muted">Cette liste est enregistrée dans ce navigateur, sans compte.</p>
    {storageError && <p role="alert">Le navigateur n’a pas pu enregistrer ce choix. Vérifiez ses réglages de stockage.</p>}
  </section>;
}
