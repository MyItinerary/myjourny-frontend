import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ReviewCard } from "../view-model/use-experience-reviews-view-model";
import { ReviewRowView } from "./review-row-view";

const review: ReviewCard = {
  id: "a",
  author: "Ngozi A.",
  avatarUrl: null,
  initials: "NA",
  tone: "sand",
  rating: 5,
  comment: "Loved it",
  date: "August 2026",
  verified: true,
  hostReply: null,
  long: false,
  clamped: false,
  helpfulCount: 0,
  voted: false,
  canVote: true,
};

const renderRow = (overrides: Partial<ReviewCard> = {}, handlers = { vote: vi.fn(), expand: vi.fn() }) =>
  renderWithProviders(
    <ul>
      <ReviewRowView
        review={{ ...review, ...overrides }}
        onToggleHelpful={handlers.vote}
        onToggleExpanded={handlers.expand}
      />
    </ul>,
  );

describe("ReviewRowView", () => {
  it("shows who, when, the rating and the text", () => {
    renderRow();
    expect(screen.getByText("Ngozi A.")).toBeInTheDocument();
    expect(screen.getByText("August 2026")).toBeInTheDocument();
    expect(screen.getByText("Verified booking")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByText("Loved it")).toBeInTheDocument();
  });

  it("hides the verified badge for unverified reviews", () => {
    renderRow({ verified: false });
    expect(screen.queryByText("Verified booking")).not.toBeInTheDocument();
  });

  it("shows the author's photo when there is one", () => {
    const { container } = renderRow({ avatarUrl: "https://example.com/a.jpg" });
    expect(container.querySelector("img")).toBeInTheDocument();
  });

  it("shows the host's reply with their initials", () => {
    renderRow({ hostReply: { author: "Tunde, host", text: "Thank you!", initials: "T" } });
    expect(screen.getByText("Reply from Tunde, host")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("votes helpful", async () => {
    const handlers = { vote: vi.fn(), expand: vi.fn() };
    renderRow({}, handlers);
    await userEvent.click(screen.getByRole("button", { name: "Was this helpful?" }));
    expect(handlers.vote).toHaveBeenCalledWith("a");
  });

  it("offers no vote while the API doesn't count them", () => {
    renderRow({ canVote: false });
    expect(screen.queryByRole("button", { name: "Was this helpful?" })).not.toBeInTheDocument();
  });

  it("expands a long review", async () => {
    const handlers = { vote: vi.fn(), expand: vi.fn() };
    renderRow({ long: true, clamped: true }, handlers);
    await userEvent.click(screen.getByRole("button", { name: "Read more" }));
    expect(handlers.expand).toHaveBeenCalledWith("a");
  });
});
