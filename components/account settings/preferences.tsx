"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Coins,
  Compass,
  Heart,
  Lightbulb,
  MapPin,
  PartyPopper,
  Scale,
  Search,
  Smile,
  Sparkles,
  Sunset,
  Umbrella,
  User,
  Users,
  UsersRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Row, SavedBanner } from "@/components/account settings/section-ui";

interface PickOption {
  label: string;
  meta: string;
  icon: LucideIcon;
}

const INTERESTS: PickOption[] = [
  { label: "Local food & drinks", meta: "Street eats, cafés, and hidden spots", icon: MapPin },
  { label: "Culture & history", meta: "Museums, heritage, and local stories", icon: Lightbulb },
  { label: "Nature & outdoors", meta: "Fresh air, trails, and open spaces", icon: Sunset },
  { label: "Art & creativity", meta: "Galleries, murals, and creative spaces", icon: Sparkles },
  { label: "Wellness & calm", meta: "Spas, quiet spots, and slow moments", icon: Smile },
  { label: "Street life", meta: "Markets, corners, and everyday buzz", icon: Users },
  { label: "Events & live shows", meta: "Concerts, festivals, and live energy", icon: PartyPopper },
];

const PACE_OPTIONS: PickOption[] = [
  { label: "Relaxed", meta: "Slow starts, easy plans", icon: Umbrella },
  { label: "Balanced mix", meta: "A mix of downtime and doing things", icon: Scale },
  { label: "Exploratory", meta: "Discovering new spots as you go", icon: Compass },
  { label: "Packed and energetic", meta: "High energy, back-to-back plans", icon: Zap },
];

const VIBE_OPTIONS: PickOption[] = [
  { label: "Escape & reset", meta: "Simple, but still feels meaningful", icon: Smile },
  { label: "Learn something new", meta: "Happy to pay more for real quality", icon: Lightbulb },
  { label: "Adventure & novelty", meta: "New, exciting, and a little wild", icon: Sparkles },
  { label: "Romance & connection", meta: "To deepen or spark a connection", icon: Heart },
  { label: "Celebrate something", meta: "To celebrate milestones and wins", icon: PartyPopper },
  { label: "Explore the local scene", meta: "To see how locals live, eat, play", icon: Search },
];

const SOCIAL_OPTIONS: PickOption[] = [
  { label: "Solo, at my own pace", meta: "Just me, moving how I want", icon: User },
  { label: "With a partner", meta: "Sharing the moment, just us two", icon: Users },
  { label: "Small group (2–4 people)", meta: "A tight crew, easy and close", icon: UsersRound },
  { label: "Big group energy", meta: "The more the merrier", icon: UsersRound },
  { label: "Low-interaction, minimal crowds", meta: "Depends on how good it is", icon: User },
];

const BUDGET_OPTIONS: PickOption[] = [
  { label: "Budget", meta: "Simple, but still feels meaningful", icon: Coins },
  { label: "Mid-range", meta: "Happy to pay more for real quality", icon: Coins },
  {
    label: "Premium",
    meta: "I want curated, special experiences and don’t mind paying more",
    icon: Coins,
  },
  { label: "Flexible", meta: "It really depends on how good the experience is", icon: Coins },
];

const CATEGORIES = INTERESTS.map((i) => i.label);
const VISITED = ["Local food & drinks", "Art & creativity", "Street life"];

interface PreferenceValues {
  interests: string[];
  budget: string;
  social: string;
  vibe: string;
}

const INITIAL_VALUES: PreferenceValues = {
  interests: ["Art & creativity", "Street life", "Local food & drinks"],
  budget: "Mid-range",
  social: "Small group (2–4 people)",
  vibe: "Explore the local scene",
};

const STEPS = ["interests", "budget", "pace", "social", "vibe"] as const;
type Screen = "settings" | (typeof STEPS)[number];

