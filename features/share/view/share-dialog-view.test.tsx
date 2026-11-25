import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { ShareDialogViewModel } from "../view-model/use-share-dialog-view-model";
import { ShareDialogView } from "./share-dialog-view";

const url = "https://myjourny.com/experiences/abc?ref=DANIEL10";

function vm(overrides: Partial<ShareDialogViewModel> = {}): ShareDialogViewModel {
  return {
    open: true,
    onOpen: vi.fn(),
    onClose: vi.fn(),
    title: "Sunrise Kayaking",
    imageUrl: null,
    message: "Daniel invited you to try Sunrise Kayaking",
    url,
    hasReferral: true,
    copied: false,
    onCopy: vi.fn(),
    targets: [
      { id: "email", label: "Email", href: "mailto:?subject=x" },
      { id: "messages", label: "Messages", href: "sms:?&body=x" },
      { id: "whatsapp", label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(url)}` },
      { id: "messenger", label: "Messenger", href: "fb-messenger://share/?link=x" },
      { id: "facebook", label: "Facebook", href: "https://www.facebook.com/sharer/sharer.php?u=x" },
      { id: "twitter", label: "Twitter", href: "https://twitter.com/intent/tweet?text=x" },
    ],
    onMoreOptions: vi.fn(),
    ...overrides,
  };
}

describe("ShareDialogView", () => {
  it("shows nothing while closed", () => {
    renderWithProviders(<ShareDialogView {...vm({ open: false })} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the listing, the invite and every way to share", () => {
    renderWithProviders(<ShareDialogView {...vm()} />);
    expect(screen.getByRole("dialog", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Share Sunrise Kayaking" })).toBeInTheDocument();
    expect(screen.getByText("Daniel invited you to try Sunrise Kayaking")).toBeInTheDocument();
    expect(screen.getByText("Your referral code is included in this link.")).toBeInTheDocument();
    for (const name of ["Copy link", "Email", "Messages", "WhatsApp", "Messenger", "Facebook", "Twitter", "More options"]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      expect.stringContaining(encodeURIComponent(url)),
    );
  });

  it("does not mention a referral when the link has none", () => {
    renderWithProviders(<ShareDialogView {...vm({ hasReferral: false })} />);
    expect(screen.queryByText(/referral code/)).not.toBeInTheDocument();
  });

  it("copies the link, and says so once it has", async () => {
    const view = vm();
    const { user, rerender } = renderWithProviders(<ShareDialogView {...view} />);
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(view.onCopy).toHaveBeenCalled();
    rerender(<ShareDialogView {...vm({ copied: true })} />);
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("opens the device's share sheet from More options", async () => {
    const view = vm();
    const { user } = renderWithProviders(<ShareDialogView {...view} />);
    await user.click(screen.getByRole("button", { name: "More options" }));
    expect(view.onMoreOptions).toHaveBeenCalled();
  });

  it("closes from the X, the backdrop and Escape", async () => {
    const view = vm();
    const { user, container } = renderWithProviders(<ShareDialogView {...view} />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.keyboard("{Escape}");
    expect(view.onClose).toHaveBeenCalledTimes(2);
    const backdrop = container.firstElementChild as HTMLElement;
    backdrop.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(view.onClose).toHaveBeenCalledTimes(3);
  });
});
