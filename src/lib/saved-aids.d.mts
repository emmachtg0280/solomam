export const SAVED_AIDS_KEY: string;
export const LEGACY_AID_KEYS: string[];
export const SAVED_AIDS_EVENT: string;
export function readSavedAidIdsFrom(storage: Storage, validIds: readonly string[]): string[];
export function saveAidIdTo(storage: Storage, id: string, saved: boolean, validIds: readonly string[]): boolean;
export function readSavedAidIds(validIds: readonly string[]): string[];
export function setAidSaved(id: string, saved: boolean, validIds: readonly string[]): boolean;
export function subscribeSavedAids(onChange: () => void): () => void;
