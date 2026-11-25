import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { LaunchScreenView } from "./launch-screen-view";

describe("LaunchScreenView", () => {
  it("is in the page from the start with the logo, shown only in the installed app by CSS", () => {
    renderWithProviders(<LaunchScreenView ready={false} />);
    const launch = screen.getByTestId("launch-screen");

    // Hidden by default; globals.css shows .launch-screen under (display-mode: standalone).
    expect(launch).toHaveClass("launch-screen", "hidden");
    expect(launch).toHaveAttribute("data-ready", "false");
    expect(launch).toHaveAttribute("aria-hidden", "true");
    expect(launch.querySelector("img")).toHaveAttribute("src", "/logo/myjourny-logo.svg");
  });

  it("fades away once the first page is ready", () => {
    renderWithProviders(<LaunchScreenView ready />);
    expect(screen.getByTestId("launch-screen")).toHaveAttribute("data-ready", "true");
  });
});
