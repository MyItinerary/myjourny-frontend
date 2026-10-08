"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/lib/api-error";
import { useMe } from "@/lib/queries/auth";
import {
  useConfirmPhoneChange,
  useGetProfile,
  useRequestEmailChange,
  useRequestPhoneChange,
  useUpdateProfile,
  type ProfileUpdatePayload,
} from "@/lib/queries/profile";
import {
  ModalFooter,
  ModalShell,
  OtpBoxes,
  Row,
  SavedBanner,
  SectionSkeleton,
  TextField,
} from "@/components/account-settings/section-ui";

const NOT_PROVIDED = "Not provided";
const SHOW_FULL = "Show my full name";
const SHOW_FIRST = "Show my first name only";

const CITIES: [string, string][] = [
  ["Lagos", "Lagos State · Most experiences on MyJourny today"],
  ["Abuja", "Federal Capital Territory"],
  ["Port Harcourt", "Rivers State"],
  ["Ibadan", "Oyo State"],
  ["Benin City", "Edo State"],
  ["Enugu", "Enugu State"],
  ["Kano", "Kano State"],
  ["Calabar", "Cross River State"],
  ["Uyo", "Akwa Ibom State"],
  ["Jos", "Plateau State"],
  ["Kaduna", "Kaduna State"],
  ["Abeokuta", "Ogun State"],
];

type ModalKey =
  | "legalName"
  | "preferredName"
  | "displayName"
  | "phone1"
  | "phone2"
  | "email"
  | "dob"
  | "emergency"
  | "city";

