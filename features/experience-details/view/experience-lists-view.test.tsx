import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceListsView } from "./experience-lists-view";

describe("ExperienceListsView", () => {
  it("shows each list under its title", () => {
    renderWithProviders(
      <ExperienceListsView
        sections={[
          { kind: "highlights", title: "Highlights", items: ["Sunrise paddle", "Breakfast on the jetty"] },
          { kind: "bring", title: "What to bring", items: ["Sunscreen"] },
        ]}
      />,
    );
    const highlights = screen.getByRole("heading", { name: "Highlights" }).parentElement!;
    expect(within(highlights).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Sunrise paddle",
      "Breakfast on the jetty",
    ]);
    expect(screen.getByRole("heading", { name: "What to bring" })).toBeInTheDocument();
  });

  it("shows nothing without lists", () => {
    const { container } = renderWithProviders(<ExperienceListsView sections={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
