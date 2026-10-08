"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api-error";
import { useMe } from "@/lib/queries/auth";
import { useGetProfile, useUpdateProfile, type ProfileUpdatePayload, type ProfileVisibility } from "@/lib/queries/profile";
import {
  useBlockedUsers,
  useLatestDataExport,
  useRequestDataExport,
  useUnblockUser,
} from "@/lib/queries/privacy";
import { ModalShell, Row, SavedBanner, SectionSkeleton, ToggleRow } from "@/components/account-settings/section-ui";

const VISIBILITY_OPTIONS: { value: ProfileVisibility; label: string; meta: string }[] = [
  { value: "public", label: "Public", meta: "Anyone on MyJourny can see your profile" },
  { value: "hosts_booked", label: "Hosts you have booked with", meta: "Nobody else can find you" },
];

type ModalKey = "visibility" | "dataRequest" | "blocked";

function formatDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function PrivacySection() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();
  const { data: blocked = [] } = useBlockedUsers();
  const unblock = useUnblockUser();
  const { data: latestExport } = useLatestDataExport();
  const requestExport = useRequestDataExport();

  const [modal, setModal] = useState<ModalKey | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [visibilityDraft, setVisibilityDraft] = useState<ProfileVisibility>("public");

  if (isLoading) return <SectionSkeleton />;

  const visibility = profile?.profile_visibility ?? "public";
  const visibilityLabel = VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label ?? "Public";
  const reviewsOn = profile?.show_reviews_publicly ?? true;
  const personalisationOn = profile?.personalization_enabled ?? true;
  const email = me?.email ?? "your email";
  const exportPending = latestExport && !["completed", "failed", "expired"].includes(latestExport.status);

  function closeModal() {
    setModal(null);
  }

  function save(payload: ProfileUpdatePayload, message?: string) {
    updateProfile.mutate(payload, {
      onSuccess: () => {
        if (message) setSavedMessage(message);
        closeModal();
      },
      onError: (error) => toast.error(apiErrorMessage(error, "Couldn't save that change.")),
    });
  }

  function openVisibility() {
    setSavedMessage(null);
    setVisibilityDraft(visibility);
    setModal("visibility");
  }

  function openDataRequest() {
    setSavedMessage(null);
    setModal("dataRequest");
  }

  function openBlocked() {
    setSavedMessage(null);
    setModal("blocked");
  }

  const blockedCount =
    blocked.length === 1 ? "1 account blocked" : `${blocked.length} accounts blocked`;

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Privacy
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      <div className="mt-2">
        <Row
          label="Profile visibility"
          value={visibilityLabel}
          note="The other option is visible only to hosts you have booked with."
          actionLabel="Edit"
          onAction={openVisibility}
        />

        <ToggleRow
          label="Show my reviews publicly"
          value={reviewsOn ? "On" : "Off"}
          note="Turning this off hides your name from reviews you have written. The review text stays on the experience."
          on={reviewsOn}
          onToggle={() => save({ show_reviews_publicly: !reviewsOn })}
        />

        <ToggleRow
          label="Data and personalisation"
          value={personalisationOn ? "On" : "Off"}
          note="We use the experiences you view and book, plus your city, to order your feed. Turn this off and you see the same feed as everyone in Lagos."
          on={personalisationOn}
          onToggle={() => save({ personalization_enabled: !personalisationOn })}
        />

        <Row
          label="Download my data"
          value={
            exportPending
              ? `Requested ${formatDay(latestExport.created_at)}. We'll email ${email} when it's ready.`
              : "Bookings, messages, reviews, and payment records"
          }
          note="We email a link within 48 hours. The link works for 7 days."
          actionLabel={exportPending ? "Requested" : "Request"}
          onAction={openDataRequest}
        />

        <div className="flex items-start justify-between gap-8 py-7">
          <div className="flex flex-1 flex-col gap-1">
            <div className="text-base font-medium text-foreground">Blocked accounts</div>
            <div className="text-base text-muted-foreground">{blockedCount}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              You won&apos;t see experiences hosted by people you have blocked.
            </div>
          </div>
          <button
            type="button"
            onClick={openBlocked}
            className="shrink-0 pt-0.5 text-[15px] font-medium text-brand underline hover:text-primary cursor-pointer"
          >
            Manage
          </button>
        </div>
      </div>

      {modal === "visibility" && (
        <ModalShell title="Profile visibility" onClose={closeModal}>
          <div className="flex flex-col gap-2.5">
            {VISIBILITY_OPTIONS.map(({ value, label, meta }) => {
              const selected = visibilityDraft === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibilityDraft(value)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left",
                    selected ? "border-brand border-2" : "border-border",
                  )}
                >
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{label}</div>
                    <div className="text-[13px] text-muted-foreground">{meta}</div>
                  </div>
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-brand" : "border-border",
                    )}
                  >
                    {selected && <div className="size-2.5 rounded-full bg-brand" />}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-full border border-border px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={updateProfile.isPending}
              onClick={() =>
                save(
                  { profile_visibility: visibilityDraft },
                  `Saved. Your profile is now visible to ${visibilityDraft === "public" ? "anyone on MyJourny" : "hosts you have booked with"}.`,
                )
              }
              className="cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540] disabled:cursor-wait disabled:opacity-60"
            >
              Save
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "dataRequest" && (
        <ModalShell title="Request your data" onClose={closeModal}>
          <div className="text-base text-foreground">
            We put together your bookings, messages, reviews, and payment records as one file.
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            We email a link to {email} within 48 hours. The link works for 7 days.
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-full border border-border px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={requestExport.isPending}
              onClick={() =>
                requestExport.mutate(undefined, {
                  onSuccess: () => {
                    setSavedMessage(`Request received. Watch ${email} for the download link within 48 hours.`);
                    closeModal();
                  },
                })
              }
              className="cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540] disabled:cursor-wait disabled:opacity-60"
            >
              Request my data
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "blocked" && (
        <ModalShell title="Blocked accounts" onClose={closeModal}>
          {blocked.length > 0 ? (
            <div className="flex flex-col gap-3">
              {blocked.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-6 rounded-xl border border-border px-4 py-3.5"
                >
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{b.name ?? "MyJourny member"}</div>
                    <div className="text-[13px] text-muted-foreground">Blocked {formatDay(b.blocked_at)}</div>
                  </div>
                  <button
                    type="button"
                    disabled={unblock.isPending}
                    onClick={() =>
                      unblock.mutate(b.id, {
                        onSuccess: () => {
                          setSavedMessage(`${b.name ?? "They"} ${b.name ? "is" : "are"} unblocked.`);
                          closeModal();
                        },
                      })
                    }
                    className="cursor-pointer text-sm font-medium text-brand underline disabled:cursor-wait"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">You have no blocked accounts.</div>
          )}
          <div className="mt-2.5 text-sm text-muted-foreground">
            You won&apos;t see experiences hosted by people you have blocked.
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-full border border-border px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
            >
              Done
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