function firstNameOf(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

// t***e@gmail.com
function maskEmail(email: string | null | undefined) {
  if (!email) return NOT_PROVIDED;
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const masked = local.length <= 2 ? `${local[0] ?? ""}***` : `${local[0]}***${local[local.length - 1]}`;
  return `${masked}@${domain}`;
}

// +2348034562204 -> +234 *** *** 2204 (country code = everything before the
// last 10 digits).
function maskPhone(phone: string | null | undefined) {
  if (!phone) return NOT_PROVIDED;
  const last4 = phone.slice(-4);
  const country = phone.length > 10 ? phone.slice(0, phone.length - 10) : "";
  return `${country ? `${country} ` : ""}*** *** ${last4}`;
}

// The +234 field takes a local number; itin wants E.164.
function nigerianE164(local: string) {
  const digits = local.replace(/\D/g, "").replace(/^0/, "");
  return `+234${digits}`;
}

// 1991-03-14 -> 14 March 1991
function formatDate(iso: string | null | undefined) {
  if (!iso) return NOT_PROVIDED;
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

export function PersonalInfoSection() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: me } = useMe();
  const updateProfile = useUpdateProfile();
  const requestPhoneChange = useRequestPhoneChange();
  const confirmPhoneChange = useConfirmPhoneChange();
  const requestEmailChange = useRequestEmailChange();

  const [modal, setModal] = useState<ModalKey | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [legalNameDraft, setLegalNameDraft] = useState("");
  const [preferredNameDraft, setPreferredNameDraft] = useState("");
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [dobDraft, setDobDraft] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [cityDraft, setCityDraft] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  if (isLoading) return <SectionSkeleton />;

  const legalName = profile?.legal_name || profile?.full_name || "";
  const preferredName = profile?.preferred_name || "";
  const showFirstOnly = profile?.display_name_preference === "first_name_only";
  const emergency = profile?.emergency_contact_name
    ? `${profile.emergency_contact_name} · ${profile.emergency_contact_phone ?? ""}`
    : NOT_PROVIDED;
  const email = me?.email ?? null;
  const values = {
    legalName: legalName || NOT_PROVIDED,
    preferredName: preferredName || NOT_PROVIDED,
    displayName: showFirstOnly ? SHOW_FIRST : SHOW_FULL,
    phone: maskPhone(profile?.phone_number),
    email: maskEmail(email),
    dob: formatDate(profile?.date_of_birth),
    emergency,
    city: profile?.city || NOT_PROVIDED,
  };

  function closeModal() {
    setModal(null);
  }

  // Saves profile fields, then shows the confirmation banner.
  function save(payload: ProfileUpdatePayload, message: string) {
    updateProfile.mutate(payload, {
      onSuccess: () => {
        setSavedMessage(message);
        closeModal();
      },
      onError: (error) => toast.error(apiErrorMessage(error, "Couldn't save that change.")),
    });
  }

  function openModal(key: ModalKey) {
    setSavedMessage(null);
    if (key === "legalName") setLegalNameDraft(legalName);
    if (key === "preferredName") setPreferredNameDraft(preferredName);
    if (key === "displayName") setDisplayNameDraft(values.displayName);
    if (key === "phone1") setPhoneDraft("");
    if (key === "email") setEmailDraft("");
    if (key === "dob") setDobDraft(profile?.date_of_birth ?? "");
    if (key === "emergency") {
      setEmergencyName(profile?.emergency_contact_name ?? "");
      setEmergencyPhone(profile?.emergency_contact_phone ?? "");
    }
    if (key === "city") {
      setCityDraft(profile?.city ?? "");
      setCitySearch("");
    }
    setModal(key);
  }

  const filteredCities = CITIES.filter(([label, meta]) => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return true;
    return label.toLowerCase().includes(q) || meta.toLowerCase().includes(q);
  });

  const preferredNameAction = values.preferredName === NOT_PROVIDED ? "Add" : "Edit";
  const emergencyAction = values.emergency === NOT_PROVIDED ? "Add" : "Edit";

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Personal information
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      <div className="mt-2">
        <Row
          label="Legal name"
          value={values.legalName}
          note="Use the name on your government ID."
          actionLabel="Edit"
          onAction={() => openModal("legalName")}
        />
        <Row
          label="Preferred name"
          value={values.preferredName}
          note="Optional. Shown to hosts and other guests instead of your legal name."
          actionLabel={preferredNameAction}
          onAction={() => openModal("preferredName")}
        />
        <Row
          label="Display name for hosts and curators"
          value={values.displayName}
          note="Choose between your full name and your first name only."
          actionLabel="Edit"
          onAction={() => openModal("displayName")}
        />
        <Row
          label="Phone number"
          value={values.phone}
          note="Shared with your host for the day of the experience. Booking updates reach you by push and email, not by text."
          actionLabel="Edit"
          onAction={() => openModal("phone1")}
        />
        <Row
          label="Email address"
          value={values.email}
          actionLabel="Edit"
          onAction={() => openModal("email")}
        />
        <Row
          label="Date of birth"
          value={values.dob}
          actionLabel="Edit"
          onAction={() => openModal("dob")}
        />
        <Row
          label="Emergency contact"
          value={values.emergency}
          note="Optional. We contact this person only if something goes wrong during an experience."
          actionLabel={emergencyAction}
          onAction={() => openModal("emergency")}
        />
        <Row
          label="City"
          value={values.city}
          actionLabel="Edit"
          onAction={() => openModal("city")}
        />
      </div>

      {modal === "legalName" && (
        <ModalShell title="Edit legal name" onClose={closeModal}>
          <TextField
            label="Legal name"
            value={legalNameDraft}
            onChange={(e) => setLegalNameDraft(e.target.value)}
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            Use the name on your government ID. Guests and hosts see your display name, not this.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={!legalNameDraft.trim() || updateProfile.isPending}
            onSave={() => {
              const name = legalNameDraft.trim();
              save({ legal_name: name }, `Saved. Your legal name now reads ${name}.`);
            }}
          />
        </ModalShell>
      )}

      {modal === "preferredName" && (
        <ModalShell title="Add a preferred name" onClose={closeModal}>
          <TextField
            label="Preferred name"
            placeholder="Tunde"
            value={preferredNameDraft}
            onChange={(e) => setPreferredNameDraft(e.target.value)}
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            Shown to hosts and other guests instead of your legal name. Your legal name stays on
            your ID and your receipts.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={updateProfile.isPending}
            onSave={() => {
              const trimmed = preferredNameDraft.trim();
              save(
                { preferred_name: trimmed || null },
                trimmed
                  ? `Saved. Hosts and other guests now see ${trimmed}.`
                  : "Saved. Your preferred name has been removed.",
              );
            }}
          />
        </ModalShell>
      )}

      {modal === "displayName" && (
        <ModalShell title="Display name for hosts and curators" onClose={closeModal}>
          <div className="flex flex-col gap-2.5">
            {([SHOW_FULL, SHOW_FIRST] as const).map((label) => {
              const selected = displayNameDraft === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDisplayNameDraft(label)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-xl border p-4 text-left",
                    selected ? "border-brand border-2" : "border-border",
                  )}
                >
                  <div>
                    <div className="text-[15px] font-medium text-foreground">{label}</div>
                    <div className="text-[13px] text-muted-foreground">
                      {label === SHOW_FULL ? legalName : firstNameOf(legalName)}
                    </div>
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
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={updateProfile.isPending}
            onSave={() => {
              const full = displayNameDraft === SHOW_FULL;
              const shown = full ? legalName : firstNameOf(legalName);
              save(
                { display_name_preference: full ? "full" : "first_name_only" },
                `Saved. Hosts and curators now see ${shown}.`,
              );
            }}
          />
        </ModalShell>
      )}

      {modal === "phone1" && (
        <ModalShell title="Change phone number" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 1 of 2</div>
          <div className="mt-3.5 text-sm font-medium text-foreground">New phone number</div>
          <div className="mt-2 flex gap-2.5">
            <div className="flex h-12 items-center gap-2 rounded-xl border border-border px-3.5 text-base text-foreground">
              <span>🇳🇬</span>
              <span>+234</span>
            </div>
            <input
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value.replace(/[^0-9\s]/g, ""))}
              placeholder="803 456 2204"
              className="h-12 flex-1 rounded-xl border border-border px-4 font-sans text-base text-foreground outline-none focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/16"
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            We email a 6 digit code to {values.email} to confirm this change. Your old number
            stays on file until you enter it.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={requestPhoneChange.isPending ? "Sending…" : "Send code"}
            saveDisabled={phoneDraft.replace(/\s/g, "").length < 7 || requestPhoneChange.isPending}
            onSave={() =>
              requestPhoneChange.mutate(nigerianE164(phoneDraft), {
                onSuccess: () => {
                  setOtp(["", "", "", "", "", ""]);
                  setModal("phone2");
                },
              })
            }
          />
        </ModalShell>
      )}

      {modal === "phone2" && (
        <ModalShell title="Change phone number" onClose={closeModal}>
          <div className="text-[13px] font-medium text-brand">Step 2 of 2</div>
          <div className="mt-3.5 text-base text-foreground">
            Enter the code we emailed to {values.email}
          </div>
          <div className="mt-4.5">
            <OtpBoxes digits={otp} onChange={setOtp} />
          </div>
          <div className="mt-3.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>Did not get it?</span>
            <button
              type="button"
              disabled={requestPhoneChange.isPending}
              onClick={() =>
                requestPhoneChange.mutate(nigerianE164(phoneDraft), {
                  onSuccess: () => toast.success("We sent a new code."),
                })
              }
              className="cursor-pointer font-medium text-brand underline disabled:cursor-wait disabled:opacity-60"
            >
              Resend code
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => setModal("phone1")}
              className="cursor-pointer text-[15px] font-medium text-muted-foreground underline hover:text-primary"
            >
              Use a different number
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="cursor-pointer rounded-full border border-border px-5.5 py-3 text-[15px] font-medium text-foreground hover:bg-[#F5F5F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={otp.some((d) => !d) || confirmPhoneChange.isPending}
                onClick={() =>
                  confirmPhoneChange.mutate(otp.join(""), {
                    onSuccess: () => {
                      setSavedMessage(
                        `Saved. Your host will reach you on ${maskPhone(nigerianE164(phoneDraft))} on the day.`,
                      );
                      closeModal();
                    },
                  })
                }
                className={cn(
                  "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
                  otp.some((d) => !d) || confirmPhoneChange.isPending
                    ? "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]"
                    : "bg-brand text-white hover:bg-[#FF4540]",
                )}
              >
                Confirm number
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {modal === "email" && (
        <ModalShell title="Change email address" onClose={closeModal}>
          <TextField
            label="New email address"
            placeholder="you@example.com"
            type="email"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            We send a confirmation link to the new address. Your current address keeps working
            until you open it.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveLabel={requestEmailChange.isPending ? "Sending…" : "Send link"}
            saveDisabled={!emailDraft.trim() || requestEmailChange.isPending}
            onSave={() => {
              const next = emailDraft.trim();
              requestEmailChange.mutate(next, {
                onSuccess: () => {
                  setSavedMessage(`Check ${next} and open the confirmation link to finish the change.`);
                  closeModal();
                },
              });
            }}
          />
        </ModalShell>
      )}

      {modal === "dob" && (
        <ModalShell title="Edit date of birth" onClose={closeModal}>
          <TextField
            label="Date of birth"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={dobDraft}
            onChange={(e) => setDobDraft(e.target.value)}
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            You must be 18 or older to book. Some experiences set a higher age limit of their
            own.
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={!dobDraft || updateProfile.isPending}
            onSave={() =>
              save({ date_of_birth: dobDraft }, `Saved. Your date of birth is now ${formatDate(dobDraft)}.`)
            }
          />
        </ModalShell>
      )}

      {modal === "emergency" && (
        <ModalShell title="Add an emergency contact" onClose={closeModal}>
          <div className="flex flex-col gap-4">
            <TextField
              label="Full name"
              placeholder="Ada Bakare"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
            />
            <TextField
              label="Phone number"
              placeholder="+2348030000000"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value.replace(/[^\d+]/g, ""))}
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            We contact this person only if something goes wrong during an experience. They are
            never shown to hosts or other guests.
          </div>
          <ModalFooter
            onCancel={closeModal}
            // Both or neither: itin needs the number in international format.
            saveDisabled={
              updateProfile.isPending ||
              (!!emergencyName.trim() !== !!emergencyPhone.trim()) ||
              (!!emergencyPhone.trim() && !/^\+[1-9]\d{6,14}$/.test(emergencyPhone.trim()))
            }
            onSave={() => {
              const name = emergencyName.trim();
              save(
                {
                  emergency_contact_name: name || null,
                  emergency_contact_phone: name ? emergencyPhone.trim() : null,
                },
                name
                  ? `Saved. We will contact ${name} if something goes wrong.`
                  : "Saved. You have no emergency contact on file.",
              );
            }}
          />
        </ModalShell>
      )}

      {modal === "city" && (
        <ModalShell title="Edit city" onClose={closeModal}>
          <div className="flex h-12 items-center gap-2.5 rounded-xl border border-border px-4 text-muted-foreground">
            <Search size={20} className="shrink-0" />
            <input
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search for a city"
              className="h-full flex-1 border-none bg-transparent font-sans text-base text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="mt-3 flex max-h-70 flex-col gap-0.5 overflow-auto">
            {filteredCities.map(([label, meta]) => {
              const selected = cityDraft === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCityDraft(label)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 py-3 text-left hover:bg-[#F5F5F5]",
                    selected ? "bg-muted" : "bg-transparent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MapPin size={20} className="shrink-0 text-foreground" />
                    <div>
                      <div className="text-[15px] font-medium text-foreground">{label}</div>
                      <div className="text-[13px] text-muted-foreground">{meta}</div>
                    </div>
                  </div>
                  {selected && (
                    <div className="shrink-0 text-[13px] font-medium text-brand">Selected</div>
                  )}
                </button>
              );
            })}
            {filteredCities.length === 0 && (
              <div className="px-3.5 py-5 text-sm text-muted-foreground">
                No city matches that. Try the nearest large city — we use it to pick what your
                feed opens on.
              </div>
            )}
          </div>
          <ModalFooter
            onCancel={closeModal}
            saveDisabled={!cityDraft || updateProfile.isPending}
            onSave={() =>
              save({ city: cityDraft }, `Saved. Your feed now opens on experiences in ${cityDraft}.`)
            }
          />
        </ModalShell>
      )}
    </div>
  );
}
