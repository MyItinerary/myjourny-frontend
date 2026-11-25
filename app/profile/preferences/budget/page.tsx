import type { Metadata } from "next";
import { EditBudgetContent } from "./content";

export const metadata: Metadata = {
  title: "Edit Budget Range | Myjourny",
  description: "Update your target spend per experience.",
};

export default function EditBudgetPage() {
  return <EditBudgetContent />;
}
