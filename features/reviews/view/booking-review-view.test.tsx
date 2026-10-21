import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { BookingReviewViewModel } from "../view-model/use-booking-review-view-model";
import { BookingReviewView } from "./booking-review-view";

type Form = Extract<BookingReviewViewModel, { mode: "form" }>;

function form(overrides: Partial<Form> = {}): Form {
  return {
    mode: "form",
    editing: false,
    rating: 0,
    comment: "",
    maxLength: 2000,
    canSubmit: false,
    saving: false,
    onRate: vi.fn(),
    onComment: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: null,
    ...overrides,
  };
}

describe("BookingReviewView", () => {
  it("renders nothing when the booking can't be reviewed", () => {
    const { container } = renderWithProviders(<BookingReviewView mode="hidden" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("asks how it was and sends the stars and comment up", async () => {
    const vm = form();
    renderWithProviders(<BookingReviewView {...vm} />);
    expect(screen.getByRole("heading", { name: "How was it?" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Post review" })).toBeDisabled();

    await userEvent.click(screen.getByRole("radio", { name: "4 stars" }));
    expect(vm.onRate).toHaveBeenCalledWith(4);
    await userEvent.type(screen.getByLabelText("Tell others about it (optional)"), "A");
    expect(vm.onComment).toHaveBeenCalledWith("A");
  });

  it("posts once a rating is chosen", async () => {
    const vm = form({ rating: 5, canSubmit: true });
    renderWithProviders(<BookingReviewView {...vm} />);
    expect(screen.getByRole("radio", { name: "5 stars" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("button", { name: "Post review" }));
    expect(vm.onSubmit).toHaveBeenCalled();
  });

  it("edits with save and cancel", async () => {
    const vm = form({ editing: true, rating: 3, canSubmit: true, onCancel: vi.fn() });
    renderWithProviders(<BookingReviewView {...vm} />);
    expect(screen.getByRole("heading", { name: "Edit your review" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(vm.onCancel).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save changes" })).toBeEnabled();
  });

  it("shows the review left, with edit while it's allowed", async () => {
    const onEdit = vi.fn();
    renderWithProviders(
      <BookingReviewView mode="posted" rating={4} comment="Good" date="12 Oct 2026" isHidden={false} onEdit={onEdit} />,
    );
    expect(screen.getByRole("heading", { name: "Your review" })).toBeInTheDocument();
    expect(screen.getByText("Posted 12 Oct 2026")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalled();
  });

  it("tells the author when MyJourny has hidden their review", () => {
    renderWithProviders(
      <BookingReviewView mode="posted" rating={1} comment={null} date="12 Oct 2026" isHidden onEdit={null} />,
    );
    expect(screen.getByText(/hidden this review/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit" })).not.toBeInTheDocument();
  });
});
