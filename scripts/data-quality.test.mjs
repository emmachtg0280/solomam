import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPublishInformation, canPublishProcedure } from "../src/lib/publication.mjs";
import { canPublishService } from "../src/lib/services.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (name) => JSON.parse(await readFile(path.join(root, name), "utf8"));

test("canonical catalogue has unique IDs and source URLs", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  assert.equal(catalogue.length, 75);
  assert.equal(new Set(catalogue.map((record) => record.id)).size, catalogue.length);
  const recordsByUrl = new Map();
  for (const record of catalogue) recordsByUrl.set(record.url, [...(recordsByUrl.get(record.url) ?? []), record.id]);
  const sharedSourcePages = [...recordsByUrl.values()].filter((ids) => ids.length > 1).map((ids) => ids.sort());
  assert.deepEqual(sharedSourcePages, [["caf-herault-mobilite-insertion", "caf-herault-pret-equipement-logement"], ["fsl-31-departement", "fsl-31-toulouse-metropole"]]);
  assert.ok(catalogue.every((record) => record.id && record.name && record.url));
  assert.doesNotMatch(JSON.stringify(catalogue), /Ã|â€™|â€“|â€”|â‚¬/);
});

test("all regional candidates retain source identity and remain unpublished pending process review", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const snapshot = await readJson("src/data/imports/occitanie/raw/dataset.json");
  const regional = catalogue.filter((record) => record.id.startsWith("occ-"));
  assert.equal(regional.length, 25);
  for (const record of regional) {
    const audit = review[record.id];
    assert.equal(audit.publicationStatus, record.id === "occ-la-mobilite-internationale-des-etudiants-avec-mouv-occitanie" ? "published" : "pending");
    assert.equal(audit.sourceDatasetRecord.qualification.status, "relevant");
    assert.equal(audit.sourceDatasetRecord.sourceRecordHash.length, 64);
    assert.equal(createHash("sha256").update(JSON.stringify(snapshot.records[audit.sourceDatasetRecord.sourceRecordIndex])).digest("hex"), audit.sourceDatasetRecord.sourceRecordHash);
    assert.ok(audit.factSources.some((source) => source.url === record.url));
    assert.ok(["incomplete", "partially_complete"].includes(audit.applicationProcedure.status));
    assert.ok(audit.applicationProcedure.remainingChecks.length > 0);
  }
});

test("normalized regional records decode readable French while preserving the raw snapshot hash", async () => {
  const qualifications = await readJson("src/data/imports/occitanie/normalized/qualifications.json");
  const snapshot = await readJson("src/data/imports/occitanie/raw/dataset.json");
  assert.doesNotMatch(JSON.stringify(qualifications), /Ã|â€™|â€“|â€”|â‚¬/);
  for (const record of qualifications.records) {
    assert.equal(createHash("sha256").update(JSON.stringify(snapshot.records[record.sourceIndex])).digest("hex"), record.sourceRecordHash);
  }
});

test("fact-level evidence references resolve and no unpublished fact is presented as eligible", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  for (const record of catalogue) {
    const audit = review[record.id];
    assert.ok(audit, `missing review for ${record.id}`);
    const evidenceIds = new Set([...(audit.sources ?? []), ...(audit.factSources ?? [])].map((source) => source.id).filter(Boolean));
    for (const fact of audit.facts ?? []) {
      assert.ok(["verified", "partially_verified", "unverified", "conflict"].includes(fact.status));
      assert.ok(fact.sourceIds.every((sourceId) => evidenceIds.has(sourceId)), `${record.id}.${fact.field}: dangling source reference`);
    }
    if (audit.informationPublicationStatus === "verified") assert.equal(canPublishInformation(record, audit), true);
    if (audit.procedurePublicationStatus === "complete") assert.equal(canPublishProcedure(audit), true);
  }
});

