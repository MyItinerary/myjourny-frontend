import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HostSetupCardView } from "./host-setup-card-view";

const SETUP = {
  heading: "Finish setting up",
  count: "1 of 3 done",
  percent: 33,
  note: "We review every host before their experiences go live.",
  tasks: [
    { title: "Verify your account", body: "Your NIN and a selfie.", done: false, href: "/host/dashboard/profile?pane=verify" },
    { title: "Fill in your profile details", body: "A photo and a few lines.", done: true, href: "/host/dashboard/profile?pane=public" },
    { title: "Add your bank details", body: "Nigerian bank account.", done: false, href: "/host/dashboard/profile?pane=payouts" },
  ],
};

describe("HostSetupCardView", () => {
  it("shows how far along the host is and why it matters", () => {
    const { container } = renderWithProviders(<HostSetupCardView setup={SETUP} />);

    expect(screen.getByRole("heading", { name: "Finish setting up" })).toBeInTheDocument();
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    expect(screen.getByText(SETUP.note)).toBeInTheDocument();
    expect((container.querySelector(".bg-\\[\\#F5032D\\]") as HTMLElement).style.width).toBe("33%");
  });

  it("links each step to the right part of the profile, ticking the ones done", () => {
    renderWithProviders(<HostSetupCardView setup={SETUP} />);

    expect(screen.getByRole("link", { name: /Verify your account/ })).toHaveAttribute("href", "/host/dashboard/profile?pane=verify");
    expect(screen.getByRole("link", { name: /Add your bank details/ })).toHaveAttribute("href", "/host/dashboard/profile?pane=payouts");
    expect(screen.getByRole("link", { name: /Fill in your profile details/ })).toHaveTextContent("✓");
    expect(screen.getByRole("link", { name: /Verify your account/ })).not.toHaveTextContent("✓");
  });
});
