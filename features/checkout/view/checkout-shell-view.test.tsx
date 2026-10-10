import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { CheckoutShellView } from "./checkout-shell-view";

describe("CheckoutShellView", () => {
  it("puts the form and the summary side by side under the logo", () => {
    renderWithProviders(<CheckoutShellView summary={<p>Order</p>}>{<p>Form</p>}</CheckoutShellView>);

    expect(screen.getByAltText("MyJourny")).toBeInTheDocument();
    expect(screen.getByText("Form")).toBeInTheDocument();
    expect(screen.getByText("Order")).toBeInTheDocument();
  });
});
