import test from "node:test";
import assert from "node:assert/strict";
import { LEGACY_AID_KEYS, SAVED_AIDS_KEY, readSavedAidIdsFrom, saveAidIdTo } from "../src/lib/saved-aids.mjs";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    dump: () => Object.fromEntries(values),
  };
}

test("saved aids persist unique published identifiers and can be removed", () => {
  const storage = memoryStorage();
  const ids = ["asf", "apl"];
  assert.equal(saveAidIdTo(storage, "asf", true, ids), true);
  assert.equal(saveAidIdTo(storage, "asf", true, ids), true);
  assert.equal(saveAidIdTo(storage, "apl", true, ids), true);
  assert.deepEqual(readSavedAidIdsFrom(storage, ids), ["asf", "apl"]);
  assert.equal(saveAidIdTo(storage, "asf", false, ids), true);
  assert.deepEqual(readSavedAidIdsFrom(storage, ids), ["apl"]);
  assert.equal(saveAidIdTo(storage, "unpublished", true, ids), false);
});

test("migrates old checklist/status structures to saved aid identifiers only", () => {
  const storage = memoryStorage({
    [LEGACY_AID_KEYS[0]]: JSON.stringify({ asf: { status: "sent", steps: [true, false] }, stale: { status: "todo", steps: [] } }),
    [LEGACY_AID_KEYS[1]]: JSON.stringify({ apl: [false, true], asf: [false] }),
  });
  assert.deepEqual(readSavedAidIdsFrom(storage, ["asf", "apl"]), ["asf", "apl"]);
  assert.deepEqual(JSON.parse(storage.getItem(SAVED_AIDS_KEY)), ["asf", "apl"]);
  assert.equal(storage.getItem(LEGACY_AID_KEYS[0]), null);
  assert.equal(storage.getItem(LEGACY_AID_KEYS[1]), null);
  assert.equal(storage.getItem(SAVED_AIDS_KEY).includes("status"), false);
  assert.equal(storage.getItem(SAVED_AIDS_KEY).includes("true"), false);
});

test("normalizes stale and duplicate saved ids without resurrecting cleared legacy state", () => {
  const storage = memoryStorage({
    [SAVED_AIDS_KEY]: JSON.stringify(["asf", "asf", "removed-aid", 4]),
    [LEGACY_AID_KEYS[0]]: JSON.stringify({ apl: { status: "todo", steps: [true] } }),
  });
  assert.deepEqual(readSavedAidIdsFrom(storage, ["asf", "apl"]), ["asf"]);
  assert.deepEqual(JSON.parse(storage.getItem(SAVED_AIDS_KEY)), ["asf"]);
  assert.equal(storage.getItem(LEGACY_AID_KEYS[0]), null);
  const cleared = memoryStorage({
    [SAVED_AIDS_KEY]: "[]",
    [LEGACY_AID_KEYS[0]]: JSON.stringify({ apl: { status: "todo", steps: [true] } }),
  });
  assert.deepEqual(readSavedAidIdsFrom(cleared, ["apl"]), []);
});

test("malformed legacy storage recovers as an empty list", () => {
  const storage = memoryStorage({ [LEGACY_AID_KEYS[0]]: "{bad json" });
  assert.deepEqual(readSavedAidIdsFrom(storage, ["asf"]), []);
  assert.deepEqual(JSON.parse(storage.getItem(SAVED_AIDS_KEY)), []);
});
