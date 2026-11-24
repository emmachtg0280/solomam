export type AidCategory =
  | "Famille"
  | "Revenus"
  | "Logement"
  | "Enfants & école"
  | "Garde"
  | "Loisirs"
  | "Santé"
  | "Séparation"
  | "Emploi"
  | "Accompagnement";

export type Coverage = "national" | "regional" | "34";
export type ValidationStatus = "à vérifier" | "vérifié";

export interface AidSource {
  label: string;
  url: string;
  consultedAt: string | null;
  kind: "official-guidance" | "legal-text" | "dataset" | "prototype";
}

export interface Aid {
  id: string;
  slug: string;
  name: string;
  category: AidCategory;
  organization: string;
  coverage: Coverage;
  description: string;
  conditions: string[];
  documents: string[];
  steps: string[];
  officialUrl: string;
  sources: AidSource[];
  verifiedAt: string | null;
  validationStatus: ValidationStatus;
  publicationStatus: "pending" | "published";
  reviewNotes: string[];
  currentForPeriod: string | null;
  eligibilityRulesReady: boolean;
  testCases: number;
}

export type ApplicationStatus = "à commencer" | "en cours" | "envoyée" | "terminée";

export interface AidProgress {
  steps: boolean[];
  status: ApplicationStatus;
}

export type ProgressMap = Record<string, AidProgress>;