function metaFor(options: PickOption[], label: string) {
  return options.find((o) => o.label === label)?.meta ?? "";
}

function ScreenShell({
  onClose,
  title,
  subtitle,
  stepLabel,
  children,
}: {
  onClose: () => void;
  title: string;
  subtitle: string;
  stepLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[linear-gradient(180deg,rgba(244,242,238,0.87)_0%,rgb(255,255,255)_100%)]">
      <div className="relative flex min-h-full flex-col items-center px-6 py-16 sm:px-10 sm:py-20">
        <Image
          src="/logo/myjourny-logo.svg"
          alt="MyJourny"
          width={150}
          height={26}
          className="h-6 w-auto"
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-8 right-6 flex size-11 cursor-pointer items-center justify-center rounded-xl bg-white text-foreground hover:bg-[#F5F5F5] sm:top-10 sm:right-10"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mt-14 flex w-full max-w-[620px] flex-col items-center gap-8 sm:mt-20">
          <div className="flex flex-col items-center gap-2 text-center">
            {stepLabel && (
              <div className="text-sm font-medium text-brand">{stepLabel}</div>
            )}
            <div className="font-sans text-2xl leading-[1.2] font-extrabold text-foreground sm:text-[32px]">
              {title}
            </div>
            <div className="text-base text-muted-foreground">{subtitle}</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  option,
  selected,
  onClick,
  alignTop,
}: {
  option: PickOption;
  selected: boolean;
  onClick: () => void;
  alignTop?: boolean;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[82px] gap-4 rounded-2xl bg-white p-4 text-left transition-shadow duration-200",
        alignTop ? "items-start" : "items-center",
        selected
          ? "shadow-[inset_0_0_0_1px_theme(colors.brand)]"
          : "shadow-[inset_0_0_0_1px_transparent]",
      )}
    >
      <div
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-[14px] bg-muted text-muted-foreground",
          alignTop && "self-stretch",
        )}
      >
        <Icon size={24} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-base font-medium text-foreground">{option.label}</div>
        <div className="text-sm text-muted-foreground">{option.meta}</div>
      </div>
    </button>
  );
}

