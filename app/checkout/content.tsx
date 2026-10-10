"use client";

import {
  CheckoutDetailsStepView,
  CheckoutLoginView,
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
      <CheckoutLoginView login={vm.login} />
    </CheckoutShellView>
  );
}
