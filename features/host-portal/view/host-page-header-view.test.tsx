import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { HostPageHeaderView } from "./host-page-header-view";

describe("HostPageHeaderView", () => {
  it("shows the title, subtitle and actions", () => {
    renderWithProviders(
      <HostPageHeaderView
        title="Good afternoon, Tunde"
        subtitle="Saturday 19 September"
        actions={[
          { label: "Start a new listing", href: "/host/dashboard/listings/new", primary: true },
          { label: "Download statement", href: "/host/dashboard/earnings", primary: false },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Good afternoon, Tunde" })).toBeInTheDocument();
    expect(screen.getByText("Saturday 19 September")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start a new listing" })).toHaveAttribute("href", "/host/dashboard/listings/new");
    expect(screen.getByRole("link", { name: "Start a new listing" })).toHaveClass("bg-[#F5032D]");
    expect(screen.getByRole("link", { name: "Download statement" })).not.toHaveClass("bg-[#F5032D]");
  });

  it("makes an action with a handler a button", async () => {
    const onClick = vi.fn();
    const { user } = renderWithProviders(
      <HostPageHeaderView title="Calendar" subtitle="" actions={[{ label: "Block dates", onClick, primary: false }]} />,
    );

    await user.click(screen.getByRole("button", { name: "Block dates" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.queryByRole("link", { name: "Block dates" })).not.toBeInTheDocument();
  });

  it("puts a chip beside the title when there is one", () => {
    renderWithProviders(<HostPageHeaderView title="Your profile" chip="Live" subtitle="" actions={[]} />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("leaves out an empty subtitle", () => {
    const { container } = renderWithProviders(<HostPageHeaderView title="Calendar" subtitle="" actions={[]} />);
    expect(container.querySelector("header p")).toBeNull();
  });
});
