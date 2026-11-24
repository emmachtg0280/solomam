import servicesData from "@/data/services.json";
import { canPublishService } from "@/lib/services.mjs";

export type ServiceCategory = "Parentalité" | "Santé & bien-être" | "Dating & vie amoureuse";
export type SupportService = (typeof servicesData)[number] & { category: ServiceCategory };

export const publishedServices = (servicesData as SupportService[]).filter(canPublishService);
export function getService(slug: string) { return publishedServices.find((service) => service.slug === slug); }
