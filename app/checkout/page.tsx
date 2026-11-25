import type { Metadata } from "next";

import { CheckoutContent } from "./content";

export const metadata: Metadata = {
  title: "Checkout — Myjourny",
};

export default function CheckoutPage() {
  return <CheckoutContent />;
}