test("information publication is independent from procedure completeness", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  for (const id of ["asf", "af", "prime", "css", "rsa-parent-isole", "prepare", "aeeh"]) {
    const record = review[id];
    const canonical = catalogue.find((item) => item.id === id);
    assert.ok(record.facts.length >= 4);
    assert.equal(record.informationPublicationStatus, "verified");
    assert.equal(record.informationVerifiedAt, "2026-11-23");
    assert.equal(canPublishInformation(canonical, record), true);
    for (const requiredField of ["current_status", "territory", "audience", "core_conditions"]) {
      const fact = record.facts.find((item) => item.field === requiredField);
      assert.equal(fact.status, "verified");
      assert.ok(fact.sourceIds.length > 0);
    }
    assert.equal(record.procedurePublicationStatus ?? "pending", "pending");
    assert.notEqual(canPublishProcedure(record), true);
    assert.equal(record.publicationStatus, "pending");
  }
  assert.ok(review.asf.facts.some((fact) => fact.field === "pension_scenarios" && fact.value.includes("4 mois")));
  assert.match(review.asf.facts.find((fact) => fact.field === "core_conditions").value, /incohérence/);
  assert.equal(review.asf.facts.find((fact) => fact.field === "amount").status, "conflict");
  assert.ok(review.css.applicationProcedure.renewal.text.includes("un an"));
  assert.equal(catalogue.filter((item) => canPublishInformation(item, review[item.id])).length, 27);
  assert.deepEqual(catalogue.filter((item) => ["apl", "alf", "als"].includes(item.id)).map(({ id }) => id).sort(), ["alf", "als", "apl"]);
  assert.equal(catalogue.some((item) => item.id === "logement"), false);
  assert.equal(review.logement.recordLifecycle, "superseded");
  assert.deepEqual(review.logement.supersededBy, ["apl", "alf", "als"]);
  for (const id of ["apl", "alf", "als"]) {
    const entry = review[id];
    assert.equal(entry.informationPublicationStatus, "verified");
    assert.equal(canPublishInformation(catalogue.find((item) => item.id === id), entry), true);
    assert.equal(entry.procedurePublicationStatus, "pending");
    assert.equal(canPublishProcedure(entry), false);
    assert.ok(entry.facts.some((fact) => fact.field === "audience" && fact.status === "verified"));
    assert.ok(entry.facts.some((fact) => fact.field === "documents" && fact.sourceIds.length));
  }
  assert.ok(catalogue.every((item) => ["pending", "verified"].includes(review[item.id].informationPublicationStatus)));
  assert.ok(catalogue.every((item) => ["pending", "complete"].includes(review[item.id].procedurePublicationStatus)));
  for (const id of ["asf", "af", "prime", "css", "rsa-parent-isole", "prepare", "aeeh"]) {
    assert.equal(review[id].notes.filter((note) => note.startsWith("Fiche d'information publiée après vérification des faits essentiels.")).length, 1);
  }
});

test("Hérault local candidates preserve source evidence and publish only the verified AFIE summary", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const afie = catalogue.find((item) => item.id === "afie-herault");
  assert.ok(afie);
  assert.equal(review[afie.id].informationPublicationStatus, "verified");
  assert.equal(canPublishInformation(afie, review[afie.id]), true);
  assert.equal(review[afie.id].publicationStatus, "published");
  assert.ok(review[afie.id].facts.some((fact) => fact.field === "amount" && fact.status === "unverified" && fact.value === null));

  for (const id of ["caf-herault-secours-prets", "caf-herault-pret-equipement-logement", "caf-herault-mobilite-insertion"]) {
    const record = catalogue.find((item) => item.id === id);
    assert.ok(record);
    assert.equal(review[id].informationPublicationStatus, "verified");
    assert.equal(canPublishInformation(record, review[id]), true);
    assert.equal(review[id].publicationStatus, "published");
    assert.equal(review[id].procedurePublicationStatus, "pending");
  }
  for (const id of ["bouclier-social-petite-enfance-montpellier"]) {
    const record = catalogue.find((item) => item.id === id);
    assert.ok(record);
    assert.equal(review[id].informationPublicationStatus, "pending");
    assert.equal(canPublishInformation(record, review[id]), false);
    assert.ok(review[id].factSources.some((source) => source.url.startsWith("https://")));
  }
});

