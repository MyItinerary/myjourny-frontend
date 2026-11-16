import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { PreviewBannerView } from "./preview-banner-view";

describe("PreviewBannerView", () => {
  it("says it's a preview of a listing that isn't live, and closes", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<PreviewBannerView status="Not live" onClose={onClose} />);

    expect(screen.getByRole("status")).toHaveTextContent("Preview · Not live");
    expect(screen.getByRole("status")).toHaveTextContent("this is how travellers will see it");
    await user.click(screen.getByRole("button", { name: "Close preview" }));
    expect(onClose).toHaveBeenCalled();
  });
});
