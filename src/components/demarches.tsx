"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publishedAids } from "@/lib/aids";
import { progressEvent, readProgress, saveAidProgress, statuses } from "@/lib/progress";
import type { AidProgress } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function Demarches() {
  const [progress, setProgress] = useState<ReturnType<typeof readProgress>>({});
  useEffect(() => {
    const refresh = () => setProgress(readProgress());
    refresh(); window.addEventListener(progressEvent, refresh); window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(progressEvent, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const items = publishedAids.filter((aid) => progress[aid.id]);
  const clear = () => { if (window.confirm("Effacer le suivi des démarches enregistré dans ce navigateur ?")) items.forEach((aid) => saveAidProgress(aid.id, null)); };
  return <main className="container page">
    <div className="status-row" style={{ justifyContent: "space-between" }}><h1 className="page-heading">Mes démarches</h1>{items.length > 0 && <Button type="button" onClick={clear}>Tout effacer</Button>}</div>
    {items.length ? <div className="track-list">{items.map((aid) => {
      const item = progress[aid.id]; const completed = item.steps.filter(Boolean).length;
      return <article className="track-card" key={aid.id}>
        <div><h2><Link href={`/aides/${aid.slug}`}>{aid.name}</Link></h2><span className="muted">{completed} / {aid.steps.length} étapes cochées</span>
          <div className="progress-bar" aria-label={`${completed} étapes sur ${aid.steps.length}`}><span style={{ width: `${Math.round(completed / aid.steps.length * 100)}%` }} /></div>
        </div>
        <label>Statut <select className="field" value={item.status} onChange={(event) => saveAidProgress(aid.id, { ...item, status: event.target.value as AidProgress["status"] })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
      </article>;
    })}</div> : <div className="empty-state">Aucune démarche enregistrée. Les fiches en cours de vérification ne sont pas encore proposées au suivi.</div>}
  </main>;
}
