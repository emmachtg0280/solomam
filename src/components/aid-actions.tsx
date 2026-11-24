"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { emptyProgress, readProgress, saveAidProgress, statuses } from "@/lib/progress";
import type { Aid, AidProgress } from "@/lib/types";

export function AidActions({ aid }: { aid: Aid }) {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener("solomam:progress-change", onChange);
    return () => {
      window.removeEventListener("storage", onChange);
      window.removeEventListener("solomam:progress-change", onChange);
    };
  }, []);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(readProgress()[aid.id] ?? null),
    () => "null",
  );
  const stored = JSON.parse(snapshot) as AidProgress | null;
  const progress: AidProgress = stored
    ? { ...emptyProgress(aid.steps.length), ...stored, steps: aid.steps.map((_, i) => Boolean(stored.steps?.[i])) }
    : emptyProgress(aid.steps.length);
  const saved = stored !== null;
  const [storageError, setStorageError] = useState(false);
  const update = (next: AidProgress, keep = true) => {
    const persisted = saveAidProgress(aid.id, keep ? next : null);
    setStorageError(!persisted);
  };
  return <>
    <section className="detail-section" aria-labelledby="follow-title">
      <h2 id="follow-title">Suivre cette démarche</h2>
      <div className="status-row">
        <label htmlFor="application-status">Statut</label>
        <select id="application-status" className="field" value={progress.status} onChange={(event) => update({ ...progress, status: event.target.value as AidProgress["status"] })}>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
        {saved && <Button type="button" onClick={() => update(emptyProgress(aid.steps.length), false)}>Retirer de mes démarches</Button>}
      </div>
      <p className="muted">Le suivi est conservé dans ce navigateur.</p>
      {storageError && <p role="alert">Le navigateur n’a pas pu enregistrer ce suivi. Vérifiez ses réglages de stockage.</p>}
      <ul className="check-list">{aid.steps.map((step, index) => <li key={step}><label>
        <input type="checkbox" checked={progress.steps[index] ?? false} onChange={(event) => {
          const steps = [...progress.steps]; steps[index] = event.target.checked;
          const next = { ...progress, steps };
          if (steps.some(Boolean)) update(next); else update(next, saved);
        }} />
        <span>{step}</span>
      </label></li>)}</ul>
      {!saved && <Button variant="primary" type="button" onClick={() => update(progress)}>Enregistrer dans mes démarches</Button>}
    </section>
  </>;
}
