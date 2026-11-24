export const SERVICE_CATEGORIES = ["Parentalité", "Santé & bien-être", "Dating & vie amoureuse"];

export function canPublishService(service) {
  return Boolean(service
    && service.publicationStatus === "published"
    && service.name
    && SERVICE_CATEGORIES.includes(service.category)
    && ["public-service", "public-directory", "private-platform"].includes(service.kind)
    && service.organization
    && service.description
    && service.audience
    && service.coverage
    && service.accessConditions
    && service.pricing
    && /^https:\/\//.test(service.officialUrl ?? "")
    && service.verifiedAt
    && service.sources?.length
    && service.sources.every((source) => source.url && source.consultedAt));
}
