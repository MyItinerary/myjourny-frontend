import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { calculateEarnings, formatNgnCurrency, PROFESSIONS } from "../model/become-a-guide-calculator";
import type { CalculatorOutputs, ProfessionOption } from "../model/become-a-guide.types";

export interface BecomeAGuideViewModel {
  professions: ProfessionOption[];
  selectedProfessionId: string;
  pricePerPerson: number;
  formattedPricePerPerson: string;
  groupSize: number;
  sessionsPerMonth: number;
  earnings: CalculatorOutputs;
  onSelectProfession: (id: string) => void;
  onPriceChange: (price: number) => void;
  onGroupSizeChange: (size: number) => void;
  onSessionsChange: (sessions: number) => void;
  onStartApplication: () => void;
  onScrollToHowItWorks: () => void;
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
    router.push("/host/dashboard/listings/new");
  }, [router]);

  const onScrollToHowItWorks = useCallback(() => {
    if (typeof window !== "undefined") {
      const element = document.getElementById("calculator");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  return {
    professions: PROFESSIONS,
    selectedProfessionId,
    pricePerPerson,
    formattedPricePerPerson: formatNgnCurrency(pricePerPerson),
    groupSize,
    sessionsPerMonth,
    earnings,
    onSelectProfession,
    onPriceChange,
    onGroupSizeChange,
    onSessionsChange,
    onStartApplication,
    onScrollToHowItWorks,
  };
}
