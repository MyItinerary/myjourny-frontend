// Public API of the experience-details feature. Other code imports only from here.
export { buildExperienceDetails } from "./model/experience-details";
export type { ExperienceDetailsContent, ExperienceFact } from "./model/experience-details.types";
export type { ExperienceDetailsViewModel } from "./view-model/use-experience-details-view-model";
export { useExperienceDetailsViewModel } from "./view-model/use-experience-details-view-model";
export { ExperienceDetailsView } from "./view/experience-details-view";
