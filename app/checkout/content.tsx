"use client";

import {
  CheckoutDetailsStepView,
  CheckoutShellView,
  OrderSummaryView,
  useCheckoutViewModel,
} from "@/features/checkout";

export function CheckoutContent() {
  const vm = useCheckoutViewModel();
  if (!vm.ready || !vm.summary) return null;

  return (
    <CheckoutShellView summary={<OrderSummaryView summary={vm.summary} />}>
      <CheckoutDetailsStepView form={vm.form} />
    </CheckoutShellView>
  );
}
