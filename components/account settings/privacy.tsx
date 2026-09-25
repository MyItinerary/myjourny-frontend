"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ModalShell, Row, SavedBanner, ToggleRow } from "@/components/account settings/section-ui";

interface BlockedAccount {
  name: string;
  meta: string;
}

const INITIAL_BLOCKED: BlockedAccount[] = [
  { name: "Chidi Nwosu", meta: "Blocked 8 January 2026" },
];

const VISIBILITY_OPTIONS = [
  { label: "Public", meta: "Anyone on MyJourny can see your profile" },
  { label: "Hosts you have booked with", meta: "Nobody else can find you" },
] as const;

type ModalKey = "visibility" | "dataRequest" | "blocked";

export function PrivacySection() {
  const [visibility, setVisibility] = useState<string>("Public");
  const [reviewsOn, setReviewsOn] = useState(true);
  const [personalisationOn, setPersonalisationOn] = useState(true);
  const [blocked, setBlocked] = useState<BlockedAccount[]>(INITIAL_BLOCKED);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [visibilityDraft, setVisibilityDraft] = useState(visibility);

  function closeModal() {
    setModal(null);
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
          value={visibility}
          note="The other option is visible only to hosts you have booked with."
          actionLabel="Edit"
          onAction={openVisibility}
        />

        <ToggleRow
          label="Show my reviews publicly"
          value={reviewsOn ? "On" : "Off"}
          note="Turning this off hides your name from reviews you have written. The review text stays on the experience."
          on={reviewsOn}
          onToggle={() => setReviewsOn((v) => !v)}
        />

        <ToggleRow
          label="Data and personalisation"
          value={personalisationOn ? "On" : "Off"}
          note="We use the experiences you view and book, plus your city, to order your feed. Turn this off and you see the same feed as everyone in Lagos."
          on={personalisationOn}
          onToggle={() => setPersonalisationOn((v) => !v)}
        />

        <Row
          label="Download my data"
          value="Bookings, messages, reviews, and payment records"
          note="We email a link within 48 hours. The link works for 7 days."
          actionLabel="Request"
          onAction={openDataRequest}
        />

        <div className="flex items-start justify-between gap-8 py-7">
          <div className="flex flex-1 flex-col gap-1">
            <div className="text-base font-medium text-foreground">Blocked accounts</div>
            <div className="text-base text-muted-foreground">{blockedCount}</div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Blocked people cannot message you or book an experience alongside you.
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
            {VISIBILITY_OPTIONS.map(({ label, meta }) => {
              const selected = visibilityDraft === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setVisibilityDraft(label)}
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
              onClick={() => {
                setVisibility(visibilityDraft);
                setSavedMessage(
                  `Saved. Your profile is now visible to ${visibilityDraft === "Public" ? "anyone on MyJourny" : "hosts you have booked with"}.`,
                );
                closeModal();
              }}
              className="cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540]"
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
            We email a link to t***e@gmail.com within 48 hours. The link works for 7 days.
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
              onClick={() => {
                setSavedMessage(
                  "Request received. Watch t***e@gmail.com for the download link within 48 hours.",
                );
                closeModal();
              }}
              className="cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540]"
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
                  key={b.name}
                  className="flex items-center justify-between gap-6 rounded-xl border border-border px-4 py-3.5"
                >
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{b.name}</div>
                    <div className="text-[13px] text-muted-foreground">{b.meta}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setBlocked((prev) => prev.filter((x) => x.name !== b.name));
                      setSavedMessage(`${b.name} is unblocked and can message you again.`);
                      closeModal();
                    }}
                    className="cursor-pointer text-sm font-medium text-brand underline"
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
            Blocked people cannot message you or book an experience alongside you.
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
