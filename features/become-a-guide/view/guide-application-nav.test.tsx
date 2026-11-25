import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GuideApplicationNav } from "./guide-application-nav";

describe("GuideApplicationNav", () => {
  it("renders Page 1 of 2 indicator on step 1", () => {
    render(<GuideApplicationNav step={1} />);

    expect(screen.getByRole("link", { name: /MyJourny home/i })).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("renders Page 2 of 2 indicator on step 2", () => {
    render(<GuideApplicationNav step={2} />);

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
  });

  it("renders Submitted for review indicator on review step", () => {
    render(<GuideApplicationNav step="review" />);

    expect(screen.getByText("Submitted for review")).toBeInTheDocument();
  });
});
