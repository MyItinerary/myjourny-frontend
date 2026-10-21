import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";
import { FilterChip } from "./filter-chip";

describe("FilterChip", () => {
  it("renders label and button properly", () => {
    renderWithProviders(<FilterChip label="Price" />);

    expect(screen.getByRole("button", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
  });
});