function PickerScreen({
  options,
  selected,
  onPick,
  onClose,
  onSave,
  title,
  subtitle,
  stepLabel,
  ctaLabel,
  ctaEnabled,
  alignTop,
}: {
  options: PickOption[];
  selected: string[];
  onPick: (label: string) => void;
  onClose: () => void;
  onSave: () => void;
  title: string;
  subtitle: string;
  stepLabel?: string;
  ctaLabel: string;
  ctaEnabled: boolean;
  alignTop?: boolean;
}) {
  return (
    <ScreenShell onClose={onClose} title={title} subtitle={subtitle} stepLabel={stepLabel}>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map((opt) => (
          <OptionCard
            key={opt.label}
            option={opt}
            selected={selected.includes(opt.label)}
            onClick={() => onPick(opt.label)}
            alignTop={alignTop}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={!ctaEnabled}
        onClick={onSave}
        className={cn(
          "h-12 w-[238px] rounded-full text-base font-medium transition-colors duration-200",
          ctaEnabled
            ? "cursor-pointer bg-brand text-white hover:bg-[#FF4540]"
            : "cursor-not-allowed bg-[#E0E0E0] text-[#BDBDBD]",
        )}
      >
        {ctaLabel}
      </button>
    </ScreenShell>
  );
}

export function PreferencesSection() {
  const [quizTaken, setQuizTaken] = useState(true);
  const [values, setValues] = useState<PreferenceValues>(INITIAL_VALUES);
  const [pace, setPace] = useState("Balanced mix");
  const [screen, setScreen] = useState<Screen>("settings");
  const [quizStep, setQuizStep] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [interestDraft, setInterestDraft] = useState<string[]>(values.interests);
  const [budgetDraft, setBudgetDraft] = useState(values.budget);
  const [paceDraft, setPaceDraft] = useState(pace);
  const [socialDraft, setSocialDraft] = useState(values.social);
  const [vibeDraft, setVibeDraft] = useState(values.vibe);

  const inQuiz = quizStep !== null;
  const stepLabel = inQuiz ? `Step ${quizStep! + 1} of ${STEPS.length}` : undefined;

  function toggleInterest(label: string) {
    setInterestDraft((cur) => {
      const i = cur.indexOf(label);
      if (i > -1) return cur.filter((v) => v !== label);
      if (cur.length >= 3) return [...cur.slice(1), label];
      return [...cur, label];
    });
  }

  function startQuiz() {
    setInterestDraft(values.interests);
    setBudgetDraft(values.budget);
    setPaceDraft(pace);
    setSocialDraft(values.social);
    setVibeDraft(values.vibe);
    setSavedMessage(null);
    setQuizStep(0);
    setScreen("interests");
  }

  function openStandalone(target: Screen) {
    setSavedMessage(null);
    setQuizStep(null);
    if (target === "interests") setInterestDraft(values.interests);
    if (target === "budget") setBudgetDraft(values.budget);
    if (target === "pace") setPaceDraft(pace);
    if (target === "social") setSocialDraft(values.social);
    if (target === "vibe") setVibeDraft(values.vibe);
    setScreen(target);
  }

  function exitScreen() {
    if (inQuiz) {
      // Discard every draft made during the quiz, not just the current step's.
      setInterestDraft(values.interests);
      setBudgetDraft(values.budget);
      setPaceDraft(pace);
      setSocialDraft(values.social);
      setVibeDraft(values.vibe);
    }
    setQuizStep(null);
    setScreen("settings");
  }

  function advanceOrFinishQuiz() {
    const step = quizStep!;
    if (step < STEPS.length - 1) {
      setQuizStep(step + 1);
      setScreen(STEPS[step + 1]);
      return;
    }
    setValues({
      interests: interestDraft,
      budget: budgetDraft,
      social: socialDraft,
      vibe: vibeDraft,
    });
    setPace(paceDraft);
    setQuizTaken(true);
    setQuizStep(null);
    setScreen("settings");
    setSavedMessage("Saved. All five answers are updated and your feed has already changed.");
  }

  function saveStandaloneInterests() {
    const same =
      interestDraft.length === values.interests.length &&
      interestDraft.every((v) => values.interests.includes(v));
    if (same || interestDraft.length !== 3) return;
    setValues((v) => ({ ...v, interests: interestDraft }));
    setScreen("settings");
    setSavedMessage(`Saved. Your feed now leads with ${interestDraft.join(", ").toLowerCase()}.`);
  }

  function saveStandaloneBudget() {
    if (budgetDraft === values.budget) return;
    setValues((v) => ({ ...v, budget: budgetDraft }));
    setScreen("settings");
    setSavedMessage(`Saved. Your budget is now ${budgetDraft}. Your feed has already changed.`);
  }

  function saveStandalonePace() {
    if (paceDraft === pace) return;
    setPace(paceDraft);
    setScreen("settings");
    const meta = metaFor(PACE_OPTIONS, paceDraft);
    setSavedMessage(
      `Saved. Your pace is now ${paceDraft} · ${meta}. Your feed has already changed.`,
    );
  }

  function saveStandaloneSocial() {
    if (socialDraft === values.social) return;
    setValues((v) => ({ ...v, social: socialDraft }));
    setScreen("settings");
    setSavedMessage(
      `Saved. Your social style is now ${socialDraft}. Your feed has already changed.`,
    );
  }

  function saveStandaloneVibe() {
    if (vibeDraft === values.vibe) return;
    setValues((v) => ({ ...v, vibe: vibeDraft }));
    setScreen("settings");
    setSavedMessage(`Saved. Your vibe is now ${vibeDraft}. Your feed has already changed.`);
  }

  if (screen === "interests") {
    const sameAsSaved =
      interestDraft.length === values.interests.length &&
      interestDraft.every((v) => values.interests.includes(v));
    const ctaEnabled = inQuiz
      ? interestDraft.length === 3
      : interestDraft.length === 3 && !sameAsSaved;
    return (
      <PickerScreen
        options={INTERESTS}
        selected={interestDraft}
        onPick={toggleInterest}
        onClose={exitScreen}
        onSave={inQuiz ? advanceOrFinishQuiz : saveStandaloneInterests}
        title="What kind of experiences interest you?"
        subtitle="We’ll focus on these first. You can select up to 3"
        stepLabel={stepLabel}
        ctaLabel={inQuiz ? "Continue" : "Save changes"}
        ctaEnabled={ctaEnabled}
      />
    );
  }

  if (screen === "budget") {
    return (
      <PickerScreen
        options={BUDGET_OPTIONS}
        selected={[budgetDraft]}
        onPick={setBudgetDraft}
        onClose={exitScreen}
        onSave={inQuiz ? advanceOrFinishQuiz : saveStandaloneBudget}
        title="What’s your ideal spend per experience?"
        subtitle="An amount you're comfortable spending per experience"
        stepLabel={stepLabel}
        ctaLabel={inQuiz ? "Continue" : "Save changes"}
        ctaEnabled={inQuiz ? !!budgetDraft : budgetDraft !== values.budget}
      />
    );
  }

  if (screen === "pace") {
    return (
      <PickerScreen
        options={PACE_OPTIONS}
        selected={[paceDraft]}
        onPick={setPaceDraft}
        onClose={exitScreen}
        onSave={inQuiz ? advanceOrFinishQuiz : saveStandalonePace}
        title="What kind of pace do you enjoy when exploring?"
        subtitle="This helps us match experiences to your vibe."
        stepLabel={stepLabel}
        ctaLabel={inQuiz ? "Continue" : "Save changes"}
        ctaEnabled={inQuiz ? !!paceDraft : paceDraft !== pace}
        alignTop
      />
    );
  }

  if (screen === "social") {
    return (
      <PickerScreen
        options={SOCIAL_OPTIONS}
        selected={[socialDraft]}
        onPick={setSocialDraft}
        onClose={exitScreen}
        onSave={inQuiz ? advanceOrFinishQuiz : saveStandaloneSocial}
        title="Who do you usually go with?"
        subtitle="We'll focus on these first. You can select up to 3"
        stepLabel={stepLabel}
        ctaLabel={inQuiz ? "Continue" : "Save changes"}
        ctaEnabled={inQuiz ? !!socialDraft : socialDraft !== values.social}
      />
    );
  }

  if (screen === "vibe") {
    return (
      <PickerScreen
        options={VIBE_OPTIONS}
        selected={[vibeDraft]}
        onPick={setVibeDraft}
        onClose={exitScreen}
        onSave={inQuiz ? advanceOrFinishQuiz : saveStandaloneVibe}
        title="What kind of experiences light you up?"
        subtitle="Everyone shows up for different reasons. This helps us recommend better."
        stepLabel={inQuiz ? `Step ${quizStep! + 1} of ${STEPS.length}` : undefined}
        ctaLabel={inQuiz ? "Finish" : "Save changes"}
        ctaEnabled={inQuiz ? !!vibeDraft : vibeDraft !== values.vibe}
      />
    );
  }

  const answers: { key: string; label: string; value: string; action: () => void }[] = [
    {
      key: "budget",
      label: "Budget",
      value: `${values.budget} · ${metaFor(BUDGET_OPTIONS, values.budget)}`,
      action: () => openStandalone("budget"),
    },
    {
      key: "energy",
      label: "Energy",
      value: `${pace} · ${metaFor(PACE_OPTIONS, pace)}`,
      action: () => openStandalone("pace"),
    },
    {
      key: "social",
      label: "Social",
      value: `${values.social} · ${metaFor(SOCIAL_OPTIONS, values.social)}`,
      action: () => openStandalone("social"),
    },
    {
      key: "vibe",
      label: "Vibe",
      value: `${values.vibe} · ${metaFor(VIBE_OPTIONS, values.vibe)}`,
      action: () => openStandalone("vibe"),
    },
  ];

  return (
    <div className="max-w-[720px] flex-1">
      <div className="font-sans text-[32px] leading-[1.2] font-extrabold text-foreground">
        Your preferences
      </div>

      {savedMessage && (
        <SavedBanner message={savedMessage} onDismiss={() => setSavedMessage(null)} />
      )}

      {!quizTaken ? (
        <div className="mt-6 rounded-2xl bg-muted p-7 shadow-[inset_0_0_0_1px_theme(colors.border)]">
          <div className="font-sans text-2xl leading-[1.2] font-extrabold text-foreground">
            You have not taken the preference quiz yet
          </div>
          <div className="mt-2 max-w-[520px] text-base text-muted-foreground">
            Five questions — budget, energy, interests, social and vibe. It decides what shows up
            first in your feed, and you can change any answer here afterwards.
          </div>
          <button
            type="button"
            onClick={startQuiz}
            className="mt-5 cursor-pointer rounded-full bg-brand px-6 py-3.5 text-[15px] font-medium text-white hover:bg-[#FF4540]"
          >
            Take the preference quiz
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <div className="flex items-start justify-between gap-8 border-b border-border py-7">
            <div className="flex-1">
              <div className="text-base font-medium text-foreground">Your interests</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.interests.map((label) => (
                  <div
                    key={label}
                    className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {label}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                Chosen when you joined. Up to 3 at a time.
              </div>
            </div>
            <button
              type="button"
              onClick={() => openStandalone("interests")}
              className="shrink-0 pt-0.5 text-[15px] font-medium text-brand underline hover:text-primary cursor-pointer"
            >
              Edit
            </button>
          </div>

          {answers.map((a) => (
            <Row key={a.key} label={a.label} value={a.value} actionLabel="Edit" onAction={a.action} />
          ))}

          <div className="flex items-center justify-between gap-8 border-b border-border py-7">
            <div className="flex-1">
              <div className="text-base font-medium text-foreground">
                Retake the preference quiz
              </div>
              <div className="text-sm text-muted-foreground">
                Five questions. Your feed changes as soon as you finish.
              </div>
            </div>
            <button
              type="button"
              onClick={startQuiz}
              className="shrink-0 cursor-pointer rounded-full bg-brand px-5.5 py-3 text-[15px] font-medium text-white hover:bg-[#FF4540]"
            >
              Retake the quiz
            </button>
          </div>

          <div className="py-7">
            <div className="flex items-baseline justify-between gap-6">
              <div>
                <div className="text-base font-medium text-foreground">Where you have been</div>
                <div className="mt-0.5 text-sm text-muted-foreground">
                  Categories you have booked at least once. We also use what you browse to order
                  your feed.
                </div>
              </div>
              <div className="shrink-0 text-[15px] font-medium text-brand">
                {VISITED.length} of {CATEGORIES.length}
              </div>
            </div>
            <div className="mt-4.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CATEGORIES.map((label) => {
                const visited = VISITED.includes(label);
                return (
                  <div
                    key={label}
                    className={cn(
                      "flex min-h-[96px] flex-col justify-between rounded-2xl p-4",
                      visited
                        ? "bg-brand text-white shadow-[inset_0_0_0_1px_theme(colors.brand)]"
                        : "bg-muted text-foreground shadow-[inset_0_0_0_1px_#E9E1D2]",
                    )}
                  >
                    <div className="text-sm font-medium">{label}</div>
                    <div className={cn("text-xs", visited ? "text-white/82" : "text-muted-foreground")}>
                      {visited ? "Booked" : "Not yet"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
