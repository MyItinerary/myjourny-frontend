import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CookiePreferencesCard } from "./cookie-preferences-card";

describe("CookiePreferencesCard", () => {
  it("renders label and button text", () => {
    render(
      <CookiePreferencesCard
        label="See or change what you've agreed to."
        buttonText="Manage cookie preferences"
      />
    );

    expect(screen.getByText("See or change what you've agreed to.")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Manage cookie preferences" })
    ).toBeInTheDocument();
  });

  it("calls onClick when button is clicked", () => {
    const handleClick = vi.fn();
    render(
      <CookiePreferencesCard
        label="Preferences"
        buttonText="Manage"
        onClick={handleClick}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Manage" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
