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
  | "Accompagnement"
  | "Mobilité"
  | "Études"
  | "Culture";

export type Coverage = "national" | "regional" | "34";
export type ValidationStatus = "à vérifier" | "vérifié";

export interface AidSource {
  label: string;
  url: string;
  consultedAt: string | null;
  pageVerifiedAt?: string | null;
  kind: "official-guidance" | "legal-text" | "dataset" | "prototype";
}

export interface AidFact {
  field: string;
  status: "verified" | "partially_verified" | "unverified" | "conflict";
  value: string | null;
  sourceIds: string[];
  validFor?: string;
}

export interface ApplicationProcedure {
  status: "complete" | "partially_complete" | "incomplete";
  steps: Array<{ text: string; sourceIds: string[]; status: "verified" | "verified_conditional" | "unverified" }>;
  followUp: { status: string; text: string; sourceIds: string[] };
  renewal: { status: string; text: string; sourceIds: string[] };
  portalUrl: string | null;
  competentOrganization: string;
  remainingChecks: string[];
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
  informationPublicationStatus: "pending" | "verified";
  procedurePublicationStatus: "pending" | "complete";
  validationStatus: ValidationStatus;
  publicationStatus: "pending" | "published";
  reviewNotes: string[];
  currentForPeriod: string | null;
  eligibilityRulesReady: boolean;
  testCases: number;
  facts?: AidFact[];
  applicationProcedure?: ApplicationProcedure;
  verifiedFacts: AidFact[];
}

export type ApplicationStatus = "à commencer" | "en cours" | "envoyée" | "terminée";

export interface AidProgress {
  steps: boolean[];
  status: ApplicationStatus;
}

export type ProgressMap = Record<string, AidProgress>;
