import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CookiePreferencesDialog } from "./cookie-preferences-dialog";

describe("CookiePreferencesDialog", () => {
  const defaultProps = {
    open: true,
    preferences: {
      strictlyNecessary: true,
      preferences: true,
      analytics: false,
      personalisation: false,
    },
    onClose: vi.fn(),
    onToggle: vi.fn(),
    onAcceptAll: vi.fn(),
    onRejectNonEssential: vi.fn(),
    onSave: vi.fn(),
  };

  it("does not render when open is false", () => {
    const { container } = render(
      <CookiePreferencesDialog {...defaultProps} open={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title, categories, and actions when open", () => {
    render(<CookiePreferencesDialog {...defaultProps} />);

    expect(screen.getByRole("dialog", { name: "Cookie preferences" })).toBeInTheDocument();
    expect(screen.getByText("Strictly necessary")).toBeInTheDocument();
    expect(screen.getByText("Preferences")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("Personalisation")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Reject non-essential" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept all" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save preferences" })).toBeInTheDocument();
  });

  it("calls onToggle when a switch button is clicked", () => {
    render(<CookiePreferencesDialog {...defaultProps} />);

    const analyticsSwitch = screen.getByRole("switch", { name: "Analytics cookies" });
    fireEvent.click(analyticsSwitch);
    expect(defaultProps.onToggle).toHaveBeenCalledWith("analytics");
  });

  it("calls action callbacks on click", () => {
    render(<CookiePreferencesDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Accept all" }));
    expect(defaultProps.onAcceptAll).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Reject non-essential" }));
    expect(defaultProps.onRejectNonEssential).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Save preferences" }));
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it("closes when close button or Escape key is pressed", () => {
    render(<CookiePreferencesDialog {...defaultProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(defaultProps.onClose).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });
});
