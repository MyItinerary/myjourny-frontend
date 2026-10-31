import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { BookButton, IconTile, InfoRow, Notice, PillRow, UrgencyBadge } from "./booking-card-parts";

describe("booking card parts", () => {
  it("says what the policy is", () => {
    renderWithProviders(<InfoRow title="Free cancellation" body="Until Friday." />);
    expect(screen.getByText("Free cancellation")).toBeInTheDocument();
    expect(screen.getByText("Until Friday.")).toBeInTheDocument();
  });

  it("explains a policy in a tooltip, when it has one", async () => {
    const { user } = renderWithProviders(<InfoRow title="Cancellation" body="Cancel up to 24 hours before." hint="Tickets are non-refundable." />);
    await user.hover(screen.getByRole("button", { name: "About the cancellation policy" }));
    expect(await screen.findByText("Tickets are non-refundable.")).toBeInTheDocument();
  });

  it("draws an icon tile and a pill row", () => {
    const { container } = renderWithProviders(
      <PillRow>
        <IconTile surface="white" />
      </PillRow>,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("makes the last spot solid and heavier than a few", () => {
    const { rerender } = renderWithProviders(<UrgencyBadge level="few" text="3 spots left at 7:00am on Sat 12 Sept" />);
    expect(screen.getByRole("status")).toHaveClass("bg-[#FFF0D6]");
    rerender(<UrgencyBadge level="one" text="Last spot at 7:00am on Sat 12 Sept" />);
    expect(screen.getByRole("status")).toHaveClass("bg-[#FFB020]", "font-semibold");
  });

  it("carries an action in a notice, and alerts on an error", async () => {
    const onAction = vi.fn();
    const { user, rerender } = renderWithProviders(
      <Notice title="Sold out on 12 Sept" body="Next available: Sat 19 Sept." action="See all dates" onAction={onAction} />,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See all dates" }));
    expect(onAction).toHaveBeenCalled();

    rerender(<Notice tone="error" title="We couldn't load times" body="Nothing was charged." />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the label, greys out when disabled, and shows dots while loading", async () => {
    const onClick = vi.fn();
    const { user, rerender } = renderWithProviders(<BookButton label="Book now" loading={false} disabled={false} onClick={onClick} />);
    await user.click(screen.getByRole("button", { name: "Book now" }));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<BookButton label="Book now" loading={false} disabled onClick={onClick} />);
    expect(screen.getByRole("button", { name: "Book now" })).toBeDisabled();

    rerender(<BookButton label={null} loading disabled={false} onClick={onClick} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("Starting your booking")).toBeInTheDocument();
  });
});
