import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { StarRow } from "./star-row";

describe("StarRow", () => {
  it("reads out the rating when it's display-only", () => {
    renderWithProviders(<StarRow rating={3} />);
    expect(screen.getByRole("img", { name: "3 out of 5 stars" })).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("lets you pick one to five stars", async () => {
    const onRate = vi.fn();
    renderWithProviders(<StarRow rating={2} onRate={onRate} />);
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "2 stars" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "1 star" }));
    expect(onRate).toHaveBeenCalledWith(1);
  });
});
