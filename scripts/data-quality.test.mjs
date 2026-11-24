import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { canPublishInformation, canPublishProcedure } from "../src/lib/publication.mjs";
import { canPublishService } from "../src/lib/services.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (name) => JSON.parse(await readFile(path.join(root, name), "utf8"));

test("canonical catalogue has unique IDs and source URLs", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  assert.equal(catalogue.length, 50);
  assert.equal(new Set(catalogue.map((record) => record.id)).size, catalogue.length);
  assert.equal(new Set(catalogue.map((record) => record.url)).size, catalogue.length);
  assert.ok(catalogue.every((record) => record.id && record.name && record.url));
  assert.doesNotMatch(JSON.stringify(catalogue), /Ã|â€™|â€“|â€”|â‚¬/);
});

test("all regional candidates retain source identity and remain unpublished pending process review", async () => {
  const catalogue = await readJson("src/data/catalogue.json");
  const review = await readJson("src/data/review.json");
  const snapshot = await readJson("src/data/imports/occitanie/raw/dataset.json");
  const regional = catalogue.filter((record) => record.id.startsWith("occ-"));
  assert.equal(regional.length, 23);
  for (const record of regional) {
    const audit = review[record.id];
    assert.equal(audit.publicationStatus, "pending");
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
  assert.equal(catalogue.filter((item) => canPublishInformation(item, review[item.id])).length, 17);
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
  assert.equal(regional.pagesReviewed, 66);
  assert.equal(regional.pendingManualReview, 87);
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
