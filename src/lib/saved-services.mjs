export const SAVED_SERVICES_KEY = "solomam-saved-services-v1";
export const SAVED_SERVICES_EVENT = "solomam:saved-services-change";

export function readSavedServiceIds(validIds) {
  if (typeof window === "undefined") return [];
  try {
    const values = JSON.parse(window.localStorage.getItem(SAVED_SERVICES_KEY) || "[]");
    return Array.isArray(values) ? [...new Set(values.filter((id) => typeof id === "string" && validIds.includes(id)))] : [];
  } catch { return []; }
}

export function setServiceSaved(id, saved, validIds) {
  if (typeof window === "undefined" || !validIds.includes(id)) return false;
  try {
    const values = new Set(readSavedServiceIds(validIds));
    if (saved) values.add(id); else values.delete(id);
    window.localStorage.setItem(SAVED_SERVICES_KEY, JSON.stringify([...values]));
    window.dispatchEvent(new Event(SAVED_SERVICES_EVENT));
    return true;
  } catch { return false; }
}

export function subscribeSavedServices(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(SAVED_SERVICES_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SAVED_SERVICES_EVENT, onChange);
  };
}
