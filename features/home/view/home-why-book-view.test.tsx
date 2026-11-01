import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeWhyBookView } from "./home-why-book-view";

describe("HomeWhyBookView", () => {
  it("gives three reasons to book", () => {
    renderWithProviders(<HomeWhyBookView />);

    expect(screen.getByRole("heading", { name: "Why book with us?" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    for (const title of ["Curated, not just listed", "Verified hosts", "Made for you"]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });
});
