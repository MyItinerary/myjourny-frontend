import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeBrowseView } from "./home-browse-view";

describe("HomeBrowseView", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("offers the experiences and events pages", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "true");
    renderWithProviders(<HomeBrowseView />);

    expect(screen.getByRole("heading", { name: "Browse everything" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Experiences/ })).toHaveAttribute("href", "/experiences");
    expect(screen.getByRole("link", { name: /Events/ })).toHaveAttribute("href", "/events");
  });

  it("hides the whole section while events are off", () => {
    vi.stubEnv("NEXT_PUBLIC_EVENTS_ENABLED", "");
    const { container } = renderWithProviders(<HomeBrowseView />);

    expect(screen.queryByRole("heading", { name: "Browse everything" })).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
