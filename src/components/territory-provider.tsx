"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "solomam-territory";
const listeners = new Set<() => void>();
let inMemoryTerritory: string | null = null;
const TerritoryContext = createContext<{ territory: string; setTerritory: (value: string) => void }>({ territory: "occitanie", setTerritory: () => {} });

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getTerritorySnapshot() {
  try { return window.localStorage.getItem(STORAGE_KEY) ?? inMemoryTerritory ?? "occitanie"; } catch { return inMemoryTerritory ?? "occitanie"; }
}

export function TerritoryProvider({ children }: { children: React.ReactNode }) {
  const territory = useSyncExternalStore(subscribe, getTerritorySnapshot, () => "occitanie");

  const value = useMemo(() => ({
    territory,
    setTerritory(next: string) {
      inMemoryTerritory = next;
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* The selection still applies for this visit. */ }
      listeners.forEach((callback) => callback());
    },
  }), [territory]);

  return <TerritoryContext.Provider value={value}>{children}</TerritoryContext.Provider>;
}

export function useTerritory() {
  return useContext(TerritoryContext);
}
