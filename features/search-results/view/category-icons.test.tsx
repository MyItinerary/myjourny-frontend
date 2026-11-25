import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryIcon } from "./category-icons";

describe("CategoryIcon", () => {
  it("renders an icon for a known category, a ticket for events and a fallback otherwise", () => {
    const experience = render(<CategoryIcon slug="local-food-drinks" kind="experiences" />).container.querySelector("svg");
    const event = render(<CategoryIcon slug="music-live-shows" kind="events" />).container.querySelector("svg");
    const unknown = render(<CategoryIcon slug="mystery" kind="experiences" />).container.querySelector("svg");

    expect(experience).not.toBeNull();
    expect(event?.getAttribute("class")).toContain("lucide-ticket");
    expect(unknown).not.toBeNull();
  });
});
