"use client";

import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalFooter, ModalShell, OtpBoxes, Row, SavedBanner, TextField } from "@/components/account settings/section-ui";

interface PersonalValues {
  legalName: string;
  preferredName: string;
  displayName: string;
  phone: string;
  email: string;
  dob: string;
  emergency: string;
  city: string;
}

const INITIAL_VALUES: PersonalValues = {
  legalName: "Tunde Bakare",
  preferredName: "Not provided",
  displayName: "Show my first name only",
  phone: "803 456 2204",
  email: "t***e@gmail.com",
  dob: "14 March 1991",
  emergency: "Not provided",
  city: "Lagos",
};

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

export function PersonalInfoSection() {
  const [values, setValues] = useState<PersonalValues>(INITIAL_VALUES);
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

  function closeModal() {
    setModal(null);
  }

  function openModal(key: ModalKey) {
    setSavedMessage(null);
    if (key === "legalName") setLegalNameDraft(values.legalName);
    if (key === "preferredName") {
      setPreferredNameDraft(values.preferredName === "Not provided" ? "" : values.preferredName);
    }
    if (key === "displayName") setDisplayNameDraft(values.displayName);
    if (key === "phone1") setPhoneDraft("");
    if (key === "email") setEmailDraft("");
    if (key === "dob") setDobDraft(values.dob);
    if (key === "emergency") {
      setEmergencyName("");
      setEmergencyPhone("");
    }
    if (key === "city") {
      setCityDraft(values.city);
      setCitySearch("");
    }
    setModal(key);
  }

  const filteredCities = CITIES.filter(([label, meta]) => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return true;
    return label.toLowerCase().includes(q) || meta.toLowerCase().includes(q);
  });

  const preferredNameAction = values.preferredName === "Not provided" ? "Add" : "Edit";
  const emergencyAction = values.emergency === "Not provided" ? "Add" : "Edit";

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
          value={`+234 *** *** ${values.phone.slice(-4)}`}
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
            onSave={() => {
              const name = legalNameDraft.trim() || values.legalName;
              setValues((v) => ({ ...v, legalName: name }));
              setSavedMessage(`Saved. Your legal name now reads ${name}.`);
              closeModal();
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
            onSave={() => {
              const trimmed = preferredNameDraft.trim();
              setValues((v) => ({ ...v, preferredName: trimmed || "Not provided" }));
              setSavedMessage(
                trimmed
                  ? `Saved. Hosts and other guests now see ${trimmed}.`
                  : "Saved. Your preferred name has been removed.",
              );
              closeModal();
            }}
          />
        </ModalShell>
      )}

      {modal === "displayName" && (
        <ModalShell title="Display name for hosts and curators" onClose={closeModal}>
          <div className="flex flex-col gap-2.5">
            {(["Show my full name", "Show my first name only"] as const).map((label) => {
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
                      {label === "Show my full name" ? values.legalName : firstNameOf(values.legalName)}
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
            onSave={() => {
              setValues((v) => ({ ...v, displayName: displayNameDraft }));
              const shown =
                displayNameDraft === "Show my full name"
                  ? values.legalName
                  : firstNameOf(values.legalName);
              setSavedMessage(`Saved. Hosts and curators now see ${shown}.`);
              closeModal();
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
            saveLabel="Send code"
            saveDisabled={phoneDraft.replace(/\s/g, "").length < 7}
            onSave={() => {
              setOtp(["", "", "", "", "", ""]);
              setModal("phone2");
            }}
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
            <span>Resend in 0:42</span>
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
                disabled={otp.some((d) => !d)}
                onClick={() => {
                  setValues((v) => ({ ...v, phone: phoneDraft.replace(/\s/g, "") }));
                  setSavedMessage(
                    `Saved. Your host will reach you on +234 *** *** ${phoneDraft.replace(/\s/g, "").slice(-4)} on the day.`,
                  );
                  closeModal();
                }}
                className={cn(
                  "cursor-pointer rounded-full px-5.5 py-3 text-[15px] font-medium",
                  otp.some((d) => !d)
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
            onSave={() => {
              const next = emailDraft.trim() || values.email;
              setValues((v) => ({ ...v, email: next }));
              setSavedMessage(
                `Check ${emailDraft.trim() || "your inbox"} and open the confirmation link to finish the change.`,
              );
              closeModal();
            }}
          />
        </ModalShell>
      )}

      {modal === "dob" && (
        <ModalShell title="Edit date of birth" onClose={closeModal}>
          <TextField
            label="Date of birth"
            placeholder="DD Month YYYY"
            value={dobDraft}
            onChange={(e) => setDobDraft(e.target.value)}
          />
          <div className="mt-2.5 text-sm text-muted-foreground">
            You must be 18 or older to book. Some experiences set a higher age limit of their
            own.
          </div>
          <ModalFooter
            onCancel={closeModal}
            onSave={() => {
              const next = dobDraft.trim() || values.dob;
              setValues((v) => ({ ...v, dob: next }));
              setSavedMessage(`Saved. Your date of birth is now ${next}.`);
              closeModal();
            }}
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
              placeholder="+234 803 000 0000"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
            />
          </div>
          <div className="mt-2.5 text-sm text-muted-foreground">
            We contact this person only if something goes wrong during an experience. They are
            never shown to hosts or other guests.
          </div>
          <ModalFooter
            onCancel={closeModal}
            onSave={() => {
              const name = emergencyName.trim();
              const next = name ? `${name} · ${emergencyPhone.trim()}` : "Not provided";
              setValues((v) => ({ ...v, emergency: next }));
              setSavedMessage(
                name
                  ? `Saved. We will contact ${name} if something goes wrong.`
                  : "Saved. You have no emergency contact on file.",
              );
              closeModal();
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
            onSave={() => {
              setValues((v) => ({ ...v, city: cityDraft }));
              setSavedMessage(`Saved. Your feed now opens on experiences in ${cityDraft}.`);
              closeModal();
            }}
          />
        </ModalShell>
      )}
    </div>
  );
}
