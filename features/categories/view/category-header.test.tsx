import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { CategoryHeader } from "./category-header";

describe("CategoryHeader", () => {
  it("displays loading placeholder instead of 0 results while loading", () => {
    renderWithProviders(
      <CategoryHeader
        label="Beaches & waterfronts"
        count={0}
        isLoading={true}
      />
    );

    expect(screen.getByText("(Loading experiences…)")).toBeInTheDocument();
    expect(screen.queryByText("(0 results)")).not.toBeInTheDocument();
  });

  it("displays custom loading placeholder when loadingText is passed", () => {
    renderWithProviders(
      <CategoryHeader
        label="Nightlife"
        count={0}
        isLoading={true}
        loadingText="(Finding experiences…)"
      />
    );

    expect(screen.getByText("(Finding experiences…)")).toBeInTheDocument();
    expect(screen.queryByText("(0 results)")).not.toBeInTheDocument();
  });

  it("displays error placeholder instead of 0 results when request fails on initial load", () => {
    renderWithProviders(
      <CategoryHeader
        label="Beaches & waterfronts"
        count={0}
        isLoading={false}
        isError={true}
      />
    );

    expect(screen.getByText("(Failed to load)")).toBeInTheDocument();
    expect(screen.queryByText("(0 results)")).not.toBeInTheDocument();
  });

  it("maintains the result count when isError occurs but items are already loaded", () => {
    renderWithProviders(
      <CategoryHeader
        label="Beaches & waterfronts"
        count={16}
        total={24}
        isLoading={false}
        isError={true}
      />
    );

    expect(screen.getByText("(24 results)")).toBeInTheDocument();
    expect(screen.queryByText("(Failed to load)")).not.toBeInTheDocument();
  });

  it("displays exact result count after successful API response", () => {
    renderWithProviders(
      <CategoryHeader
        label="Beaches & waterfronts"
        count={16}
        total={24}
        isLoading={false}
      />
    );

    expect(screen.getByText("(24 results)")).toBeInTheDocument();
  });

  it("displays singular result count when total is 1", () => {
    renderWithProviders(
      <CategoryHeader
        label="Special Event"
        count={1}
        total={1}
        isLoading={false}
      />
    );

    expect(screen.getByText("(1 result)")).toBeInTheDocument();
  });

  it("displays (0 results) only when search genuinely returns 0 results", () => {
    renderWithProviders(
      <CategoryHeader
        label="Remote Desert"
        count={0}
        total={0}
        isLoading={false}
      />
    );

    expect(screen.getByText("(0 results)")).toBeInTheDocument();
  });

  it("displays (0 results) when count is 0 and total is undefined, after loading completes", () => {
    renderWithProviders(
      <CategoryHeader
        label="Remote Desert"
        count={0}
        isLoading={false}
      />
    );

    expect(screen.getByText("(0 results)")).toBeInTheDocument();
  });

  it("displays (N+ results) when loaded items count is available without total", () => {
    renderWithProviders(
      <CategoryHeader
        label="Adventures"
        count={16}
        isLoading={false}
      />
    );

    expect(screen.getByText("(16+ results)")).toBeInTheDocument();
  });

  it("renders breadcrumb and label properly", () => {
    renderWithProviders(
      <CategoryHeader
        label="Food & Drinks"
        count={5}
        isLoading={false}
      />
    );

    expect(screen.getByRole("link", { name: "Home page" })).toBeInTheDocument();
    expect(screen.getByText("Food & Drinks", { selector: "span" })).toBeInTheDocument();
  });

  it("shows the page's filter controls under the heading", () => {
    renderWithProviders(<CategoryHeader label="Street life" count={3} filters={<button type="button">Price</button>} />);
    expect(screen.getByRole("button", { name: "Price" })).toBeInTheDocument();
    expect(screen.queryByText("Languages")).not.toBeInTheDocument();
  });
});
