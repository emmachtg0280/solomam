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
  id?: string;
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
  audience: string | null;
  conditions: string[];
  amount: string | null;
  documents: string[];
  steps: string[];
  officialUrl: string;
  applicationUrl: string | null;
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
  uncertainties: string[];
}