test("Gard FSL access aid is separate, sourced, and limited to verified 2026 criteria", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const record = catalogue.find((item) => item.id === "fsl-gard-acces");
  assert.ok(record);
  assert.equal(review[record.id].informationPublicationStatus, "verified");
  assert.equal(canPublishInformation(record, review[record.id]), true);
  assert.equal(review[record.id].publicationStatus, "published");
  assert.equal(review[record.id].procedurePublicationStatus, "pending");
  assert.match(review[record.id].facts.find((fact) => fact.field === "core_conditions").value, /33 %/);
  assert.ok(review[record.id].factSources.some((source) => source.url.includes("baremes-fsl.html")));
});

test("departmental source registry contains stable entries for all Occitanie departments", async () => {
  const registry = await readJson("src/data/source-registry.json");
  const coverage = await readJson("src/data/coverage-matrix.json");
  const territorialSources = registry.sources.filter((source) => source.id.startsWith("territory-"));
  assert.equal(new Set(territorialSources.map((source) => source.territory.departmentCode)).size, 13);
  assert.equal(territorialSources.length, 26);
  assert.equal(registry.sources.filter((source) => ["caf-herault-individual-aid-page", "caf-herault-rias-2026", "herault-rdas-2026", "herault-fsl-overview", "montpellier-ccas-rights", "montpellier-bouclier-page", "montpellier-bouclier-regulation-2025", "frontignan-ccas", "sete-ccas-discovery", "beziers-ccas-social"].includes(source.id)).length, 10);
  const ariegeSource = registry.sources.find((source) => source.id === "ariege-rdas-pdf");
  assert.equal(ariegeSource.status, "official-source-current-version-unconfirmed");
  assert.ok(territorialSources.every((source) => source.lastCollection === null && source.recordsImported === 0));
  assert.equal(coverage.territories.filter((territory) => territory.status === "identified").length, 0);
  assert.equal(coverage.territories.find((territory) => territory.id === "30").status, "partially_integrated");
  for (const department of ["09", "11", "12", "31", "32", "46", "48", "65", "66", "81", "82"]) {
    assert.equal(coverage.territories.find((territory) => territory.id === department).status, "partially_integrated");
  }
});

test("local aid integration and departmental registry rebuild idempotently", async () => {
  const ids = ["afie-herault", "caf-herault-secours-prets", "bouclier-social-petite-enfance-montpellier", "fsl-gard-acces", "fsl-09", "fsl-11", "fsl-12", "fsl-31-departement", "fsl-31-toulouse-metropole", "fsl-82", "aide-urgence-gers", "caf-aveyron-projet-familial", "fdaj-herault", "faj3m-montpellier", "ccas-montpellier-aide-facultative", "ccas-frontignan-energy-aid"];
  const readManaged = async () => {
    const catalogue = await readJson("src/data/catalogue.json");
    const review = await readJson("src/data/review.json");
    const registry = await readJson("src/data/source-registry.json");
    const coverage = await readJson("src/data/coverage-matrix.json");
    return {
      records: catalogue.filter((item) => ids.includes(item.id)),
      audits: Object.fromEntries(ids.map((id) => [id, review[id]])),
      sources: registry.sources.filter((source) => source.id.startsWith("territory-") || source.id.startsWith("adhl-gard-") || source.id.startsWith("fsl-") || source.id === "ariege-rdas-pdf" || source.id === "caf-aveyron-rias-2026"),
      coverage,
    };
  };
  const before = await readManaged();
  for (const script of ["scripts/integrate-herault-local-aids.mjs", "scripts/integrate-gard-fsl.mjs", "scripts/integrate-occitanie-departmental-candidates.mjs", "scripts/register-departmental-sources.mjs"]) {
    execFileSync(process.execPath, [script], { cwd: root, stdio: "ignore" });
  }
  assert.deepEqual(await readManaged(), before);
});

