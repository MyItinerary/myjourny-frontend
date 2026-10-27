import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { experienceContent as content } from "@/test/fixtures/experience-details";

import { ExperienceSectionsView } from "./experience-sections-view";

describe("ExperienceSectionsView", () => {
  it("shows every section the experience has data for", () => {
    renderWithProviders(<ExperienceSectionsView content={content} />);
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      "About this experience",
      "Before you book",
      "Itinerary",
      "Highlights",
      "What’s included",
      "Safety notes",
      "Where you’ll be",
    ]);
    expect(screen.getByRole("link", { name: "Kayak Thrills" })).toHaveAttribute("href", "/guides/h1");
    expect(screen.getByText("Fitness level")).toBeInTheDocument();
    expect(screen.getByText("Calm water. A guide beside you.")).toBeInTheDocument();
    expect(screen.getByText("Tips for your host")).toBeInTheDocument();
    expect(screen.getByText("Please note itinerary is subject to change")).toBeInTheDocument();
    expect(screen.getByText("Exact meeting point shared after booking.")).toBeInTheDocument();
  });

  it("numbers the itinerary", () => {
    renderWithProviders(<ExperienceSectionsView content={content} />);
    const steps = screen.getAllByRole("listitem").filter((li) => li.textContent?.includes("hotel pickup") || li.textContent?.includes("park gate"));
    expect(steps.map((li) => li.textContent)).toEqual(["1Await hotel pickup", "2Drive to park gate"]);
  });

  it("leaves out sections without data", () => {
    renderWithProviders(
      <ExperienceSectionsView
        content={{
          ...content,
          about: null,
          facts: [],
          itinerary: [],
          highlights: [],
          included: [],
          notIncluded: [],
          safetyNotes: [],
          location: "",
        }}
      />,
    );
    expect(screen.queryAllByRole("heading", { level: 2 })).toEqual([]);
    expect(screen.getByText("Kayak Thrills")).toBeInTheDocument();
  });
});
