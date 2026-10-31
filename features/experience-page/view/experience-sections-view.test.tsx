import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { experienceContent as content, experienceDetails as details } from "@/test/fixtures/experience-page";
import { renderWithProviders } from "@/test/utils/render";

import { ExperienceSectionsView } from "./experience-sections-view";

vi.mock("@/features/experience-details", () => ({
  ExperienceLocationView: ({ landmark }: { landmark: { text: string } | null }) => (
    <section aria-label="Where you'll be">{landmark?.text}</section>
  ),
}));

describe("ExperienceSectionsView", () => {
  it("shows every section the experience has data for", () => {
    renderWithProviders(<ExperienceSectionsView content={content} details={details} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "About this experience",
      "Before you book",
      "Itinerary",
      "Highlights",
      "What to bring",
      "What’s included",
      "Safety notes",
      "More ways to experience Lagos",
    ]);
    expect(screen.getByRole("link", { name: "Kayak Thrills" })).toHaveAttribute("href", "/guides/h1");
    expect(screen.getByText("Moderate. About 4km of walking")).toBeInTheDocument();
    expect(screen.getByText("Up to 8 guests")).toBeInTheDocument();
    expect(screen.getByText("Calm water. A guide beside you.")).toBeInTheDocument();
    expect(screen.getByText("Tips for your host")).toBeInTheDocument();
    expect(screen.getByText("Meet at the yellow gate")).toBeInTheDocument();
    expect(screen.getByText("Please note itinerary is subject to change")).toBeInTheDocument();
  });

  it("numbers the itinerary and shows each step's note", () => {
    renderWithProviders(<ExperienceSectionsView content={content} details={details} />);
    const steps = screen.getAllByRole("listitem").filter((li) => /hotel pickup|park gate/.test(li.textContent ?? ""));
    expect(steps.map((li) => li.textContent)).toEqual(["1Await hotel pickupAt 6:00 am", "2Drive to park gate"]);
  });

  it("folds a long description behind Show more", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(
      <ExperienceSectionsView content={content} details={{ ...details, description: { ...details.description, onToggle } }} />,
    );
    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(onToggle).toHaveBeenCalled();
  });

  it("links the category cards to experience categories", () => {
    renderWithProviders(<ExperienceSectionsView content={content} details={details} />);
    expect(screen.getByRole("link", { name: /Nature & outdoors/ })).toHaveAttribute("href", "/categories/nature-outdoors");
    expect(screen.getByRole("link", { name: /Local food/ })).toHaveAttribute("href", "/categories/local-food-drinks");
  });

  it("leaves out sections without data", () => {
    renderWithProviders(
      <ExperienceSectionsView
        content={{ ...content, included: [], notIncluded: [], moreWays: [] }}
        details={{
          ...details,
          fit: [],
          beforeYouBook: [],
          itinerary: [],
          lists: [],
          location: null,
          landmark: null,
          description: { ...details.description, paragraphs: [] },
        }}
      />,
    );
    expect(screen.queryAllByRole("heading", { level: 2 })).toEqual([]);
    expect(screen.getByText("Kayak Thrills")).toBeInTheDocument();
  });
});
