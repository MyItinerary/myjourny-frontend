"use client";

import { useState } from "react";
import { Copy, Download, Laptop, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalFooter, ModalShell, OtpBoxes, Row, SavedBanner, TextField } from "@/components/account settings/section-ui";

interface Session {
  id: string;
  icon: "laptop" | "phone";
  device: string;
  meta: string;
  isThisDevice: boolean;
}

const INITIAL_SESSIONS: Session[] = [
  {
    id: "macbook",
    icon: "laptop",
    device: "MacBook Pro, Chrome",
    meta: "Lagos, Nigeria · Active now",
    isThisDevice: true,
  },
  {
    id: "iphone",
    icon: "phone",
    device: "iPhone 14, MyJourny app",
    meta: "Lagos, Nigeria · 2 hours ago",
    isThisDevice: false,
  },
  {
    id: "windows",
    icon: "laptop",
    device: "Windows PC, Edge",
    meta: "Abuja, Nigeria · 4 days ago",
    isThisDevice: false,
  },
];

const RECOVERY_CODES = [
  "4K7P-QX92",
  "8MTR-5VLD",
  "B3WY-7NQZ",
  "HD62-J8KM",
  "PZ49-TR3B",
  "X7LQ-M2VN",
  "C5KD-98YT",
  "RW31-KQ7F",
];

const DEACTIVATE_FACTS = [
  {
    title: "You have 2 bookings in the next 30 days",
    body: "They stay live. The hosts keep your name and phone number so they can reach you on the day.",
  },
  {
    title: "Your 12 saved experiences and your preference answers go away",
    body: "Saved lists cannot be recovered after 30 days. Bookings you already made are not affected.",
  },
  {
    title: "Your 18 reviews stop being visible",
    body: "The review text stays on the experience. Your name and photo come off it.",
  },
  {
    title: "Receipts stay available for 7 years",
    body: "We keep payment records because Nigerian law asks us to. You can still download them.",
  },
];

const DELETE_FACTS = [
  {
    title: "Your profile and messages go now",
    body: "Hosts you have talked to keep their side of the thread without your name on it.",
  },
  {
    title: "2 bookings in the next 30 days are cancelled",
    body: "We refund you in full and tell the hosts today. There is no way to undo that.",
  },
  {
    title: "Your 18 reviews and your preference answers are deleted",
    body: "Review text stays on the experience with no name attached. Your preference answers cannot be rebuilt.",
  },
  {
    title: "Payment receipts stay for 7 years",
    body: "Nigerian law asks us to keep them. Nobody can browse them, and we delete them after 7 years.",
  },
];

type ModalKey =
  | "password"
  | "twofa1"
  | "twofa2"
  | "twofa3"
  | "disconnect"
  | "deactivate"
  | "delete1"
  | "delete2";

