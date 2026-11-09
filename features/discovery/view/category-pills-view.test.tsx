import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { CategoryPillsView } from "./category-pills-view";

const categories = (count: number) => Array.from({ length: count }, (_, i) => ({ id: `cat-${i + 1}`, label: `Category ${i + 1}` }));

describe("CategoryPillsView", () => {
  it("links each pill under the given base", () => {
    renderWithProviders(<CategoryPillsView categories={categories(3)} hrefBase="/events/categories" />);

    expect(screen.getByRole("heading", { name: "Discover by categories" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Category 2" })).toHaveAttribute("href", "/events/categories/cat-2");
    expect(screen.queryByRole("button", { name: "See more" })).not.toBeInTheDocument();
  });

  it("shows seven pills, and the rest on 'See more'", async () => {
    const { user } = renderWithProviders(<CategoryPillsView categories={categories(10)} hrefBase="/categories" />);

    expect(screen.getAllByRole("link")).toHaveLength(7);
    await user.click(screen.getByRole("button", { name: "See more" }));
    expect(screen.getAllByRole("link")).toHaveLength(10);
    await user.click(screen.getByRole("button", { name: "See less" }));
    expect(screen.getAllByRole("link")).toHaveLength(7);
  });

  it("shows as many pills as asked for before 'See more'", () => {
    renderWithProviders(<CategoryPillsView categories={categories(12)} hrefBase="/c" visibleCount={9} />);
    expect(screen.getAllByRole("link")).toHaveLength(9);
  });

  it("shows a category's icon when it has one", () => {
    const { container } = renderWithProviders(
      <CategoryPillsView categories={[{ id: "a", label: "A", iconSrc: "/images/discovery/local-food-drinks.png" }]} hrefBase="/c" />,
    );
    expect(container.querySelector("img")).not.toBeNull();
  });

  it("renders nothing without categories", () => {
    renderWithProviders(<CategoryPillsView categories={[]} hrefBase="/categories" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
