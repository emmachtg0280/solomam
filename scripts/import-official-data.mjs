import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "src", "data", "imports");
const regionCode = "76";
const regionDataset = "aides-et-appels-a-projets-de-la-region-occitanie";
const regionApi = `https://data.laregion.fr/api/explore/v2.1/catalog/datasets/${regionDataset}`;
const geoApi = "https://geo.api.gouv.fr";
const postalDatasetApi = "https://www.data.gouv.fr/api/1/datasets/base-officielle-des-codes-postaux/";
const geographySnapshotPath = path.join(outputRoot, "geography", "raw", "communes-occitanie.json");
const postalSnapshotPath = path.join(outputRoot, "geography", "raw", "la-poste-hexasmal.csv");
const consultedAt = new Date().toISOString();
const errors = [];

class ImportError extends Error {
  constructor(kind, url, message, details = {}) {
    super(`${kind}: ${url}: ${message}`);
    this.name = "ImportError";
    this.kind = kind;
    this.url = url;
    this.details = details;
  }
}

export async function getResponse(url, accept = "application/json") {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetch(url, { headers: { accept }, signal: AbortSignal.timeout(30_000) });
    } catch (error) {
      const cause = error?.cause;
      const code = cause?.code ?? error?.code ?? "UNKNOWN_NETWORK_ERROR";
      const transient = ["ECONNREFUSED", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "EHOSTUNREACH", "ENETUNREACH", "ECONNRESET", "UND_ERR_SOCKET"].includes(code);
      if (transient && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300 * (2 ** (attempt - 1))));
        continue;
      }
      const classification = code === "ENOTFOUND" || code === "EAI_AGAIN"
        ? "DNS_ERROR"
        : code === "EACCES" || code === "EPERM"
          ? "ENVIRONMENT_NETWORK_DENIED"
          : transient
            ? "CONNECTION_ERROR"
            : code === "CERT_HAS_EXPIRED" || code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE"
              ? "TLS_ERROR"
              : "NETWORK_ERROR";
      throw new ImportError(classification, url, error.message, { code, cause: cause?.message, attempts: attempt });
    }
    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      if (retryable && attempt < maxAttempts) {
        const retryAfter = Number(response.headers.get("retry-after"));
        await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 5000) : 300 * (2 ** (attempt - 1))));
        continue;
      }
      throw new ImportError("HTTP_ERROR", url, `${response.status} ${response.statusText}`, {
        status: response.status,
        retryAfter: response.headers.get("retry-after"),
        attempts: attempt,
      });
    }
    return response;
  }
  throw new ImportError("RETRY_EXHAUSTED", url, "request attempts exhausted");
}

async function getJson(url) {
  const response = await getResponse(url);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) {
    throw new ImportError("CONTENT_TYPE_ERROR", url, `expected JSON, got ${contentType || "missing content type"}`);
  }
  try {
    return await response.json();
  } catch (error) {
    throw new ImportError("JSON_PARSE_ERROR", url, error.message);
  }
}

export function classifyAid(record, typeField) {
  const type = String(typeField ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  if (!/^aides?$/.test(type)) return "excluded-not-aid";

  const fields = Object.entries(record)
    .filter(([key]) => /public|beneficiaire|destinataire|eligib|cible|porteur|type|dispositif/i.test(key))
    .map(([, value]) => Array.isArray(value) ? value.join(" ") : String(value ?? ""))
    .join(" ")
    .normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const individual = /particulier|personne physique|menage|famille|parent|jeune|etudiant|demandeur d'emploi|locataire|proprietaire occupant|public individuel/.test(fields);
  const organization = /association|entreprise|organisme|collectivite|commune|etablissement public|structure|personne morale|porteur de projet/.test(fields);
  if (individual && !organization) return "individual-candidate-review-required";
  if (organization && !individual) return "excluded-organization-audience";
  return "manual-audience-review-required";
}

function fieldValue(record, pattern) {
  const entry = Object.entries(record).find(([key]) => pattern.test(key));
  if (!entry) return null;
  const value = entry[1];
  return value === undefined || value === null || value === "" ? null : value;
}

function text(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join("; ");
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  return value === null || value === undefined ? null : String(value).trim() || null;
}

export function decodeCsvBytes(bytes) {
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes), encoding: "utf-8" };
  } catch {
    return { text: new TextDecoder("windows-1252", { fatal: true }).decode(bytes), encoding: "windows-1252" };
  }
}

