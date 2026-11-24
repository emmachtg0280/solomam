import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { classifyAid, decodeCsvBytes, deduplicateCandidates, getResponse, normalizeGeoPostalMappings, normalizePostalRows, normalizeRegionRecord, parseCsv, validateRequiredCommunes } from "./import-official-data.mjs";
import { qualifyOccitanieRecords } from "./qualify-occitanie.mjs";

test("CSV parser handles delimiter, quoted delimiter, escaped quote and CRLF", () => {
  const rows = parseCsv('Code_commune_INSEE;Nom;Code_postal\r\n34172;"Montpellier; centre";34000\r\n34301;"Sète ""centre""";34200\r\n');
  assert.deepEqual(rows, [
    { Code_commune_INSEE: "34172", Nom: "Montpellier; centre", Code_postal: "34000" },
    { Code_commune_INSEE: "34301", Nom: 'Sète "centre"', Code_postal: "34200" },
  ]);
});

test("CSV parser rejects an unterminated quoted field", () => {
  assert.throws(() => parseCsv('name;description\nA;"incomplete'), (error) => error.kind === "CSV_PARSE_ERROR");
});

test("La Poste headers and Windows-1252 encoding preserve leading zero codes", () => {
  const bytes = Buffer.from('#Code_commune_INSEE;Nom_de_la_commune;Code_postal;Libellé_d_acheminement;Ligne_5\r\n09001;Aigues-Juntes;09100;AIGUES-JUNTES;\r\n09002;L\'Aiguillon;09300;L\'AIGUILLON;Centre\r\n2A004;Ajaccio;20000;AJACCIO;\r\n', "latin1");
  const decoded = decodeCsvBytes(bytes);
  assert.equal(decoded.encoding, "windows-1252");
  assert.match(decoded.text, /Libellé_d_acheminement/);
  const rows = parseCsv(decoded.text);
  const result = normalizePostalRows(rows);
  assert.deepEqual(result.fields, {
    communeField: "#Code_commune_INSEE",
    postalField: "Code_postal",
    nameField: "Nom_de_la_commune",
    deliveryField: "Libellé_d_acheminement",
    line5Field: "Ligne_5",
  });
  assert.equal(result.mappings[0].inseeCode, "09001");
  assert.equal(result.mappings[0].postalCode, "09100");
  assert.equal(typeof result.mappings[0].inseeCode, "string");
  assert.equal(typeof result.mappings[0].postalCode, "string");
  assert.deepEqual(result.mappings[1].line5Values, ["Centre"]);
  assert.equal(result.mappings[2].inseeCode, "2A004");
});

test("La Poste duplicate rows collapse only to the same INSEE/postal pair", () => {
  const parsed = normalizePostalRows([
    { "#Code_commune_INSEE": "34172", Nom_de_la_commune: "Montpellier", Code_postal: "34000", Ligne_5: "Centre" },
    { "#Code_commune_INSEE": "34172", Nom_de_la_commune: "Montpellier", Code_postal: "34000", Ligne_5: "Gare" },
    { "#Code_commune_INSEE": "34172", Nom_de_la_commune: "Montpellier", Code_postal: "34070", Ligne_5: "" },
  ]);
  assert.equal(parsed.mappings.length, 2);
  assert.equal(parsed.duplicateCount, 1);
  assert.equal(parsed.exactDuplicateRowCount, 0);
  assert.equal(parsed.multiRowPairCount, 1);
  assert.deepEqual(parsed.mappings[0].line5Values, ["Centre", "Gare"]);
});

test("UTF-8 CSV is detected before the Windows-1252 fallback", () => {
  assert.deepEqual(decodeCsvBytes(Buffer.from("Nom_de_la_commune\nSète\n", "utf8")), { text: "Nom_de_la_commune\nSète\n", encoding: "utf-8" });
});