test("regional editorial exclusions retain qualifications and raw provenance", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const qualifications = await readJson("src/data/imports/occitanie/normalized/qualifications.json");
  const decisions = await readJson("src/data/imports/occitanie/normalized/official-page-decisions.json");
  const excluded = Object.keys(decisions.editorialExclusions ?? {});
  assert.equal(excluded.length, 3);
  for (const url of excluded) {
    assert.equal(catalogue.some((aid) => aid.url === url), false);
    const qualification = qualifications.records.find((item) => item.normalized.officialUrl === url);
    assert.ok(qualification?.rawRecordReference?.file);
    assert.equal(qualification.editorialDisposition.status, "excluded-from-editorial-catalogue");
  }
  for (const id of ["occ-aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire", "occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale"]) {
    const aid = catalogue.find((item) => item.id === id);
    assert.ok(aid);
    assert.equal(review[id].publicationStatus, "pending");
  }
  const sportAudit = review["occ-aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire"];
  assert.equal(sportAudit.informationPublicationStatus, "pending");
  assert.match(sportAudit.facts.find((fact) => fact.field === "audience").value, /associations sportives/);
  assert.match(sportAudit.facts.find((fact) => fact.field === "core_conditions").value, /20 €/);
  assert.equal(qualifications.records.filter((item) => item.editorialDisposition.status === "candidate-retained-for-review").length, 2);
});

test("local aid snapshots preserve CAF and FSL scope distinctions", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const toulouse = await readJson("src/data/territories/toulouse-metropole.json");
  const rias = await readJson("src/data/imports/local/herault/normalized/rias-aides-extract-2026.json");
  const familyAid = catalogue.find((aid) => aid.id === "caf-aveyron-projet-familial");
  assert.equal(canPublishInformation(familyAid, review[familyAid.id]), true);
  assert.equal(review[familyAid.id].publicationStatus, "published");
  assert.equal(toulouse.epciCode, "243100518");
  assert.equal(toulouse.communes.length, 37);
  assert.equal(new Set(toulouse.communes.map((commune) => commune.inseeCode)).size, 37);
  assert.equal(rias.extractedSections.some((section) => section.section.includes("Secours et prêts sociaux")), true);
  assert.ok(catalogue.some((aid) => aid.id === "fsl-31-departement"));
  assert.ok(catalogue.some((aid) => aid.id === "fsl-31-toulouse-metropole"));
  assert.equal(review["ccas-frontignan-energy-aid"].informationPublicationStatus, "pending");
});

