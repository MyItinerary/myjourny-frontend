"use client";

import {
  CheckoutDetailsStepView,
  CheckoutEmailStepView,
  CheckoutShellView,
  OrderSummaryView,
  useCheckoutViewModel,
} from "@/features/checkout";

export function CheckoutContent() {
  const vm = useCheckoutViewModel();
  if (!vm.ready || !vm.summary) return null;

  return (
    <CheckoutShellView summary={<OrderSummaryView summary={vm.summary} />}>
      {vm.step === "email" ? (
        <CheckoutEmailStepView email={vm.email} />
      ) : (
        <CheckoutDetailsStepView details={vm.details} />
      )}
    </CheckoutShellView>
  );
}
