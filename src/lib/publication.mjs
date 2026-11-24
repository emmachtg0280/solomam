const INFORMATION_FIELDS = ["current_status", "territory", "audience", "core_conditions"];

export function canPublishInformation(record, audit) {
  if (audit.informationPublicationStatus !== "verified" || !audit.informationVerifiedAt) return false;
  const sources = [...(audit.sources ?? []), ...(audit.factSources ?? [])];
  const sourceIds = new Set(sources.map((source) => source.id).filter(Boolean));
  const facts = audit.facts ?? [];
  return INFORMATION_FIELDS.every((field) => {
    const fact = facts.find((item) => item.field === field);
    return fact?.status === "verified" && Boolean(fact.value?.trim()) && fact.sourceIds.length > 0 && fact.sourceIds.every((id) => sourceIds.has(id));
  }) && sources.some((source) => source.kind !== "dataset" && /^https:\/\//.test(source.url))
    && Boolean(record.name && record.org && record.zone && record.url);
}

export function canPublishProcedure(audit) {
  const procedure = audit.applicationProcedure;
  if (!procedure || procedure.status !== "complete" || procedure.remainingChecks.length > 0 || !procedure.competentOrganization || !procedure.portalUrl) return false;
  return procedure.steps.length > 0 && procedure.steps.every((step) =>
    ["verified", "verified_conditional"].includes(step.status) && step.sourceIds.length > 0,
  ) && ["verified", "not_applicable"].includes(procedure.documents?.status)
    && procedure.documents?.sourceIds?.length > 0;
}
