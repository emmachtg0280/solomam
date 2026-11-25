import servicesData from "@/data/services.json";
import { canPublishService } from "@/lib/services.mjs";

export type ServiceCategory = "Famille & accompagnement" | "Santé & bien-être" | "Dating & relations";
export type ServiceRubric = "droits-demarches" | "famille-enfants" | "vie-quotidienne";
export type SupportService = (typeof servicesData)[number] & { category: ServiceCategory; rubric: ServiceRubric };

export const publishedServices = (servicesData as SupportService[]).filter(canPublishService);
export function getService(slug: string) { return publishedServices.find((service) => service.slug === slug); }
