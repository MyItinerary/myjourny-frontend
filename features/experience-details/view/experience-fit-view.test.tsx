import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceFitView } from "./experience-fit-view";

describe("ExperienceFitView", () => {
  it("shows each detail with its note", () => {
    renderWithProviders(
      <ExperienceFitView
        items={[
          { kind: "fitness", label: "Fitness", value: "Moderate", note: "Two hours of easy paddling" },
          { kind: "accessibility", label: "Accessibility", value: "Not confirmed. Ask the host before you book.", note: null },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Fit and logistics" })).toBeInTheDocument();
    expect(screen.getByText("Moderate")).toBeInTheDocument();
    expect(screen.getByText("Two hours of easy paddling")).toBeInTheDocument();
    expect(screen.getByText("Not confirmed. Ask the host before you book.")).toBeInTheDocument();
  });

  it("shows nothing when no details are set", () => {
    const { container } = renderWithProviders(<ExperienceFitView items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
