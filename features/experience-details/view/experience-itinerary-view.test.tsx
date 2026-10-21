import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceItineraryView } from "./experience-itinerary-view";

describe("ExperienceItineraryView", () => {
  it("lists the steps in order with their details", () => {
    renderWithProviders(
      <ExperienceItineraryView
        steps={[{ title: "Board the canoe", description: "Your guide is a Makoko resident." }, { title: "Fish market stop" }]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("1Board the canoeYour guide is a Makoko resident.");
    expect(items[1]).toHaveTextContent("2Fish market stop");
  });

  it("renders nothing without steps", () => {
    const { container } = renderWithProviders(<ExperienceItineraryView steps={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
