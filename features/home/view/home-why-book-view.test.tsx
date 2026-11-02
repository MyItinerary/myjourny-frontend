import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HOME_SECTION_IDS } from "../model/home-sections.types";

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

  it("can be found by the taste-quiz popup, which waits until it has been scrolled past", () => {
    renderWithProviders(<HomeWhyBookView />);

    expect(document.getElementById(HOME_SECTION_IDS.whyBook)).toContainElement(
      screen.getByRole("heading", { name: "Why book with us?" }),
    );
  });
});
