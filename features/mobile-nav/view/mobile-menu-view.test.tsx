import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { MobileMenuViewModel } from "../view-model/use-mobile-menu-view-model";
import { MobileMenuView } from "./mobile-menu-view";

const vm: MobileMenuViewModel = {
  hostingHref: "/host/dashboard",
  links: [
    { id: "my-experiences", label: "My experiences", icon: "/icons/nav/experiences.png", href: "/my-experiences" },
    { id: "language", label: "Language and Currency", sublabel: "English/USD", icon: "/icons/nav/language.png", href: "#" },
  ],
  guide: {
    id: "guide",
    label: "Become a guide",
    sublabel: "Make extra income from what you already love doing",
    icon: "/icons/nav/become-guide.png",
    href: "/become-a-guide",
  },
  auth: { label: "Logout", icon: "/icons/nav/logout.png" },
  onClose: vi.fn(),
  onAuth: vi.fn(),
};

describe("MobileMenuView", () => {
  it("shows the logo, the menu links and the guide invite", () => {
    renderWithProviders(<MobileMenuView {...vm} />);

    expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "MyJourny home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "My experiences" })).toHaveAttribute("href", "/my-experiences");
    expect(screen.getByText("English/USD")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Become a guide/ })).toHaveAttribute("href", "/become-a-guide");
  });

  it("opens the host dashboard from Switch to hosting", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<MobileMenuView {...vm} onClose={onClose} />);

    const link = screen.getByRole("link", { name: "Switch to hosting" });
    expect(link).toHaveAttribute("href", "/host/dashboard");
    await user.click(link);
    expect(onClose).toHaveBeenCalled();
  });

  it("leaves Switch to hosting out for guests", () => {
    renderWithProviders(<MobileMenuView {...vm} hostingHref={null} auth={{ label: "Login or create account", icon: "/icons/nav/login.png" }} />);

    expect(screen.queryByRole("link", { name: "Switch to hosting" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login or create account" })).toBeInTheDocument();
  });

  it("leaves the guide invite out for hosts", () => {
    renderWithProviders(<MobileMenuView {...vm} guide={null} />);

    expect(screen.queryByText("Become a guide")).not.toBeInTheDocument();
  });

  it("closes from the X and runs the auth action from the last row", async () => {
    const onClose = vi.fn();
    const onAuth = vi.fn();
    const { user } = renderWithProviders(<MobileMenuView {...vm} onClose={onClose} onAuth={onAuth} />);

    await user.click(screen.getByRole("button", { name: "Close menu" }));
    expect(onClose).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Logout" }));
    expect(onAuth).toHaveBeenCalledOnce();
  });
});
