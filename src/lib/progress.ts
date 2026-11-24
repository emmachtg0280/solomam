import type { AidProgress, ApplicationStatus, ProgressMap } from "@/lib/types";

export const PROGRESS_KEY = "solomam-progress-v1";
export const progressEvent = "solomam:progress-change";
export const statuses: ApplicationStatus[] = ["à commencer", "en cours", "envoyée", "terminée"];

export function readProgress(): ProgressMap {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const cleaned: ProgressMap = {};
    for (const [id, item] of Object.entries(value)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const candidate = item as Partial<AidProgress>;
      if (!Array.isArray(candidate.steps) || !candidate.steps.every((step) => typeof step === "boolean")) continue;
      if (!candidate.status || !statuses.includes(candidate.status)) continue;
      cleaned[id] = { steps: candidate.steps, status: candidate.status };
    }
    if (Object.keys(cleaned).length || localStorage.getItem(PROGRESS_KEY)) return cleaned;

    // Migrate the prototype's checkbox-only format when it exists on this origin.
    const legacy: unknown = JSON.parse(localStorage.getItem("solomam-progress") ?? "null");
    if (!legacy || typeof legacy !== "object" || Array.isArray(legacy)) return {};
    for (const [id, steps] of Object.entries(legacy)) {
      if (Array.isArray(steps) && steps.every((step) => typeof step === "boolean")) {
        cleaned[id] = { steps, status: steps.some(Boolean) ? "en cours" : "à commencer" };
      }
    }
    if (Object.keys(cleaned).length) {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(cleaned));
      localStorage.removeItem("solomam-progress");
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function saveAidProgress(id: string, progress: AidProgress | null) {
  const current = readProgress();
  if (progress) current[id] = progress;
  else delete current[id];
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(current));
    localStorage.removeItem("solomam-progress");
    window.dispatchEvent(new Event(progressEvent));
    return true;
  } catch {
    // A disabled or full local storage must not break browsing.
    return false;
  }
}

export function emptyProgress(steps: number): AidProgress {
  return { steps: Array.from({ length: steps }, () => false), status: "à commencer" };
}
