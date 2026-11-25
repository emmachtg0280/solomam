export const SAVED_SERVICES_KEY: string;
export const SAVED_SERVICES_EVENT: string;
export function readSavedServiceIds(validIds: readonly string[]): string[];
export function setServiceSaved(id: string, saved: boolean, validIds: readonly string[]): boolean;
export function subscribeSavedServices(onChange: () => void): () => void;
