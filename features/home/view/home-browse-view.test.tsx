import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeBrowseView } from "./home-browse-view";

describe("HomeBrowseView", () => {
  it("offers the experiences and events pages", () => {
    renderWithProviders(<HomeBrowseView />);

    expect(screen.getByRole("heading", { name: "Browse everything" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Experiences/ })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("link", { name: /Events/ })).toHaveAttribute("href", "/events");
  });
});