test("21 local additions publish only when essential information is verified", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const additions = [
    "occ-aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire",
    "occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale",
    "caf-herault-pret-equipement-logement", "caf-herault-mobilite-insertion",
    "fsl-09", "fsl-11", "fsl-12", "fsl-31-departement", "fsl-31-toulouse-metropole",
    "aide-urgence-gers", "fsl-46", "fsl-48", "fsl-65", "fsl-66", "fsl-81", "fsl-82",
    "caf-aveyron-projet-familial", "fdaj-herault", "faj3m-montpellier",
    "ccas-montpellier-aide-facultative", "ccas-frontignan-energy-aid",
  ];
  assert.equal(additions.length, 21);
  assert.equal(new Set(catalogue.map(({ id }) => id)).size, catalogue.length);
  for (const id of additions) assert.ok(catalogue.some((record) => record.id === id), `missing canonical record ${id}`);
  for (const id of ["caf-herault-pret-equipement-logement", "caf-herault-mobilite-insertion", "aide-urgence-gers", "caf-aveyron-projet-familial", "fdaj-herault", "faj3m-montpellier"]) {
    const record = catalogue.find((item) => item.id === id);
    const audit = review[id];
    assert.equal(audit.informationPublicationStatus, "verified");
    assert.equal(audit.publicationStatus, "published");
    assert.equal(audit.procedurePublicationStatus, "pending");
    assert.ok(audit.informationVerifiedAt);
    assert.equal(canPublishInformation(record, audit), true);
  }
  const equipment = catalogue.find((record) => record.id === "caf-herault-pret-equipement-logement");
  const equipmentAudit = review[equipment.id];
  assert.equal(canPublishInformation(equipment, {
    ...equipmentAudit,
    facts: equipmentAudit.facts.map((fact) => fact.field === "core_conditions" ? { ...fact, status: "unverified" } : fact),
  }), false, "an unverified essential condition keeps the information hidden");
  assert.match(equipmentAudit.facts.find((fact) => fact.field === "audience").value, /QF|quotient familial/i);
  assert.match(review["aide-urgence-gers"].facts.find((fact) => fact.field === "core_conditions").value, /évaluation sociale/);
  assert.match(catalogue.find((record) => record.id === "aide-urgence-gers").description, /n’est pas automatique/);
  for (const id of ["fdaj-herault", "faj3m-montpellier", "caf-aveyron-projet-familial", "caf-herault-secours-prets"]) {
    const record = catalogue.find((item) => item.id === id);
    assert.match(`${record.description} ${record.when}`, /commission|décision|ponctuelle|cas par cas/i, `${id} must not imply automatic entitlement`);
  }
  for (const id of additions.filter((value) => value.startsWith("fsl-"))) {
    const record = catalogue.find((item) => item.id === id);
    if (id !== "fsl-31-toulouse-metropole") assert.equal(record.zone, id.slice(4, 6));
    if (review[id].informationPublicationStatus !== "verified") assert.equal(canPublishInformation(record, review[id]), false);
  }
  assert.equal(review["fsl-31-toulouse-metropole"].informationPublicationStatus, "pending");
  assert.equal(review["ccas-montpellier-aide-facultative"].informationPublicationStatus, "pending");
  assert.equal(review["ccas-frontignan-energy-aid"].informationPublicationStatus, "pending");
  assert.equal(review["occ-aides-en-faveur-du-developpement-de-la-pratique-du-sport-scolaire"].informationPublicationStatus, "pending");
  assert.equal(review["occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale"].informationPublicationStatus, "pending");
});

test("Mouv’Occitanie is verified once under its canonical ID with an official current source", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const registry = await readJson("src/data/source-registry.json");
  const id = "occ-la-mobilite-internationale-des-etudiants-avec-mouv-occitanie";
  const aid = catalogue.find((record) => record.id === id);
  assert.ok(aid);
  assert.equal(review[id].informationPublicationStatus, "verified");
  assert.equal(review[id].publicationStatus, "published");
  assert.equal(review[id].procedurePublicationStatus, "pending");
  assert.equal(canPublishInformation(aid, review[id]), true);
  assert.match(review[id].facts.find((fact) => fact.field === "core_conditions").value, /sélectionné par son établissement/);
  assert.match(aid.description, /sélection par l’établissement/);
  const duplicate = review["occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale"];
  assert.equal(duplicate.recordLifecycle, "duplicate");
  assert.equal(duplicate.duplicateOf, id);
  assert.equal(duplicate.publicationStatus, "pending");
  assert.equal(registry.sources.filter((source) => source.id === "mouv-occitanie-official-guidance-2026").length, 1);
  const before = { aid, audit: review[id], duplicate, source: registry.sources.find((source) => source.id === "mouv-occitanie-official-guidance-2026") };
  execFileSync(process.execPath, ["scripts/verify-mouv-occitanie.mjs"], { cwd: root, stdio: "ignore" });
  const nextCatalogue = await readJson("src/data/catalogue.json");
  const nextReview = await readJson("src/data/review.json");
  const nextRegistry = await readJson("src/data/source-registry.json");
  assert.deepEqual({
    aid: nextCatalogue.find((record) => record.id === id),
    audit: nextReview[id],
    duplicate: nextReview["occ-avec-mouv-occitanie-la-region-t-aide-pour-ta-mobilite-internationale"],
    source: nextRegistry.sources.find((source) => source.id === "mouv-occitanie-official-guidance-2026"),
  }, before);
});