export function LoginSecuritySection() {
  const [password, setPassword] = useState("Last changed 12 June 2026");
  const [connected, setConnected] = useState("Google, t***e@gmail.com");
  const [twofaOn, setTwofaOn] = useState(false);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [modal, setModal] = useState<ModalKey | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twofaCode, setTwofaCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [copied, setCopied] = useState(false);

  const [deleteDraft, setDeleteDraft] = useState("");

  function closeModal() {
    setModal(null);
  }

  function openPassword() {
    setSavedMessage(null);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setModal("password");
  }

  function openTwofa() {
    setSavedMessage(null);
    setTwofaCode(["", "", "", "", "", ""]);
    setModal("twofa1");
  }

  function openDisconnect() {
    setSavedMessage(null);
    setModal("disconnect");
  }

  function openDeactivate() {
    setSavedMessage(null);
    setModal("deactivate");
  }

  function openDelete() {
    setSavedMessage(null);
    setDeleteDraft("");
    setModal("delete1");
  }

  const disconnectAction = connected === "None" ? "Connect" : "Disconnect";
  const twofaAction = twofaOn ? "Edit" : "Set up";

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Login and security
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      <div className="mt-2">
        <Row label="Password" value={password} actionLabel="Edit" onAction={openPassword} />

        <div className="flex items-start justify-between gap-8 border-b border-border py-7">
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="text-base font-medium text-foreground">
              Two factor authentication
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-medium whitespace-nowrap",
                  twofaOn ? "bg-muted text-[#0CBA65]" : "bg-[#F5F5F5] text-[#757575]",
                )}
              >
                {twofaOn ? "On" : "Not set up"}
              </span>
              <span className="text-[15px] text-muted-foreground">
                {twofaOn
                  ? "Authenticator app, added today"
                  : "Anyone with your password can sign in"}
              </span>
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Use an authenticator app such as Google Authenticator or Authy. It generates a 6
              digit code on your phone, so it works even when you have no network or airtime.
            </div>
          </div>
          <button
            type="button"
            onClick={openTwofa}
            className="shrink-0 pt-0.5 text-[15px] font-medium text-brand underline hover:text-primary cursor-pointer"
          >
            {twofaAction}
          </button>
        </div>

        <Row
          label="Connected accounts"
          value={connected}
          note="Disconnecting means you sign in with your email and password only."
          actionLabel={disconnectAction}
          onAction={openDisconnect}
        />

        <div className="border-b border-border py-7">
          <div className="text-base font-medium text-foreground">Active sessions</div>
          <div className="mt-4 flex flex-col gap-3.5">
            {sessions.map((s) => {
              const Icon = s.icon === "laptop" ? Laptop : Smartphone;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-6 rounded-xl border border-border px-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={20} className="shrink-0 text-foreground" />
                    <div>
                      <div className="text-[15px] font-medium text-foreground">{s.device}</div>
                      <div className="text-[13px] text-muted-foreground">{s.meta}</div>
                    </div>
                  </div>
                  {s.isThisDevice ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      This device
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setSessions((prev) => prev.filter((session) => session.id !== s.id))
                      }
                      className="cursor-pointer text-sm font-medium text-brand underline"
                    >
                      Log out
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Row
          label="Deactivate account"
          note="Your profile, saved experiences, and reviews stop being visible. Bookings in the next 30 days stay live and you keep getting messages about them."
          actionLabel="Deactivate"
          onAction={openDeactivate}
          muted
        />

        <div className="flex items-start justify-between gap-8 border-t border-border py-7">
          <div className="flex flex-1 flex-col gap-1">
            <div className="text-base font-medium text-foreground">
              Delete account permanently
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground">
              Your profile, messages, reviews, saved experiences, and preference answers are
              deleted and cannot be brought back. Deactivating instead keeps everything and
              hides it.
            </div>
          </div>
          <button
            type="button"
            onClick={openDelete}
            className="shrink-0 pt-0.5 text-[15px] font-medium text-muted-foreground underline hover:text-primary cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {modal === "password" && (
        <ModalShell title="Change password" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <TextField
              label="Current password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
            <TextField
              label="New password"
              type="password"
              placeholder="At least 10 characters"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            Changing your password signs you out everywhere except this device.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={!currentPw || newPw.length < 10 || newPw !== confirmPw}
            onSave={() => {
              setPassword("Last changed today");
              setSavedMessage("Password changed. Your other devices have been signed out.");
              closeModal();
            }}
          />
        </ModalShell>
      )}

      {modal === "twofa1" && (
        <ModalShell title="Set up two factor authentication" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 1 of 3</div>
          <div className="mt-3.5 text-base text-foreground">
            Open your authenticator app and scan this code
          </div>
          <div className="mt-4.5 flex flex-col items-start gap-4 sm:flex-row sm:gap-6">
            <div
              className="flex size-[170px] shrink-0 items-center justify-center rounded-xl border border-border bg-[repeating-conic-gradient(#333134_0%_25%,#fff_0%_50%)] bg-[length:12px_12px]"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">
                If you do not have an app yet, install Google Authenticator or Authy first. Both
                are free.
              </div>
              <div className="mt-4 text-sm font-medium text-foreground">Cannot scan it?</div>
              <div className="mt-1.5 text-sm text-muted-foreground">
                Type this key into the app by hand.
              </div>
              <div className="mt-2 rounded-xl bg-muted px-3.5 py-3 font-sans text-[15px] font-medium tracking-[0.08em] text-foreground">
                K4JQ 7ZTA 9PLM 2XRB
              </div>
            </div>
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel="I have scanned it"
            onSave={() => setModal("twofa2")}
          />
        </ModalShell>
      )}

      {modal === "twofa2" && (
        <ModalShell title="Set up two factor authentication" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 2 of 3</div>
          <div className="mt-3.5 text-base text-foreground">
            Enter the 6 digit code your app is showing now
          </div>
          <div className="mt-4.5">
            <OtpBoxes digits={twofaCode} onChange={setTwofaCode} />
          </div>
          <div className="mt-3.5 text-sm text-muted-foreground">
            The code changes every 30 seconds. If it is rejected, wait for the next one and try
            again.
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setModal("twofa1")}
              className="cursor-pointer text-[15px] font-medium text-muted-foreground underline hover:text-primary"
            >
              Back to the code
            </button>
            <button
              type="button"
              disabled={twofaCode.some((d) => !d)}
              onClick={() => setModal("twofa3")}
              className={cn(
                "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
                twofaCode.some((d) => !d)
                  ? "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]"
                  : "bg-brand text-white hover:bg-[#FF4540]",
              )}
            >
              Verify
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "twofa3" && (
        <ModalShell title="Set up two factor authentication" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 3 of 3</div>
          <div className="mt-3.5 text-base text-foreground">
            Save your recovery codes before you close this
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Each code works once, and only if you lose the phone with the app on it. We cannot
            show them to you again.
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-xl bg-muted p-4.5">
            {RECOVERY_CODES.map((code) => (
              <div
                key={code}
                className="font-sans text-[15px] font-medium tracking-[0.06em] text-foreground"
              >
                {code}
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5">
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([RECOVERY_CODES.join("\n") + "\n"], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "myjourny-recovery-codes.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-brand underline"
            >
              <Download size={18} />
              Download as a text file
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(RECOVERY_CODES.join("\n")).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground underline hover:text-primary"
            >
              <Copy size={16} />
              {copied ? "Copied" : "Copy all"}
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setTwofaOn(true);
                setSavedMessage(
                  "Two factor authentication is on. From now on you enter a code from your authenticator app when you sign in on a new device.",
                );
                closeModal();
              }}
              className="cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540]"
            >
              I have saved them
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "disconnect" && (
        <ModalShell title={disconnectAction === "Connect" ? "Connect Google" : "Disconnect Google"} onClose={closeModal}>
          <div className="text-base text-foreground">
            {disconnectAction === "Connect"
              ? "You will be able to sign in with Google in addition to your email and password."
              : "You will sign in with your email address and password only."}
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            {disconnectAction === "Connect"
              ? "We never post anything without asking you first."
              : "If you have never set a password, we email you a link to create one before the change takes effect."}
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={disconnectAction}
            onSave={() => {
              if (disconnectAction === "Connect") {
                setConnected("Google, t***e@gmail.com");
                setSavedMessage("Google is connected. You can now sign in with it.");
              } else {
                setConnected("None");
                setSavedMessage(
                  "Google is disconnected. Sign in with t***e@gmail.com and your password from now on.",
                );
              }
              closeModal();
            }}
          />
        </ModalShell>
      )}

      {modal === "deactivate" && (
        <ModalShell title="Deactivate your account" onClose={closeModal}>
          <div className="text-base text-foreground">
            Here is exactly what happens when you deactivate.
          </div>
          <div className="mt-4.5 flex flex-col gap-3.5">
            {DEACTIVATE_FACTS.map((f) => (
              <div key={f.title} className="rounded-xl border border-border p-4">
                <div className="text-[15px] font-medium text-foreground">{f.title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{f.body}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 text-sm text-muted-foreground">
            Signing in again within 30 days brings the account back as it was. After 30 days we
            delete your profile and saved experiences.
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-full bg-muted px-5.5 py-3 text-[15px] font-medium text-foreground"
            >
              Keep my account
            </button>
            <button
              type="button"
              onClick={() => {
                setSavedMessage(
                  "Your account is deactivated. Sign in again within 30 days to bring it back.",
                );
                closeModal();
              }}
              className="cursor-pointer rounded-full border border-foreground px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
            >
              Deactivate anyway
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "delete1" && (
        <ModalShell title="Delete your account" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 1 of 2</div>
          <div className="mt-3.5 text-base text-foreground">
            Deleting is permanent. Here is what goes.
          </div>
          <div className="mt-4.5 flex flex-col gap-3.5">
            {DELETE_FACTS.map((f) => (
              <div key={f.title} className="rounded-xl border border-border p-4">
                <div className="text-[15px] font-medium text-foreground">{f.title}</div>
                <div className="mt-0.5 text-sm text-muted-foreground">{f.body}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-muted p-4.5">
            <div className="text-[15px] font-medium text-foreground">
              Deactivating does most of this and is reversible
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Your profile stops being visible, and signing in brings it back.
            </div>
            <button
              type="button"
              onClick={() => setModal("deactivate")}
              className="mt-2.5 cursor-pointer text-sm font-medium text-brand underline"
            >
              Deactivate instead
            </button>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="cursor-pointer rounded-full bg-muted px-5.5 py-3 text-[15px] font-medium text-foreground"
            >
              Keep my account
            </button>
            <button
              type="button"
              onClick={() => setModal("delete2")}
              className="cursor-pointer rounded-full border border-foreground px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
            >
              Continue to delete
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "delete2" && (
        <ModalShell title="Delete your account" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 2 of 2</div>
          <div className="mt-3.5 text-base text-foreground">
            You have 2 bookings in the next 30 days. We cancel them and refund you in full, and
            the hosts are told today.
          </div>
          <TextField
            label="Type DELETE to confirm"
            value={deleteDraft}
            onChange={(e) => setDeleteDraft(e.target.value)}
            className="tracking-[0.08em]"
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            We send one email to t***e@gmail.com confirming the deletion. Payment receipts stay
            with us for 7 years because Nigerian law asks us to keep them.
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setModal("delete1")}
              className="cursor-pointer text-[15px] font-medium text-muted-foreground underline hover:text-primary"
            >
              Back
            </button>
            <button
              type="button"
              disabled={deleteDraft.trim().toUpperCase() !== "DELETE"}
              onClick={() => {
                setSavedMessage(
                  "Deletion started. Your 2 upcoming bookings are cancelled and refunded, and your profile is already gone. Everything else is removed within 30 days.",
                );
                closeModal();
              }}
              className={cn(
                "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
                deleteDraft.trim().toUpperCase() !== "DELETE"
                  ? "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]"
                  : "bg-brand text-white hover:bg-[#FF4540]",
              )}
            >
              Delete my account
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
