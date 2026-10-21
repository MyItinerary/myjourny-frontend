import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceBeforeYouBookView } from "./experience-before-you-book-view";

describe("ExperienceBeforeYouBookView", () => {
  it("shows each item the experience has", () => {
    renderWithProviders(
      <ExperienceBeforeYouBookView
        items={[
          { kind: "guests", label: "Group size", description: "3–6 guests per booking" },
          { kind: "not_included", label: "Not included", description: "Transport" },
          { kind: "safety", label: "Safety", description: "Life jackets provided" },
          { kind: "cancellation", label: "Cancellation policy", description: "Free cancellation up to 24 hours before" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Before you book" })).toBeInTheDocument();
    expect(screen.getByText("3–6 guests per booking")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("Life jackets provided")).toBeInTheDocument();
    expect(screen.getByText("Free cancellation up to 24 hours before")).toBeInTheDocument();
  });

  it("renders nothing when the experience has no details", () => {
    const { container } = renderWithProviders(<ExperienceBeforeYouBookView items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
