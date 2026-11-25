// Public API of the share feature. Other code imports only from here.
export { buildShareUrl, captureReferral, storedReferral, REFERRAL_PARAM } from "./model/share";
export type { ShareDialogViewModel } from "./view-model/use-share-dialog-view-model";
export { useShareDialogViewModel } from "./view-model/use-share-dialog-view-model";
export { ShareDialogView } from "./view/share-dialog-view";