test("HTTP transient failures retry, while environment network denial is reported immediately", async () => {
  const originalFetch = globalThis.fetch;
  let attempts = 0;
  try {
    globalThis.fetch = async () => {
      attempts += 1;
      return attempts === 1 ? new Response("busy", { status: 503 }) : new Response("ok", { status: 200 });
    };
    const response = await getResponse("https://example.test/data");
    assert.equal(await response.text(), "ok");
    assert.equal(attempts, 2);

    attempts = 0;
    globalThis.fetch = async () => {
      attempts += 1;
      const error = new Error("permission denied");
      error.cause = { code: "EACCES" };
      throw error;
    };
    await assert.rejects(getResponse("https://example.test/data"), (error) => error.kind === "ENVIRONMENT_NETWORK_DENIED" && error.details.attempts === 1);
    assert.equal(attempts, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("classification only promotes explicit individual audience to manual review candidate", () => {
  assert.equal(classifyAid({ public_cible: "Particuliers" }, "Aide"), "individual-candidate-review-required");
  assert.equal(classifyAid({ porteur: "Associations et collectivités" }, "Aide"), "excluded-organization-audience");
  assert.equal(classifyAid({ public_cible: "Particuliers" }, "Appel à projets"), "excluded-not-aid");
  assert.equal(classifyAid({ description: "Soutenir des projets" }, "Aide"), "manual-audience-review-required");
});

test("deduplication flags exact semantic duplicates but preserves distinct aids with same title", () => {
  const make = (name, officialUrl, id) => ({ name, type: "Aide", officialUrl, validFrom: "2026-01-01", validUntil: "2026-12-31", beneficiaryRaw: "Particuliers", source: { id } });
  const result = deduplicateCandidates([
    make("Aide Été", "https://region.test/a", "1"),
    make("aide ete", "https://region.test/a", "2"),
    make("Aide Été", "https://region.test/b", "3"),
  ]);
  assert.equal(result.records.length, 2);
  assert.equal(result.duplicates, 1);
  assert.equal(result.duplicateRecords[0].duplicateOfSourceId, "1");
});

test("normalized aid entries remain pending and never invent journey fields", () => {
  const item = normalizeRegionRecord({ titre: "Bourse test", type: "Aide", public_cible: "Particuliers", date_debut: "01/01/2026", date_fin: "31/12/2027", url: "https://example.test/aide" });
  assert.equal(item.name, "Bourse test");
  assert.equal(item.audienceReview, "individual-candidate-review-required");
  assert.equal(item.validFrom, "2026-01-01");
  assert.equal(item.validUntil, "2027-12-31");
  assert.equal(item.reviewStatus, "pending");
  assert.equal(item.publicationStatus, "pending");
  assert.equal(item.conditions, null);
  assert.equal(item.documents, null);
  assert.equal(item.applicationSteps, null);
  assert.equal(item.officialUrl, "https://example.test/aide");
});

test("actual Region schema does not confuse publication date with beneficiaries or validity", () => {
  const item = normalizeRegionRecord({
    titre: "Aide test",
    type: "Aides",
    chapo: "Résumé officiel",
    introduction: "Détails officiels",
    date_publication: "2026-11-04 10:39:06",
    date_modification: "2026-11-04 15:07:42",
    url: "https://www.laregion.fr/aide-test",
    thematiques: "Solidarités",
  });
  assert.equal(item.description, "Résumé officiel\n\nDétails officiels");
  assert.equal(item.beneficiaryRaw, null);
  assert.equal(item.validFrom, null);
  assert.equal(item.validUntil, null);
  assert.equal(item.periodStatus, "not-established-from-dataset");
});

test("all 153 imported aid records receive traceable, conservative qualification decisions", async (t) => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const generatedFiles = ["src/data/imports/occitanie/normalized/qualifications.json", "src/data/imports/import-report.json", "src/data/source-registry.json"];
  const originals = await Promise.all(generatedFiles.map((file) => readFile(path.join(repo, file))));
  t.after(() => Promise.all(generatedFiles.map((file, index) => writeFile(path.join(repo, file), originals[index]))));
  const result = await qualifyOccitanieRecords();
  assert.equal(result.qualifications.length, 153);
  assert.deepEqual(result.counts, { relevant: 23, not_relevant: 41, expired: 2, needs_manual_review: 87 });
  assert.equal(new Set(result.qualifications.map((item) => item.id)).size, 153);
  assert.ok(result.qualifications.every((item) => item.sourceRecordHash.length === 64 && item.rawRecordReference.file.endsWith("raw/dataset.json")));
  const rawSnapshot = JSON.parse(await readFile(path.join(repo, "src/data/imports/occitanie/raw/dataset.json"), "utf8"));
  assert.ok(result.qualifications.every((item) => createHash("sha256").update(JSON.stringify(rawSnapshot.records[item.sourceIndex])).digest("hex") === item.sourceRecordHash));
  assert.ok(result.qualifications.every((item) => item.classification.justification.length > 0));
  assert.ok(result.qualifications.every((item) => item.normalized.territory.regionCode === "76"));
  const duplicateCandidates = result.qualifications.filter((item) => item.deduplication.status === "duplicate-candidate");
  assert.equal(duplicateCandidates.length, 23);
  const catalogue = JSON.parse(await readFile(path.join(repo, "src/data/catalogue.json"), "utf8"));
  assert.ok(duplicateCandidates.every((item) => catalogue.some((record) => record.id === item.deduplication.existingCatalogueId && record.url === item.normalized.officialUrl)));
  assert.ok(result.qualifications.every((item) => item.dataQuality.publicationStatus === "not-published"));
  assert.ok(result.qualifications.filter((item) => item.classification.status === "relevant" || item.classification.status === "not_relevant" || item.classification.status === "expired").every((item) => item.sources.some((source) => source.kind === "official-programme-page" && source.status === "official-page-checked")));
  assert.ok(result.qualifications.every((item) => item.normalized.validFrom === null && item.normalized.validUntil === null));
});

test("qualification import is reproducible against the persisted raw snapshot", async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const generatedFiles = ["src/data/imports/occitanie/normalized/qualifications.json", "src/data/imports/import-report.json", "src/data/source-registry.json"];
  const originals = await Promise.all(generatedFiles.map((file) => readFile(path.join(repo, file))));
  try {
    const first = await qualifyOccitanieRecords();
    const firstRecords = JSON.stringify(first.qualifications);
    const second = await qualifyOccitanieRecords();
    assert.equal(JSON.stringify(second.qualifications), firstRecords);
  } finally {
    await Promise.all(generatedFiles.map((file, index) => writeFile(path.join(repo, file), originals[index])));
  }
});

test("geography assertions accept only the exact four INSEE/name pairs", () => {
  const fixture = [
    { nom: "Montpellier", code: "34172" },
    { nom: "Frontignan", code: "34108" },
    { nom: "Sète", code: "34301" },
    { nom: "Béziers", code: "34032" },
  ];
  assert.deepEqual(validateRequiredCommunes(fixture), { Montpellier: true, Frontignan: true, Sète: true, Béziers: true });
  assert.equal(validateRequiredCommunes(fixture.map((item) => item.code === "34172" ? { ...item, nom: "Montpellier-sur-Mer" } : item)).Montpellier, false);
});

test("persisted official API Géo snapshot contains the requested towns and valid postal correspondences", async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const snapshot = JSON.parse(await readFile(path.join(repo, "src/data/imports/geography/raw/communes-occitanie.json"), "utf8"));
  assert.equal(snapshot.sourceUrl, "https://geo.api.gouv.fr/regions/76/departements");
  assert.equal(snapshot.departments.length, 13);
  assert.equal(snapshot.communes.length, 4446);
  assert.equal(new Set(snapshot.communes.map((item) => item.code)).size, snapshot.communes.length);
  const checks = validateRequiredCommunes(snapshot.communes);
  assert.deepEqual(checks, { Montpellier: true, Frontignan: true, Sète: true, Béziers: true });
  const postalPairs = normalizeGeoPostalMappings(snapshot.communes);
  assert.equal(postalPairs.length, 4482);
  assert.equal(new Set(postalPairs.map((item) => `${item.inseeCode}|${item.postalCode}`)).size, postalPairs.length);
  const normalizedGeo = JSON.parse(await readFile(path.join(repo, "src/data/imports/geography/normalized/geo-api-postal-codes-occitanie.json"), "utf8"));
  assert.ok(normalizedGeo.every((item) => item.retrievedAt === snapshot.retrievedAt));
  for (const [name, code, postalCode] of [["Montpellier", "34172", "34000"], ["Frontignan", "34108", "34110"], ["Sète", "34301", "34200"], ["Béziers", "34032", "34500"]]) {
    assert.ok(postalPairs.some((item) => item.communeName === name && item.inseeCode === code && item.postalCode === postalCode));
  }
});

test("La Poste repeated commune/postal pairs are preserved routing variants, not identical rows", async () => {
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const audit = JSON.parse(await readFile(path.join(repo, "src/data/imports/geography/normalized/postal-duplicate-audit.json"), "utf8"));
  const bytes = await readFile(path.join(repo, "src/data/imports/geography/raw/la-poste-hexasmal.csv"));
  const sourceRows = parseCsv(decodeCsvBytes(bytes).text);
  const source = normalizePostalRows(sourceRows);
  const normalized = JSON.parse(await readFile(path.join(repo, "src/data/imports/geography/normalized/postal-codes-occitanie.json"), "utf8"));
  const postalSnapshot = JSON.parse(await readFile(path.join(repo, "src/data/imports/geography/raw/postal-codes-dataset.json"), "utf8"));
  assert.ok(normalized.every((item) => item.retrievedAt === postalSnapshot.retrievedAt && item.sourceDataset === postalSnapshot.datasetId && item.sourceResourceId === postalSnapshot.resource.id));
  const byPair = new Map(normalized.map((item) => [`${item.inseeCode}|${item.postalCode}`, item]));
  const occitanieDepartments = new Set(["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"]);
  for (const mapping of source.mappings.filter((item) => occitanieDepartments.has(item.inseeCode.slice(0, 2)))) {
    const stored = byPair.get(`${mapping.inseeCode}|${mapping.postalCode}`);
    assert.ok(stored, `missing normalized postal pair ${mapping.inseeCode}|${mapping.postalCode}`);
    assert.deepEqual(stored.communeNames, mapping.communeNames);
    assert.deepEqual(stored.deliveryLabels, mapping.deliveryLabels);
    assert.deepEqual(stored.line5Values, mapping.line5Values);
  }
  assert.equal(audit.totalRows, 39192);
  assert.equal(audit.identicalFullRowsRemoved, 0);
  assert.equal(audit.rowsBeyondFirstPerPair, 3681);
  assert.equal(audit.communePostalPairsWithMultipleRows, 2177);
  assert.equal(audit.occitaniePairsWithMultipleRows, 154);
  assert.equal(audit.occitanieRowsBeyondFirstPerPair, 217);
  assert.equal(audit.allOccurrenceVariantsPreserved, true);
});
