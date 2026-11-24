const normalizeIdentityPart = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");

export function aidIdentityKey(record) {
  const name = normalizeIdentityPart(record?.name ?? record?.titre ?? record?.officialName);
  const organization = normalizeIdentityPart(record?.org ?? record?.organization);
  const territory = normalizeIdentityPart(record?.zone ?? record?.territory?.label ?? record?.territory);
  if (!name || !organization || !territory) return null;
  return `${name}|${organization}|${territory}`;
}

export function sameAidIdentity(left, right) {
  const leftKey = aidIdentityKey(left);
  return leftKey !== null && leftKey === aidIdentityKey(right);
}

export function assertUniqueCanonicalAids(records, context = "catalogue") {
  const ids = new Map();
  const identities = new Map();
  for (const record of records) {
    if (typeof record.id !== "string" || !record.id.trim()) throw new Error(`${context}: missing canonical aid ID`);
    const priorId = ids.get(record.id);
    if (priorId) throw new Error(`${context}: duplicate canonical aid ID ${record.id} for ${priorId.name} (${priorId.org}, ${priorId.zone}) and ${record.name} (${record.org}, ${record.zone})`);
    ids.set(record.id, record);
    const identity = aidIdentityKey(record);
    if (!identity) continue;
    const priorIdentity = identities.get(identity);
    if (priorIdentity) {
      throw new Error(`${context}: duplicate aid identity ${record.name} (${record.org}, ${record.zone}) under IDs ${priorIdentity.id} and ${record.id}`);
    }
    identities.set(identity, record);
  }
}
