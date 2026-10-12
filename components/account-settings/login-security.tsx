"use client";

import { useState } from "react";
import { Copy, Download, Laptop, Smartphone } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { GoogleAuthButton } from "@/components/onboarding/google-auth-button";
import { useMe } from "@/lib/queries/auth";
import { DeleteAccountDialogView, useDeleteAccountViewModel } from "@/features/account-deletion";
import {
  useAuthSessions,
  useChangePassword,
  useConnectGoogle,
  useConnections,
  useDeactivateAccount,
  useDeletionPreview,
  useDisableTwoFactor,
  useDisconnectGoogle,
  useRevokeSession,
  useSetupTwoFactor,
  useTwoFactorStatus,
  useVerifyTwoFactor,
  type AuthSession,
} from "@/lib/queries/security";
import {
  ModalFooter,
  ModalShell,
  OtpBoxes,
  Row,
  SavedBanner,
  SectionSkeleton,
  TextField,
} from "@/components/account-settings/section-ui";

const MIN_PASSWORD = 10;

type ModalKey =
  | "password"
  | "twofa1"
  | "twofa2"
  | "twofa3"
  | "twofaOff"
  | "connect"
  | "disconnect"
  | "deactivate"
  | "delete";

function formatDay(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// "Chrome on macOS" from the session's user agent (itin stores the raw string).
function describeDevice(userAgent: string | null) {
  if (!userAgent) return "Unknown device";
  if (/MyJourny/i.test(userAgent)) return "MyJourny app";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Firefox\//.test(userAgent)
          ? "Firefox"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : null;
  const os = /iPhone|iPad/.test(userAgent)
    ? "iPhone"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X|Macintosh/.test(userAgent)
        ? "macOS"
        : /Windows/.test(userAgent)
          ? "Windows"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? "Unknown device";
}

function isPhone(userAgent: string | null) {
  return !!userAgent && /iPhone|Android|Mobile|MyJourny/i.test(userAgent);
}

function lastActive(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 5) return "Active now";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

// "ABCD EFGH IJKL ..." so the key is easier to type into an app.
function groupKey(secret: string) {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}

export function LoginSecuritySection() {
  const { data: me } = useMe();
  const { data: twofa, isLoading: twofaLoading } = useTwoFactorStatus();
  const { data: connections = [], isLoading: connectionsLoading } = useConnections();
  const { data: sessions = [], isLoading: sessionsLoading } = useAuthSessions();

  const changePassword = useChangePassword();
  const setupTwoFactor = useSetupTwoFactor();
  const verifyTwoFactor = useVerifyTwoFactor();
  const disableTwoFactor = useDisableTwoFactor();
  const connectGoogle = useConnectGoogle();
  const disconnectGoogle = useDisconnectGoogle();
  const revokeSession = useRevokeSession();
  const deactivate = useDeactivateAccount();

  const [modal, setModal] = useState<ModalKey | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twofaCode, setTwofaCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [offPassword, setOffPassword] = useState("");
  const [offCode, setOffCode] = useState("");

  // Only fetched once someone opens deactivate.
  const preview = useDeletionPreview(modal === "deactivate");
  const deleteDialog = useDeleteAccountViewModel({
    open: modal === "delete",
    email: me?.email ?? "your email",
    onClose: () => setModal(null),
    onDeactivateInstead: () => setModal("deactivate"),
  });
  const upcoming = preview.data?.upcoming_booking_count ?? 0;

  if (twofaLoading || connectionsLoading || sessionsLoading) return <SectionSkeleton />;

  const twofaOn = !!twofa?.enabled;
  const google = connections.find((c) => c.provider === "google");
  const email = me?.email ?? "your email";
  const secret = setupTwoFactor.data?.secret ?? "";

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
    if (twofaOn) {
      setOffPassword("");
      setOffCode("");
      setModal("twofaOff");
      return;
    }
    setTwofaCode(["", "", "", "", "", ""]);
    // A fresh secret each time; the last one is discarded if never verified.
    setupTwoFactor.mutate(undefined, { onSuccess: () => setModal("twofa1") });
  }

  function openGoogle() {
    setSavedMessage(null);
    setModal(google ? "disconnect" : "connect");
  }

  function openDeactivate() {
    setSavedMessage(null);
    setModal("deactivate");
  }

  function openDelete() {
    setSavedMessage(null);
    setModal("delete");
  }

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Login and security
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      <div className="mt-2">
        <Row label="Password" value="••••••••••" actionLabel="Edit" onAction={openPassword} />

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
                  ? `Authenticator app${twofa?.added_at ? `, added ${formatDay(twofa.added_at)}` : ""}`
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
            disabled={setupTwoFactor.isPending}
            className="shrink-0 pt-0.5 text-[15px] font-medium text-brand underline hover:text-primary cursor-pointer disabled:cursor-wait"
          >
            {twofaOn ? "Turn off" : setupTwoFactor.isPending ? "Starting…" : "Set up"}
          </button>
        </div>

        <Row
          label="Connected accounts"
          value={google ? `Google${google.email ? `, ${google.email}` : ""}` : "None"}
          note={
            google
              ? "Disconnecting means you sign in with your email and password only."
              : "Connect Google to sign in with it as well as your password."
          }
          actionLabel={google ? "Disconnect" : "Connect"}
          onAction={openGoogle}
        />

        <div className="border-b border-border py-7">
          <div className="text-base font-medium text-foreground">Active sessions</div>
          <div className="mt-4 flex flex-col gap-3.5">
            {sessions.map((s: AuthSession) => {
              const Icon = isPhone(s.device) ? Smartphone : Laptop;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-6 rounded-xl border border-border px-4 py-3.5"
                >
                  <div className="flex items-center gap-3.5">
                    <Icon size={20} className="shrink-0 text-foreground" />
                    <div>
                      <div className="text-[15px] font-medium text-foreground">
                        {describeDevice(s.device)}
                      </div>
                      <div className="text-[13px] text-muted-foreground">
                        {lastActive(s.last_active)}
                      </div>
                    </div>
                  </div>
                  {s.is_current_device ? (
                    <span className="text-sm font-medium text-muted-foreground">
                      This device
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={revokeSession.isPending}
                      onClick={() =>
                        revokeSession.mutate(s.id, {
                          onSuccess: () => setSavedMessage(`${describeDevice(s.device)} is signed out.`),
                        })
                      }
                      className="cursor-pointer text-sm font-medium text-brand underline disabled:cursor-wait"
                    >
                      Log out
                    </button>
                  )}
                </div>
              );
            })}
            {sessions.length === 0 && (
              <div className="text-sm text-muted-foreground">No other active sessions.</div>
            )}
          </div>
        </div>

        <Row
          label="Deactivate account"
          note="Your profile is hidden and you're signed out everywhere. Bookings you've made stay as they are. Sign in again within 30 days to bring the account back."
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
              Your personal details are deleted and cannot be brought back. Booking and payment
              records are kept without them. Deactivating instead keeps everything and hides it.
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
              autoComplete="current-password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
            />
            <TextField
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder={`At least ${MIN_PASSWORD} characters`}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
            />
            <TextField
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            Changing your password signs you out everywhere except this device.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={changePassword.isPending ? "Saving…" : "Save"}
            saveDisabled={
              !currentPw || newPw.length < MIN_PASSWORD || newPw !== confirmPw || changePassword.isPending
            }
            onSave={() =>
              changePassword.mutate(
                { current_password: currentPw, new_password: newPw },
                {
                  onSuccess: () => {
                    setSavedMessage("Password changed. Your other devices have been signed out.");
                    closeModal();
                  },
                },
              )
            }
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
            <div className="flex size-[170px] shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2.5">
              {setupTwoFactor.data && (
                <QRCodeSVG value={setupTwoFactor.data.otpauth_url} size={148} aria-label="Two-factor setup code" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-muted-foreground">
                If you do not have an app yet, install Google Authenticator or Authy first. Both
                are free.
              </div>
              <div className="mt-4 text-sm font-medium text-foreground">Cannot scan it?</div>
              <div className="mt-1.5 text-sm text-muted-foreground">
                Type this key into the app by hand.
              </div>
              <div className="mt-2 rounded-xl bg-muted px-3.5 py-3 font-sans text-[15px] font-medium tracking-[0.08em] break-all text-foreground">
                {groupKey(secret)}
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
              disabled={twofaCode.some((d) => !d) || verifyTwoFactor.isPending}
              onClick={() =>
                verifyTwoFactor.mutate(twofaCode.join(""), {
                  onSuccess: (data) => {
                    setRecoveryCodes(data.recovery_codes);
                    setModal("twofa3");
                  },
                })
              }
              className={cn(
                "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
                twofaCode.some((d) => !d) || verifyTwoFactor.isPending
                  ? "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]"
                  : "bg-brand text-white hover:bg-[#FF4540]",
              )}
            >
              {verifyTwoFactor.isPending ? "Checking…" : "Verify"}
            </button>
          </div>
        </ModalShell>
      )}

      {modal === "twofa3" && (
        <ModalShell title="Set up two factor authentication" onClose={() => undefined}>
          <div className="text-[13px] font-medium text-brand">Step 3 of 3</div>
          <div className="mt-3.5 text-base text-foreground">
            Save your recovery codes before you close this
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Each code works once, and only if you lose the phone with the app on it. We cannot
            show them to you again. Your other devices have been signed out.
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 rounded-xl bg-muted p-4.5">
            {recoveryCodes.map((code) => (
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
                const blob = new Blob([recoveryCodes.join("\n") + "\n"], {
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
                navigator.clipboard?.writeText(recoveryCodes.join("\n")).then(() => {
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
                setRecoveryCodes([]);
                setSavedMessage(
                  "Two factor authentication is on. From now on you enter a code from your authenticator app when you sign in.",
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

      {modal === "twofaOff" && (
        <ModalShell title="Turn off two factor authentication" onClose={closeModal}>
          <div className="text-base text-foreground">
            Confirm it&apos;s you with your password, or a code from your app or a recovery code.
          </div>
          <div className="mt-4 flex flex-col gap-4">
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              value={offPassword}
              onChange={(e) => setOffPassword(e.target.value)}
            />
            <TextField
              label="Or a code"
              autoComplete="one-time-code"
              value={offCode}
              onChange={(e) => setOffCode(e.target.value)}
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            Your recovery codes stop working too. Anyone with your password will be able to sign in.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={disableTwoFactor.isPending ? "Turning off…" : "Turn off"}
            saveDisabled={(!offPassword && !offCode.trim()) || disableTwoFactor.isPending}
            onSave={() =>
              disableTwoFactor.mutate(
                { password: offPassword || undefined, code: offCode.trim() || undefined },
                {
                  onSuccess: () => {
                    setSavedMessage("Two factor authentication is off.");
                    closeModal();
                  },
                },
              )
            }
          />
        </ModalShell>
      )}

      {modal === "connect" && (
        <ModalShell title="Connect Google" onClose={closeModal}>
          <div className="text-base text-foreground">
            You will be able to sign in with Google in addition to your email and password.
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            We never post anything without asking you first.
          </div>
          <div className="mt-6">
            <GoogleAuthButton
              loading={connectGoogle.isPending}
              onCredential={(credential) =>
                connectGoogle.mutate(credential, {
                  onSuccess: () => {
                    setSavedMessage("Google is connected. You can now sign in with it.");
                    closeModal();
                  },
                })
              }
            />
          </div>
        </ModalShell>
      )}

      {modal === "disconnect" && (
        <ModalShell title="Disconnect Google" onClose={closeModal}>
          <div className="text-base text-foreground">
            You will sign in with your email address and password only.
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            If you have never set a password, set one up first (Forgot password on the login page
            sends you a link), otherwise you would have no way to sign in.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={disconnectGoogle.isPending ? "Disconnecting…" : "Disconnect"}
            saveDisabled={disconnectGoogle.isPending}
            onSave={() =>
              disconnectGoogle.mutate(undefined, {
                onSuccess: () => {
                  setSavedMessage(`Google is disconnected. Sign in with ${email} and your password from now on.`);
                  closeModal();
                },
              })
            }
          />
        </ModalShell>
      )}

      {modal === "deactivate" && (
        <ModalShell title="Deactivate your account" onClose={closeModal}>
          <div className="text-base text-foreground">
            Here is exactly what happens when you deactivate.
          </div>
          <div className="mt-4.5 flex flex-col gap-3.5">
            <div className="rounded-xl border border-border p-4">
              <div className="text-[15px] font-medium text-foreground">
                {preview.isLoading
                  ? "Your bookings stay as they are"
                  : upcoming > 0
                    ? `Your ${upcoming === 1 ? "upcoming booking stays" : `${upcoming} upcoming bookings stay`} as ${upcoming === 1 ? "it is" : "they are"}`
                    : "Bookings you've made stay as they are"}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                Deactivating doesn&apos;t cancel anything. Cancel a booking from the booking itself
                if you need to.
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-[15px] font-medium text-foreground">You&apos;re signed out everywhere</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                Every device, including this one.
              </div>
            </div>
            <div className="rounded-xl border border-border p-4">
              <div className="text-[15px] font-medium text-foreground">Nothing is deleted</div>
              <div className="mt-0.5 text-sm text-muted-foreground">
                Your profile, saved experiences and wishlists are kept, just hidden.
              </div>
            </div>
          </div>
          <div className="mt-5 text-sm text-muted-foreground">
            Signing in again within 30 days brings the account back as it was. After that, contact
            support to restore it.
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
              disabled={deactivate.isPending}
              onClick={() => deactivate.mutate()}
              className="cursor-pointer rounded-full border border-foreground px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5] disabled:cursor-wait disabled:opacity-60"
            >
              {deactivate.isPending ? "Deactivating…" : "Deactivate anyway"}
            </button>
          </div>
        </ModalShell>
      )}

      <DeleteAccountDialogView {...deleteDialog} />
    </div>
  );
}
