"use client";

import {
  CheckoutAuthView,
  CheckoutShellView,
  CheckoutStepsView,
  OrderSummaryView,
  useCheckoutViewModel,
} from "@/features/checkout";

export function CheckoutContent() {
  const vm = useCheckoutViewModel();
  if (!vm.ready || !vm.summary) return null;

  return (
    <CheckoutShellView summary={<OrderSummaryView summary={vm.summary} />}>
      <CheckoutStepsView steps={vm.steps} />
      <CheckoutAuthView auth={vm.auth} />
    </CheckoutShellView>
  );
}