export function normalizeHeader(header) {
  return String(header)
    .replace(/^\uFEFF/, "")
    .replace(/^\s*#\s*/, "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normalizePostalRows(rows) {
  if (!rows.length) throw new Error("CSV postal is empty");
  const fields = Object.keys(rows[0]);
  const find = (aliases) => fields.find((field) => aliases.includes(normalizeHeader(field)));
  const communeField = find(["code commune insee", "code insee commune", "code commune"]);
  const postalField = find(["code postal"]);
  const nameField = find(["nom de la commune", "nom commune"]);
  const deliveryField = find(["libelle d acheminement"]);
  const line5Field = find(["ligne 5"]);
  if (!communeField || !postalField) {
    const error = new Error(`expected #Code_commune_INSEE and Code_postal fields; got ${fields.join(", ")}`);
    error.fields = fields;
    throw error;
  }
  const sourceRows = rows.map((row) => ({
    inseeCode: String(row[communeField] ?? "").trim(),
    postalCode: String(row[postalField] ?? "").trim(),
    communeName: nameField ? String(row[nameField] ?? "").trim() : null,
    deliveryLabel: deliveryField ? String(row[deliveryField] ?? "").trim() : null,
    line5: line5Field ? String(row[line5Field] ?? "").trim() || null : null,
  }));
  if (sourceRows.some((item) => !/^(?:\d{5}|2[AB]\d{3})$/.test(item.inseeCode) || !/^\d{5}$/.test(item.postalCode))) {
    const error = new Error("postal CSV contains invalid INSEE or postal codes; values must remain five-character digit strings");
    error.kind = "DATA_QUALITY_ERROR";
    throw error;
  }
  const byPair = new Map();
  let duplicateCount = 0;
  let exactDuplicateRowCount = 0;
  const repeatedPairs = new Set();
  const exactRows = new Set();
  for (const item of sourceRows) {
    const exactKey = [item.inseeCode, item.communeName ?? "", item.postalCode, item.deliveryLabel ?? "", item.line5 ?? ""].join("\u001f");
    if (exactRows.has(exactKey)) exactDuplicateRowCount += 1;
    else exactRows.add(exactKey);
    const key = `${item.inseeCode}|${item.postalCode}`;
    const existing = byPair.get(key);
    if (existing) {
      duplicateCount += 1;
      repeatedPairs.add(key);
      if (item.communeName && !existing.communeNames.includes(item.communeName)) existing.communeNames.push(item.communeName);
      if (item.deliveryLabel && !existing.deliveryLabels.includes(item.deliveryLabel)) existing.deliveryLabels.push(item.deliveryLabel);
      if (item.line5 && !existing.line5Values.includes(item.line5)) existing.line5Values.push(item.line5);
      continue;
    }
    byPair.set(key, { inseeCode: item.inseeCode, postalCode: item.postalCode, communeNames: item.communeName ? [item.communeName] : [], deliveryLabels: item.deliveryLabel ? [item.deliveryLabel] : [], line5Values: item.line5 ? [item.line5] : [] });
  }
  return { mappings: [...byPair.values()], sourceRows: sourceRows.length, duplicateCount, exactDuplicateRowCount, pairCount: byPair.size, multiRowPairCount: repeatedPairs.size, fields: { communeField, postalField, nameField, deliveryField, line5Field } };
}

export function normalizeGeographyRecords(communes) {
  const seen = new Set();
  let duplicateCount = 0;
  const records = communes.filter((item) => {
    if (typeof item.code !== "string" || !/^\d{5}$/.test(item.code)) throw new Error(`invalid INSEE code: ${item.code}`);
    if (typeof item.codeDepartement !== "string" || typeof item.codeRegion !== "string") throw new Error(`missing territorial codes for ${item.code}`);
    if (seen.has(item.code)) { duplicateCount += 1; return false; }
    seen.add(item.code);
    return true;
  }).map((item) => ({
    inseeCode: item.code,
    communeName: item.nom,
    departmentCode: item.codeDepartement,
    regionCode: item.codeRegion,
    epciCode: item.codeEpci ?? null,
    postalCodes: Array.isArray(item.codesPostaux) ? item.codesPostaux.map(String) : [],
  }));
  return { records, duplicateCount };
}

export function normalizeGeoPostalMappings(communes, retrievedAt = consultedAt) {
  const mappingSet = new Set();
  const mappings = [];
  for (const commune of communes) {
    for (const postalCode of commune.codesPostaux ?? []) {
      const inseeCode = String(commune.code);
      const postal = String(postalCode);
      if (!/^\d{5}$/.test(inseeCode) || !/^\d{5}$/.test(postal)) throw new Error(`invalid Geo API postal mapping: ${inseeCode} -> ${postal}`);
      const key = `${inseeCode}|${postal}`;
      if (mappingSet.has(key)) continue;
      mappingSet.add(key);
      mappings.push({ inseeCode, communeName: commune.nom, postalCode: postal, source: "geo.api.gouv.fr", retrievedAt });
    }
  }
  return mappings;
}

function parseDate(value) {
  if (!value) return null;
  const source = String(value).trim();
  const french = source.match(/^(\d{2})[/.](\d{2})[/.](\d{4})$/);
  const parsed = new Date(french ? `${french[3]}-${french[2]}-${french[1]}T00:00:00Z` : source);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

export function normalizeRegionRecord(record) {
  const name = text(fieldValue(record, /^(titre|intitule|nom|libelle|name)$/i))
    ?? text(fieldValue(record, /titre|intitule|nom|libelle|name/i));
  const officialUrl = text(fieldValue(record, /url|lien|site/i));
  const type = text(fieldValue(record, /^type$/i)) ?? text(fieldValue(record, /type/i));
  const key = name?.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? null;
  // The current Region dataset schema has publication/modification dates only.
  // They describe the web page, not the legal validity window of the aid.
  const validFrom = parseDate(text(fieldValue(record, /date.*debut|date.*ouverture/i)));
  const validUntil = parseDate(text(fieldValue(record, /date.*fin|date.*cloture|date.*limite/i)));
  const today = consultedAt.slice(0, 10);
  const periodStatus = validUntil && validUntil < today ? "expired"
    : validFrom && validFrom > today ? "not-yet-active"
      : validFrom || validUntil ? "within-declared-period-check-official-page" : "period-not-found-manual-review";
  return {
    source: { id: `region-occitanie:${text(fieldValue(record, /^(id|recordid|source_record_id)$/i)) ?? key ?? createHash("sha256").update(JSON.stringify(record)).digest("hex").slice(0, 16)}`, dataset: regionDataset, url: `https://data.laregion.fr/explore/dataset/${regionDataset}/`, retrievedAt: consultedAt },
    name,
    type,
    audienceReview: classifyAid(record, type),
    description: [text(fieldValue(record, /^chapo$/i)), text(fieldValue(record, /^introduction$/i))].filter(Boolean).join("\n\n") || text(fieldValue(record, /description|resume|presentation|objet/i)),
    conditions: null,
    documents: null,
    applicationSteps: null,
    officialUrl,
    validFrom,
    validUntil,
    periodStatus: validFrom || validUntil ? periodStatus : "not-established-from-dataset",
    beneficiaryRaw: text(fieldValue(record, /^(public|public_cible|public_concerne|beneficiaire|beneficiaires|destinataire|destinataires|cible|profil_beneficiaire)$/i)),
    rawFieldNames: Object.keys(record),
    reviewStatus: "pending",
    publicationStatus: "pending",
    reviewNotes: ["Import brut à contrôler contre la page officielle du dispositif.", "Les critères, pièces et étapes restent non vérifiés tant qu'ils ne sont pas reliés à des sources dédiées."],
  };
}

async function importRegion() {
  if (process.env.SOLOMAM_REGION_TERMS_ACCEPTED !== "1") {
    throw new ImportError("CONSENT_REQUIRED", `https://data.laregion.fr/explore/dataset/${regionDataset}/export/`, "the portal requires acceptance of its terms; review them and set SOLOMAM_REGION_TERMS_ACCEPTED=1 only after acceptance");
  }
  const metadataUrl = `${regionApi}?include_app_metas=true`;
  const metadata = await getJson(metadataUrl);
  const records = [];
  const limit = 100;
  let offset = 0;
  while (true) {
    const url = `${regionApi}/records?limit=${limit}&offset=${offset}`;
    const page = await getJson(url);
    if (!Array.isArray(page.results)) {
      throw new ImportError("RESPONSE_SHAPE_ERROR", url, "expected an object with a results array");
    }
    records.push(...page.results);
    if (records.length >= Number(page.total_count ?? 0) || page.results.length < limit) break;
    offset += limit;
  }
  const schema = metadata.dataset?.fields ?? metadata.fields ?? [];
  const normalized = records.map((item) => normalizeRegionRecord({
    ...(item.record?.fields ?? item.fields ?? item),
    source_record_id: item.record?.id ?? item.recordid ?? item.id ?? null,
  }));
  const { records: deduplicated, duplicateRecords, duplicates } = deduplicateCandidates(normalized);
  const aidCandidates = deduplicated.filter((item) => item.audienceReview === "individual-candidate-review-required");
  const manualAudienceReview = deduplicated.filter((item) => item.audienceReview === "manual-audience-review-required");
  const excludedRecords = normalized.filter((item) => item.audienceReview === "excluded-organization-audience" || item.audienceReview === "excluded-not-aid");
  const raw = { sourceUrl: `${regionApi}/records`, retrievedAt: consultedAt, schema, totalRecords: records.length, records };
  await writeJson("occitanie/raw/dataset.json", raw);
  const aidDuplicates = duplicateRecords.filter((item) => item.audienceReview === "individual-candidate-review-required");
  await writeJson("occitanie/normalized/aids.json", { records: aidCandidates, duplicateRecords: aidDuplicates, duplicateCount: aidDuplicates.length });
  await writeJson("occitanie/normalized/manual-review.json", manualAudienceReview);
  await writeJson("occitanie/normalized/excluded-records.json", excludedRecords);
  return { retrievedRecords: records.length, normalizedUniqueRecords: deduplicated.length, individualAidCandidates: aidCandidates.length, organizationAndNonAidExcluded: excludedRecords.length, manualAudienceReview: manualAudienceReview.length, duplicateRecords: duplicates, schema };
}

async function importGeography() {
  const departmentsUrl = `${geoApi}/regions/${regionCode}/departements?fields=nom,code,codeRegion&format=json`;
  const departments = await getJson(departmentsUrl);
  if (!Array.isArray(departments) || departments.length !== 13 || departments.some((d) => d.codeRegion !== regionCode)) {
    throw new ImportError("RESPONSE_SHAPE_ERROR", departmentsUrl, `expected 13 departments for region ${regionCode}; got ${Array.isArray(departments) ? departments.length : typeof departments}`);
  }
  const communesByDepartment = await Promise.all(departments.map(async (department) => {
    const url = `${geoApi}/departements/${encodeURIComponent(department.code)}/communes?fields=nom,code,codeDepartement,codeRegion,codeEpci,codesPostaux&format=json`;
    const data = await getJson(url);
    if (!Array.isArray(data) || data.some((commune) => commune.codeDepartement !== department.code || commune.codeRegion !== regionCode)) {
      throw new ImportError("RESPONSE_SHAPE_ERROR", url, "unexpected commune array or territory codes");
    }
    return data;
  }));
  const communes = communesByDepartment.flat();
  const requiredChecks = validateRequiredCommunes(communes);
  if (Object.values(requiredChecks).some((ok) => !ok)) {
    throw new ImportError("GEOGRAPHY_ASSERTION_ERROR", departmentsUrl, "one or more requested communes did not match the official codes", requiredChecks);
  }
  const { records: normalizedCommunes, duplicateCount } = normalizeGeographyRecords(communes);
  await writeJson("geography/raw/communes-occitanie.json", { sourceUrl: `${geoApi}/regions/${regionCode}/departements`, retrievedAt: consultedAt, regionCode, departments, communes });
  await writeJson("geography/normalized/communes-occitanie.json", normalizedCommunes);
  const geoPostalMappings = normalizeGeoPostalMappings(communes);
  await writeJson("geography/normalized/geo-api-postal-codes-occitanie.json", geoPostalMappings);
  return { status: "fresh", departmentCount: departments.length, communeCount: communes.length, normalizedCommuneCount: normalizedCommunes.length, duplicateCount, geoPostalMappingCount: geoPostalMappings.length, requiredChecks, communes };
}

export function validateRequiredCommunes(communes) {
  const required = { Montpellier: "34172", Frontignan: "34108", Sète: "34301", Béziers: "34032" };
  return Object.fromEntries(Object.entries(required).map(([name, code]) => [name, communes.some((item) => item.code === code && item.nom === name)]));
}

export function deduplicateCandidates(records) {
  const seen = new Set();
  const firstByKey = new Map();
  const duplicateRecords = [];
  let duplicates = 0;
  const unique = records.filter((item) => {
    if (!item.name || !item.officialUrl) return true;
    const normalize = (value) => String(value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    const key = [normalize(item.name), normalize(item.type), String(item.officialUrl).trim(), item.validFrom ?? "", item.validUntil ?? "", normalize(item.beneficiaryRaw)].join("|");
    if (seen.has(key)) {
      duplicates += 1;
      duplicateRecords.push({ sourceId: item.source.id, duplicateOfSourceId: firstByKey.get(key), name: item.name, type: item.type, audienceReview: item.audienceReview, reviewStatus: "duplicate" });
      return false;
    }
    seen.add(key);
    firstByKey.set(key, item.source.id);
    return true;
  });
  return { records: unique, duplicateRecords, duplicates };
}

export function parseCsv(content, delimiter = ";") {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    if (char === '"' && quoted && content[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && content[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((item) => item !== "")) rows.push(row);
      row = [];
    } else cell += char;
  }
  if (quoted) {
    const error = new Error("CSV contains an unterminated quoted field");
    error.kind = "CSV_PARSE_ERROR";
    throw error;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim());
  return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

async function importPostalCodes(communes = null) {
  const metadata = await getJson(postalDatasetApi);
  const resources = metadata.resources;
  if (!Array.isArray(resources)) throw new ImportError("RESPONSE_SHAPE_ERROR", postalDatasetApi, "dataset metadata has no resources array");
  const resource = resources.find((item) => /\.csv(?:\?|$)/i.test(item.url ?? "") || /csv/i.test(item.format ?? ""));
  if (!resource?.url) throw new ImportError("RESOURCE_NOT_FOUND", postalDatasetApi, "no CSV resource found in official dataset metadata");
  const response = await getResponse(resource.url, "text/csv,text/plain,*/*");
  const csvBytes = Buffer.from(await response.arrayBuffer());
  await mkdir(path.dirname(postalSnapshotPath), { recursive: true });
  await writeFile(postalSnapshotPath, csvBytes);
  const { text: csv, encoding } = decodeCsvBytes(csvBytes);
  const rows = parseCsv(csv, csv.split(/\r?\n/, 1)[0].includes(";") ? ";" : ",");
  if (!rows.length) throw new ImportError("RESPONSE_SHAPE_ERROR", resource.url, "postal CSV is empty");
  const fields = Object.keys(rows[0]);
  await writeJson("geography/raw/postal-codes-dataset.json", { datasetId: metadata.id, datasetTitle: metadata.title, datasetLastUpdate: metadata.last_update ?? null, resource: { id: resource.id ?? null, title: resource.title ?? null, url: resource.url, format: resource.format ?? null, filesize: resource.filesize ?? null }, retrievedAt: consultedAt, encoding, sourceRowCount: rows.length, fields, rows });
  let normalized;
  try { normalized = normalizePostalRows(rows); }
  catch (error) { throw new ImportError(error.kind ?? "SCHEMA_ERROR", resource.url, error.message, { fields, encoding }); }
  const occitanieDepartments = new Set(["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"]);
  const occitanieCodes = communes ? new Set(communes.map((item) => item.code)) : null;
  const matched = normalized.mappings.filter((row) => occitanieCodes
    ? occitanieCodes.has(row.inseeCode)
    : occitanieDepartments.has(row.inseeCode.slice(0, 2))).map((item) => ({ ...item, sourceDataset: metadata.id, sourceResourceId: resource.id ?? null, sourceUpdatedAt: metadata.last_update ?? null, retrievedAt: consultedAt }));
  await writeJson("geography/normalized/postal-codes-occitanie.json", matched);
  return { status: "fresh", sourceRows: rows.length, occitanieRows: matched.length, matchedCommunes: new Set(matched.map((item) => item.inseeCode)).size, duplicateCount: normalized.duplicateCount, encoding, matchedAgainst: communes ? "API Géo commune codes" : "department code prefixes pending API Géo cross-check", datasetLastUpdate: metadata.last_update ?? null, resourceUrl: resource.url };
}

async function readStoredGeography() {
  const snapshot = JSON.parse(await readFile(geographySnapshotPath, "utf8"));
  if (snapshot.regionCode !== regionCode || snapshot.departments?.length !== 13 || !Array.isArray(snapshot.communes)) {
    throw new ImportError("STORED_SNAPSHOT_INVALID", geographySnapshotPath, "stored geography snapshot is not a complete Occitanie snapshot");
  }
  const requiredChecks = validateRequiredCommunes(snapshot.communes);
  if (Object.values(requiredChecks).some((ok) => !ok)) {
    throw new ImportError("GEOGRAPHY_ASSERTION_ERROR", geographySnapshotPath, "stored snapshot does not contain all required communes", requiredChecks);
  }
  const { records, duplicateCount } = normalizeGeographyRecords(snapshot.communes);
  await writeJson("geography/normalized/communes-occitanie.json", records);
  const geoPostalMappings = normalizeGeoPostalMappings(snapshot.communes, snapshot.retrievedAt ?? consultedAt);
  await writeJson("geography/normalized/geo-api-postal-codes-occitanie.json", geoPostalMappings);
  return { status: "stored-snapshot-reused", sourceRetrievedAt: snapshot.retrievedAt, departmentCount: snapshot.departments.length, communeCount: snapshot.communes.length, normalizedCommuneCount: records.length, duplicateCount, geoPostalMappingCount: geoPostalMappings.length, requiredChecks, communes: snapshot.communes };
}

async function refreshPostalFromSavedCsv(communes = null) {
  const bytes = await readFile(postalSnapshotPath);
  const { text: csv, encoding } = decodeCsvBytes(bytes);
  const rows = parseCsv(csv, csv.split(/\r?\n/, 1)[0].includes(";") ? ";" : ",");
  const normalized = normalizePostalRows(rows);
  const occitanieDepartments = new Set(["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"]);
  const occitanieCodes = communes ? new Set(communes.map((item) => item.code)) : null;
  let postalSnapshot = null;
  try { postalSnapshot = JSON.parse(await readFile(path.join(outputRoot, "geography/raw/postal-codes-dataset.json"), "utf8")); }
  catch { /* A standalone CSV snapshot can still be normalized without its metadata sidecar. */ }
  const matched = normalized.mappings.filter((row) => occitanieCodes ? occitanieCodes.has(row.inseeCode) : occitanieDepartments.has(row.inseeCode.slice(0, 2))).map((row) => ({
    ...row,
    sourceDataset: postalSnapshot?.datasetId ?? null,
    sourceResourceId: postalSnapshot?.resource?.id ?? null,
    sourceUpdatedAt: postalSnapshot?.datasetLastUpdate ?? null,
    retrievedAt: postalSnapshot?.retrievedAt ?? consultedAt,
  }));
  await writeJson("geography/normalized/postal-codes-occitanie.json", matched);
  return { status: "saved-raw-reprocessed", sourceRows: rows.length, occitanieRows: matched.length, matchedCommunes: new Set(matched.map((item) => item.inseeCode)).size, duplicateCount: normalized.duplicateCount, encoding, matchedAgainst: communes ? "API Géo commune codes" : "department code prefixes pending API Géo cross-check" };
}

async function writeJson(relative, value) {
  const target = path.join(outputRoot, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function main() {
  let previousAttempt = null;
  let knownPostalHistory = null;
  try {
    const old = JSON.parse(await readFile(path.join(outputRoot, "import-report.json"), "utf8"));
    if (old.startedAt) {
      const priorPostalFailure = old.errors?.find((item) => item.kind === "SCHEMA_ERROR" && item.url?.includes("data.laposte.fr"));
      previousAttempt = {
        startedAt: old.startedAt,
        counts: old.counts ?? null,
        errors: old.errors ?? [],
        priorPostalResponse: priorPostalFailure ? {
          responseReceived: true,
          rawSaved: false,
          parsedRowCount: null,
          fields: priorPostalFailure.details?.fields ?? null,
        } : null,
      };
    }
  } catch { /* No previous run is a normal first-import state. */ }
  try {
    const registry = JSON.parse(await readFile(path.join(root, "src", "data", "source-registry.json"), "utf8"));
    knownPostalHistory = registry.sources.find((item) => item.id === "postal-codes")?.endpointProbe?.priorUserRun ?? null;
  } catch { /* The report remains usable if the optional source registry is absent. */ }

  let region = null, geographyResult = null, postal = null;
  let regionConsent = { required: true, accepted: process.env.SOLOMAM_REGION_TERMS_ACCEPTED === "1", status: "awaiting-acceptance" };
  try { region = await importRegion(); regionConsent = { required: true, accepted: true, status: "accepted" }; }
  catch (error) {
    if (error.kind === "CONSENT_REQUIRED") {
      regionConsent = { required: true, accepted: false, status: "awaiting-acceptance" };
      region = { status: "awaiting-consent", retrievedRecords: 0 };
    } else {
      regionConsent = { required: true, accepted: process.env.SOLOMAM_REGION_TERMS_ACCEPTED === "1", status: process.env.SOLOMAM_REGION_TERMS_ACCEPTED === "1" ? "accepted" : "awaiting-acceptance" };
      errors.push(serializeError(error));
      region = { status: "failed", retrievedRecords: 0 };
    }
  }

  try { geographyResult = await importGeography(); }
  catch (error) {
    errors.push(serializeError(error));
    try { geographyResult = await readStoredGeography(); }
    catch (snapshotError) {
      if (snapshotError.code !== "ENOENT") errors.push(serializeError(snapshotError));
    }
  }
  const geography = geographyResult
    ? { status: geographyResult.status, sourceRetrievedAt: geographyResult.sourceRetrievedAt ?? consultedAt, departmentCount: geographyResult.departmentCount, communeCount: geographyResult.communeCount, normalizedCommuneCount: geographyResult.normalizedCommuneCount, duplicateCount: geographyResult.duplicateCount, geoPostalMappingCount: geographyResult.geoPostalMappingCount, requiredChecks: geographyResult.requiredChecks }
    : { status: "unavailable", departmentCount: 0, communeCount: 0, normalizedCommuneCount: 0, duplicateCount: 0, geoPostalMappingCount: 0, requiredChecks: null };

  try { postal = await importPostalCodes(geographyResult?.communes ?? null); }
  catch (error) {
    errors.push(serializeError(error));
    try { postal = await refreshPostalFromSavedCsv(geographyResult?.communes ?? null); }
    catch (snapshotError) {
      if (snapshotError.code !== "ENOENT") errors.push(serializeError(snapshotError));
    }
  }
  const report = {
    importerVersion: 2,
    startedAt: consultedAt,
    completedAt: new Date().toISOString(),
    retryPolicy: { maxAttempts: 3, transientHttpStatuses: [429, "5xx"], transientNetworkCodes: ["ECONNREFUSED", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "EHOSTUNREACH", "ENETUNREACH", "ECONNRESET", "UND_ERR_SOCKET"], nonRetryableNetworkCodes: ["EACCES", "EPERM", "ENOTFOUND", "EAI_AGAIN"] },
    previousAttempt,
    historicalPostalResponse: knownPostalHistory,
    counts: {
      regionRecordsRetrieved: region?.retrievedRecords ?? 0,
      uniqueRegionAidCandidates: region?.individualAidCandidates ?? 0,
      regionDuplicates: region?.duplicateRecords ?? 0,
      geographyDepartments: geography?.departmentCount ?? 0,
      geographyCommunes: geography?.communeCount ?? 0,
      normalizedGeographyCommunes: geography?.normalizedCommuneCount ?? 0,
      geographyDuplicates: geography?.duplicateCount ?? 0,
      geoApiPostalMappings: geography?.geoPostalMappingCount ?? 0,
      postalDatasetRowsRetrieved: postal?.sourceRows ?? 0,
      occitaniePostalRowsNormalized: postal?.occitanieRows ?? 0,
      postalCommunesMatched: postal ? postal.matchedCommunes : null,
      postalDuplicates: postal ? postal.duplicateCount : null,
    },
    regionConsent,
    region,
    geography,
    postalStatus: postal?.status ?? "not-imported-current-run",
    postal,
    errors,
  };
  await writeJson("import-report.json", report);
  console.log(JSON.stringify(report, null, 2));
  if (region?.retrievedRecords) {
    const { qualifyOccitanieRecords } = await import("./qualify-occitanie.mjs");
    await qualifyOccitanieRecords();
  }
  if (errors.length) process.exitCode = 1;
}

function serializeError(error) {
  return { kind: error.kind ?? "UNEXPECTED_ERROR", message: error.message, url: error.url ?? null, details: error.details ?? null };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
