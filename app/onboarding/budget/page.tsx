import type { Metadata } from "next";

import { BudgetContent } from "./content";

export const metadata: Metadata = {
  title: "What's your budget? | Myjourny",
};

export default function BudgetPage() {
  return <BudgetContent />;
}
