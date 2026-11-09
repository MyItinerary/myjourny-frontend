import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Carousel } from "@/components/ui/carousel";
import { renderWithProviders } from "@/test/utils/render";

import { RailHeaderView } from "./rail-header-view";

describe("RailHeaderView", () => {
  it("shows the heading with previous and next arrows", () => {
    renderWithProviders(
      <Carousel>
        <RailHeaderView heading="This weekend" />
      </Carousel>,
    );
    expect(screen.getByRole("heading", { name: "This weekend" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
