import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { Footer } from "./footer";

vi.mock("../model/footer-categories", () => ({
  useInterestCategories: () => ({ data: [{ id: 1, text: "Food", parent_id: null, slug: "food" }], isLoading: false }),
  useSubcategories: () => ({ data: [], isLoading: false, isFetching: false }),
}));

describe("Footer", () => {
  it("wires the view-model into the view", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("tab", { name: "Food" })).toBeInTheDocument();
    expect(screen.getByText("Hosting and Curating")).toBeInTheDocument();
  });
});
