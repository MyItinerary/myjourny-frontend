import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GuideApplicationReview } from "./guide-application-review";

describe("GuideApplicationReview", () => {
  it("renders 4 numbered steps for individual verification", () => {
    render(<GuideApplicationReview verificationType="individual" onDone={vi.fn()} />);

    expect(screen.getByText("You're in review")).toBeInTheDocument();
    expect(screen.getByText(/your details are checked and matched/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Go to your dashboard" })).toBeInTheDocument();
  });

  it("renders business copy in step 2 for registered business verification", () => {
    render(<GuideApplicationReview verificationType="business" onDone={vi.fn()} />);

    expect(
      screen.getByText(/Details and business details are checked and matched/i)
    ).toBeInTheDocument();
  });

  it("triggers onDone when dashboard button is clicked", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(<GuideApplicationReview verificationType="individual" onDone={onDone} />);

    await user.click(screen.getByRole("button", { name: "Go to your dashboard" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
