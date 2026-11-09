import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingCancellationViewModel } from "../view-model/use-booking-cancellation-view-model";
import { BookingCancellationView } from "./booking-cancellation-view";

const vm = (overrides: Partial<BookingCancellationViewModel> = {}): BookingCancellationViewModel => ({
  policyText: "Full refund up to 48 hours before.",
  estimate: null,
  outcome: null,
  canRequest: true,
  unpaid: false,
  formOpen: false,
  reason: "",
  canSubmit: false,
  sending: false,
  onOpenForm: vi.fn(),
  onCloseForm: vi.fn(),
  onReason: vi.fn(),
  onSubmit: vi.fn(),
  ...overrides,
});

describe("BookingCancellationView", () => {
  it("shows the policy, the estimate and its breakdown", () => {
    renderWithProviders(
      <BookingCancellationView
        {...vm({
          estimate: {
            title: "Full refund until Sat 1 June, 9:00am",
            detail: "If you cancel now, you should get ₦15,000.00 back.",
            breakdown: [
              { label: "Paid", value: "₦15,000.00" },
              { label: "Estimated refund", value: "₦15,000.00" },
            ],
          },
        })}
      />,
    );

    expect(screen.getByText("Full refund up to 48 hours before.")).toBeInTheDocument();
    expect(screen.getByText("Full refund until Sat 1 June, 9:00am")).toBeInTheDocument();
    expect(screen.getByText("Estimated refund")).toBeInTheDocument();
  });

  it("opens the form from the button", () => {
    const props = vm();
    renderWithProviders(<BookingCancellationView {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Request cancellation" }));
    expect(props.onOpenForm).toHaveBeenCalled();
  });

  it("says Cancel booking when nothing was paid", () => {
    renderWithProviders(<BookingCancellationView {...vm({ unpaid: true })} />);

    expect(screen.getByRole("button", { name: "Cancel booking" })).toBeInTheDocument();
  });

  it("sends the form and lets them keep the booking", () => {
    const props = vm({ formOpen: true, reason: "Plans changed", canSubmit: true });
    renderWithProviders(<BookingCancellationView {...props} />);

    fireEvent.change(screen.getByLabelText("Why do you want to cancel?"), { target: { value: "Plans changed!" } });
    expect(props.onReason).toHaveBeenCalledWith("Plans changed!");
    fireEvent.click(screen.getByRole("button", { name: "Request cancellation" }));
    expect(props.onSubmit).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Keep my booking" }));
    expect(props.onCloseForm).toHaveBeenCalled();
  });

  it("shows the outcome and offers to ask again", () => {
    renderWithProviders(
      <BookingCancellationView
        {...vm({
          outcome: { title: "Cancellation request declined", body: "Your booking is still on.", tone: "bad" },
        })}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Cancellation request declined");
    expect(screen.getByRole("button", { name: "Ask again" })).toBeInTheDocument();
  });

  it("shows a pending request without the button", () => {
    renderWithProviders(
      <BookingCancellationView
        {...vm({
          canRequest: false,
          outcome: { title: "Cancellation requested", body: "Sent 20 May.", tone: "neutral" },
        })}
      />,
    );

    expect(screen.getByText("Cancellation requested")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
