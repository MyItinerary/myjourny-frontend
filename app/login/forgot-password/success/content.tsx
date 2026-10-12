"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { clearCheckoutReturn, useCheckoutReturnHref } from "@/features/checkout";

// Back to login, or, for someone who left the checkout to reset their
// password, to login and then straight back to the checkout.
export function ResetSuccessAction() {
  const href = useCheckoutReturnHref();

  return (
    <Button size="cta" className="w-full" render={<Link href={href} onClick={clearCheckoutReturn} />}>
      Back to login
    </Button>
  );
}
