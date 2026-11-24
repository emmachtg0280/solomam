export type ExternalSource =
  | "openfisca-france"
  | "aides-simplifiees"
  | "geo-api"
  | "data-inclusion"
  | "occitanie-open-data"
  | "departmental-communal";

export interface ExternalCatalogRecord {
  externalId: string;
  source: ExternalSource;
  sourceUpdatedAt: string | null;
  retrievedAt: string;
  rawReference: string;
}

export interface AidRepository {
  listPublished(): Promise<import("@/lib/types").Aid[]>;
  findPublishedBySlug(slug: string): Promise<import("@/lib/types").Aid | null>;
}

export interface EligibilityEngine {
  readonly source: "openfisca-france" | "aides-simplifiees";
  evaluate(input: unknown, period: string): Promise<unknown>;
}
