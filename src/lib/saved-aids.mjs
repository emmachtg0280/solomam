export const SAVED_AIDS_KEY = "solomam-saved-aids-v1";
export const LEGACY_AID_KEYS = ["solomam-progress-v1", "solomam-progress"];
export const SAVED_AIDS_EVENT = "solomam:saved-aids-change";

function decodeSavedIds(storage, validIds) {
  const allowed = new Set(validIds);
  const currentRaw = storage.getItem(SAVED_AIDS_KEY);
  if (currentRaw !== null) {
    try {
      const value = JSON.parse(currentRaw);
      if (Array.isArray(value)) {
        const normalized = [...new Set(value.filter((id) => typeof id === "string" && allowed.has(id)))];
        if (JSON.stringify(value) !== JSON.stringify(normalized)) storage.setItem(SAVED_AIDS_KEY, JSON.stringify(normalized));
        for (const key of LEGACY_AID_KEYS) storage.removeItem(key);
        return normalized;
      }
    } catch { /* Attempt migration from the prior supported formats. */ }
  }

  const migrated = new Set();
  for (const key of LEGACY_AID_KEYS) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try {
      const value = JSON.parse(raw);
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      for (const [id, record] of Object.entries(value)) {
        if (!allowed.has(id)) continue;
        const isV1Progress = record && typeof record === "object" && !Array.isArray(record)
          && Array.isArray(record.steps) && record.steps.every((checked) => typeof checked === "boolean");
        const isPrototypeChecklist = Array.isArray(record) && record.every((checked) => typeof checked === "boolean");
        if (isV1Progress || isPrototypeChecklist) migrated.add(id);
      }
    } catch { /* Ignore malformed legacy data and preserve browsing. */ }
  }
  const result = [...migrated];
  try {
    storage.setItem(SAVED_AIDS_KEY, JSON.stringify(result));
    for (const key of LEGACY_AID_KEYS) storage.removeItem(key);
  } catch { /* Keep legacy values if the new value cannot be written. */ }
  return result;
}

export function readSavedAidIdsFrom(storage, validIds) {
  try { return decodeSavedIds(storage, validIds); } catch { return []; }
}

export function saveAidIdTo(storage, id, saved, validIds) {
  if (!validIds.includes(id)) return false;
  try {
    const ids = new Set(decodeSavedIds(storage, validIds));
    if (saved) ids.add(id);
    else ids.delete(id);
    storage.setItem(SAVED_AIDS_KEY, JSON.stringify([...ids]));
    return true;
  } catch { return false; }
}

export function readSavedAidIds(validIds) {
  if (typeof window === "undefined") return [];
  try { return readSavedAidIdsFrom(window.localStorage, validIds); } catch { return []; }
}

export function setAidSaved(id, saved, validIds) {
  if (typeof window === "undefined") return false;
  let ok = false;
  try { ok = saveAidIdTo(window.localStorage, id, saved, validIds); } catch { return false; }
  if (ok) window.dispatchEvent(new Event(SAVED_AIDS_EVENT));
  return ok;
}

export function subscribeSavedAids(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAVED_AIDS_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAVED_AIDS_EVENT, onChange);
  };
}
