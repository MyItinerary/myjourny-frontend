import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventCategoryView } from "./event-category-view";

vi.mock("@/components/home/home-nav", () => ({ HomeNav: () => <nav aria-label="Main" /> }));
vi.mock("@/components/home/footer", () => ({ Footer: () => <footer>Footer</footer> }));

describe("EventCategoryView", () => {
  it("names the event category and says there are no events yet", () => {
    renderWithProviders(<EventCategoryView label="Music Concerts" />);
    expect(screen.getByRole("heading", { level: 1, name: "Music Concerts events" })).toBeInTheDocument();
    expect(screen.getByText("No music concerts events yet")).toBeInTheDocument();
    expect(screen.getByText("Back to home").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Events");
  });
});
