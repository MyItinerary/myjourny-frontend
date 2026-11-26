import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HostBuilderPhotoTipsView } from "./host-builder-photo-tips-view";

describe("HostBuilderPhotoTipsView", () => {
  it("gives tips, then what to do and what not to do, with our limits", () => {
    render(<HostBuilderPhotoTipsView />);
    const tips = screen.getByRole("complementary", { name: "Photo tips" });
    expect(within(tips).getByText(/Put your best photo first/)).toBeInTheDocument();
    expect(within(within(tips).getByRole("list", { name: "Do" })).getByText("Up to 10 MB each")).toBeInTheDocument();
    expect(within(within(tips).getByRole("list", { name: "Do" })).getByText("At least 1200 pixels wide")).toBeInTheDocument();
    expect(within(within(tips).getByRole("list", { name: "Don't" })).getByText("Watermarks or logos")).toBeInTheDocument();
  });
});
