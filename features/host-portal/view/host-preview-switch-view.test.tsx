import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HostPreviewSwitchView } from "./host-preview-switch-view";

describe("HostPreviewSwitchView", () => {
  it("shows which preview is on and switches", async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<HostPreviewSwitchView visible mode="full" onChange={onChange} />);

    expect(screen.getByRole("button", { name: "Filled" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Empty" })).toHaveAttribute("aria-pressed", "false");
    await user.click(screen.getByRole("button", { name: "Empty" }));
    expect(onChange).toHaveBeenCalledWith("empty");
  });

  it("is hidden when it isn't visible", () => {
    const { container } = renderWithProviders(<HostPreviewSwitchView visible={false} mode="empty" onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
