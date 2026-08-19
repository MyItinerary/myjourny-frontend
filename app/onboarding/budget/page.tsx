import type { Metadata } from "next";

import { BudgetContent } from "./content";

export const metadata: Metadata = {
  title: "What's your budget? — MyJourny",
};

export default function BudgetPage() {
  return <BudgetContent />;
}
