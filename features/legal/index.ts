export { cancellationData } from "./model/cancellation-data";
export { termsData } from "./model/terms-data";
export type {
  BulletItem,
  ShortVersionItem,
  TableOfContentsItem,
  TermsData,
  TermsParagraph,
  TermsSection,
} from "./model/terms.types";
export {
  useCancellationViewModel,
  type CancellationViewModel,
} from "./view-model/use-cancellation-view-model";
export { useTermsViewModel, type TermsViewModel } from "./view-model/use-terms-view-model";
export { CancellationView } from "./view/cancellation-view";
export { FormattedText, TermsView } from "./view/terms-view";
