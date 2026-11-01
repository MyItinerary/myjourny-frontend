import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HomeCitiesView } from "./home-cities-view";

const cities = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `city-${i + 1}`,
    name: `City ${i + 1}`,
    country: "Nigeria",
    imageSrc: "/images/home/cities/lagos.jpg",
  }));

describe("HomeCitiesView", () => {
  it("links each city tile to its page", () => {
    renderWithProviders(<HomeCitiesView cities={cities(3)} />);

    expect(screen.getByRole("heading", { name: "Discover by cities" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "City 2" })).toHaveAttribute("href", "/cities/city-2");
    expect(screen.queryByRole("button", { name: /see more/i })).not.toBeInTheDocument();
  });

  it("shows two rows of five, and the rest on 'See more'", async () => {
    const { user } = renderWithProviders(<HomeCitiesView cities={cities(12)} />);

    expect(screen.getAllByRole("link")).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: /see more/i }));
    expect(screen.getAllByRole("link")).toHaveLength(12);
    await user.click(screen.getByRole("button", { name: /see less/i }));
    expect(screen.getAllByRole("link")).toHaveLength(10);
  });
});