test("new PAJE and AJPP records retain official evidence, uncertainty, and separate procedure status", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  for (const id of ["paje-prime-naissance", "paje-allocation-base", "paje-prime-adoption", "ajpp"]) {
    const aid = catalogue.find((item) => item.id === id);
    const audit = review[id];
    assert.ok(aid);
    assert.equal(audit.informationPublicationStatus, "verified");
    assert.equal(canPublishInformation(aid, audit), true);
    assert.equal(audit.procedurePublicationStatus ?? "pending", "pending");
    assert.equal(canPublishProcedure(audit), false);
    assert.ok(audit.sources.some((source) => source.url.includes("service-public.gouv.fr")));
  }
  for (const id of ["paje-prime-naissance", "paje-allocation-base", "paje-prime-adoption"]) assert.ok(review[id].facts.some((fact) => fact.field === "amount" && fact.status === "conflict"));
  assert.ok(review.ajpp.facts.some((fact) => fact.field === "amount" && fact.status === "verified"));
  assert.ok(review["paje-prime-naissance"].facts.find((fact) => fact.field === "amount").sourceIds.length >= 2);
  assert.ok(review.ajpp.applicationProcedure.remainingChecks.length > 0);
});

test("new regional vehicle aid retains its precise campaign, documents and territorial source evidence", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const aid = catalogue.find((item) => item.url === "https://www.laregion.fr/eco-cheque-mobilite-vehicule-electrique-occasion");
  const audit = review[aid.id];
  assert.equal(audit.informationPublicationStatus, "verified");
  assert.equal(canPublishInformation(aid, audit), true);
  assert.equal(audit.applicationProcedure.status, "partially_complete");
  assert.equal(canPublishProcedure(audit), false);
  assert.match(audit.facts.find((fact) => fact.field === "core_conditions").value, /30 000 € TTC/);
  assert.match(audit.facts.find((fact) => fact.field === "documents").value, /RIB/);
  assert.ok(audit.factSources.some((source) => source.url.endsWith(".pdf")));
});

test("publication gate rejects missing, unverified, conflict, and dangling required evidence", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const record = catalogue.find((item) => item.id === "css");
  const base = structuredClone(review.css);
  assert.equal(canPublishInformation(record, { ...base, informationPublicationStatus: "pending" }), false);
  assert.equal(canPublishInformation(record, { ...base, facts: base.facts.filter((fact) => fact.field !== "territory") }), false);
  const conflict = structuredClone(base);
  conflict.facts.find((fact) => fact.field === "audience").status = "conflict";
  assert.equal(canPublishInformation(record, conflict), false);
  const dangling = structuredClone(base);
  dangling.facts.find((fact) => fact.field === "core_conditions").sourceIds = ["missing-source"];
  assert.equal(canPublishInformation(record, dangling), false);
});

test("a procedure needs a confirmed organization, portal, sourced steps and verified documents", () => {
  const complete = { applicationProcedure: {
    status: "complete", remainingChecks: [], competentOrganization: "Caf", portalUrl: "https://example.gouv.fr/depot",
    steps: [{ text: "Déposer", sourceIds: ["official"], status: "verified" }],
    documents: { status: "verified", sourceIds: ["official"] },
  } };
  assert.equal(canPublishProcedure(complete), true);
  assert.equal(canPublishProcedure({ applicationProcedure: { ...complete.applicationProcedure, documents: undefined } }), false);
  assert.equal(canPublishProcedure({ applicationProcedure: { ...complete.applicationProcedure, steps: [{ ...complete.applicationProcedure.steps[0], sourceIds: [] }] } }), false);
});

