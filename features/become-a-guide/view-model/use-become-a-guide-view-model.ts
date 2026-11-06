import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { calculateEarnings, formatNgnCurrency, PROFESSIONS } from "../model/become-a-guide-calculator";
import { FAQ_ITEMS } from "../model/become-a-guide-faq";
import { THREE_STEPS } from "../model/become-a-guide-steps";
import type {
  CalculatorOutputs,
  FaqItem,
  ProfessionOption,
  SampleExperienceItem,
  ThreeStepItem,
} from "../model/become-a-guide.types";
import {
  DEFAULT_SAMPLE_EXPERIENCES,
  useSampleExperiencesQuery,
} from "../model/sample-experiences";

export interface BecomeAGuideViewModel {
  professions: ProfessionOption[];
  selectedProfessionId: string;
  pricePerPerson: number;
  formattedPricePerPerson: string;
  groupSize: number;
  sessionsPerMonth: number;
  earnings: CalculatorOutputs;
  steps: ThreeStepItem[];
  sampleExperiences: SampleExperienceItem[];
  isLoadingExperiences: boolean;
  faqItems: FaqItem[];
  openFaqId: string | null;
  onSelectProfession: (id: string) => void;
  onPriceChange: (price: number) => void;
  onGroupSizeChange: (size: number) => void;
  onSessionsChange: (sessions: number) => void;
  onStartApplication: () => void;
  onScrollToHowItWorks: () => void;
  onToggleFaq: (id: string) => void;
}

export function useBecomeAGuideViewModel(): BecomeAGuideViewModel {
  const router = useRouter();
  const [selectedProfessionId, setSelectedProfessionId] = useState<string>("photographer");
  const [pricePerPerson, setPricePerPerson] = useState<number>(10000);
  const [groupSize, setGroupSize] = useState<number>(8);
  const [sessionsPerMonth, setSessionsPerMonth] = useState<number>(4);

  const earnings = useMemo(() => {
    return calculateEarnings({
      pricePerPerson,
      groupSize,
      sessionsPerMonth,
    });
  }, [pricePerPerson, groupSize, sessionsPerMonth]);

  const onSelectProfession = useCallback((id: string) => {
    setSelectedProfessionId(id);
    const found = PROFESSIONS.find((p) => p.id === id);
    if (found) {
      setPricePerPerson(found.defaultPrice);
      setGroupSize(found.defaultGroupSize);
      setSessionsPerMonth(found.defaultSessions);
    }
  }, []);

  const onPriceChange = useCallback((price: number) => {
    setPricePerPerson(price);
  }, []);

  const onGroupSizeChange = useCallback((size: number) => {
    setGroupSize(size);
  }, []);

  const onSessionsChange = useCallback((sessions: number) => {
    setSessionsPerMonth(sessions);
  }, []);

  const onStartApplication = useCallback(() => {
    router.push("/become-a-guide/apply");
  }, [router]);

  const onScrollToHowItWorks = useCallback(() => {
    if (typeof window !== "undefined") {
      const element = document.getElementById("calculator");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  const [openFaqId, setOpenFaqId] = useState<string | null>("cost-to-list");

  const onToggleFaq = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  const sampleExperiencesQuery = useSampleExperiencesQuery();
  const sampleExperiences = sampleExperiencesQuery.data ?? DEFAULT_SAMPLE_EXPERIENCES;

  return {
    professions: PROFESSIONS,
    selectedProfessionId,
    pricePerPerson,
    formattedPricePerPerson: formatNgnCurrency(pricePerPerson),
    groupSize,
    sessionsPerMonth,
    earnings,
    steps: THREE_STEPS,
    sampleExperiences,
    isLoadingExperiences: sampleExperiencesQuery.isLoading,
    faqItems: FAQ_ITEMS,
    openFaqId,
    onSelectProfession,
    onPriceChange,
    onGroupSizeChange,
    onSessionsChange,
    onStartApplication,
    onScrollToHowItWorks,
    onToggleFaq,
  };
}
