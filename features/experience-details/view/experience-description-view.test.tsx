import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { ExperienceDescriptionView } from "./experience-description-view";

const description = (overrides = {}) => ({
  paragraphs: ["Paddle out at sunrise.", "Breakfast is on the jetty."],
  long: false,
  expanded: false,
  onToggle: vi.fn(),
  ...overrides,
});

describe("ExperienceDescriptionView", () => {
  it("keeps the host's paragraphs", () => {
    renderWithProviders(<ExperienceDescriptionView description={description()} />);
    expect(screen.getByText("Paddle out at sunrise.").tagName).toBe("P");
    expect(screen.getByText("Breakfast is on the jetty.").tagName).toBe("P");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers Show more on a long description, then Show less", async () => {
    const props = description({ long: true });
    const { rerender } = renderWithProviders(<ExperienceDescriptionView description={props} />);
    await userEvent.click(screen.getByRole("button", { name: "Show more" }));
    expect(props.onToggle).toHaveBeenCalled();
    rerender(<ExperienceDescriptionView description={{ ...props, expanded: true }} />);
    expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();
  });

  it("shows nothing without a description", () => {
    const { container } = renderWithProviders(<ExperienceDescriptionView description={description({ paragraphs: [] })} />);
    expect(container).toBeEmptyDOMElement();
  });
});