test("Hérault FSL variants remain separate and retain the 31-commune boundary", async () => {
  const review = await readJson("src/data/review.json");
  const catalogue = await readJson("src/data/catalogue.json");
  assert.ok(catalogue.some((record) => record.id === "fsl" && record.zone === "34"));
  assert.ok(catalogue.some((record) => record.id === "fsl-m3m" && record.zone === "34"));
  assert.equal(review.fsl.publicationStatus, "published");
  assert.equal(review["fsl-m3m"].publicationStatus, "published");
  assert.equal(canPublishInformation(catalogue.find((record) => record.id === "fsl"), review.fsl), true);
  assert.equal(canPublishInformation(catalogue.find((record) => record.id === "fsl-m3m"), review["fsl-m3m"]), true);
  assert.match(review.fsl.facts.find((fact) => fact.field === "territory").value, /hors des 31 communes/);
  assert.match(review["fsl-m3m"].facts.find((fact) => fact.field === "territory").value, /31 communes/);
  assert.match(review.fsl.facts.find((fact) => fact.field === "core_conditions").value, /aucune ressource/);
  assert.match(review["fsl-m3m"].facts.find((fact) => fact.field === "core_conditions").value, /ACS/);
  assert.equal(review["fsl-m3m"].applicationProcedure.steps.length, 3);
  assert.equal(review.fsl.applicationProcedure.steps.length, 2);
  assert.equal(review.fsl.procedurePublicationStatus, "pending");
  assert.equal(review["fsl-m3m"].procedurePublicationStatus, "pending");
  assert.equal(review.logement.informationPublicationStatus ?? "pending", "pending", "combined APL/ALF/ALS record is held until distinct legal benefits are modeled");
});

test("published services are sourced and kept separate from administrative aids", async () => {
  const services = await readJson("src/data/services.json");
  const catalogue = await readJson("src/data/catalogue.json");
  const geo = await readJson("src/data/territories/montpellier-metropole.json");
  assert.equal(services.length, 4);
  assert.ok(services.every(canPublishService));
  assert.deepEqual(new Set(services.map((service) => service.category)), new Set(["Parentalité", "Santé & bien-être", "Dating & vie amoureuse"]));
  const dating = services.find((service) => service.category === "Dating & vie amoureuse");
  assert.equal(dating.kind, "private-platform");
  assert.match(dating.pricing, /facultatif payant/);
  assert.ok(!catalogue.some((aid) => aid.id === dating.id), "private dating service must not enter aid catalogue");
  assert.equal(geo.epciCode, "243400017");
  assert.equal(geo.communes.length, 31);
  assert.equal(new Set(geo.communes.map((commune) => commune.inseeCode)).size, 31);
  assert.ok(geo.communes.some((commune) => commune.inseeCode === "34172" && commune.communeName === "Montpellier"));
  assert.ok(!canPublishService({ ...dating, sources: [] }));
  assert.ok(!canPublishService({ ...dating, category: "Emploi" }));
});

test("source registry preserves prior evidence and reports current regional review totals", async () => {
  const registry = await readJson("src/data/source-registry.json");
  const qualifications = await readJson("src/data/imports/occitanie/normalized/qualifications.json");
  assert.equal(new Set(registry.sources.map((source) => source.id)).size, registry.sources.length);
  const servicePublic = registry.sources.find((source) => source.id === "service-public");
  assert.ok(servicePublic.evidence.length >= 12);
  const regional = registry.sources.find((source) => source.id === "region-official-catalogue");
  assert.equal(regional.pagesReviewed, 153);
  assert.equal(regional.pendingManualReview, 0);
  assert.equal(qualifications.records.filter((record) => record.classification.status === "needs_manual_review").length, regional.pendingManualReview);
  assert.ok(!regional.limitations.some((limitation) => /remaining 94 official pages/i.test(limitation)));
});

test("new national records include sourced rules and separate procedure branches", async () => {
  const review = await readJson("src/data/review.json");
  const catalogue = await readJson("src/data/catalogue.json");
  for (const id of ["rsa-parent-isole", "prepare", "aeeh"]) {
    assert.ok(catalogue.some((record) => record.id === id && record.zone === "national"));
    assert.equal(review[id].publicationStatus, "pending");
    assert.ok(review[id].facts.length >= 4);
    assert.ok(review[id].applicationProcedure.steps.length >= 3);
    assert.ok(review[id].applicationProcedure.remainingChecks.length > 0);
  }
  assert.ok(review["rsa-parent-isole"].facts.some((fact) => fact.field === "parental_lump_sum_period"));
  assert.ok(review.prepare.facts.some((fact) => fact.field === "contribution_condition"));
  assert.ok(review.aeeh.facts.some((fact) => fact.field === "child_income"));
});
