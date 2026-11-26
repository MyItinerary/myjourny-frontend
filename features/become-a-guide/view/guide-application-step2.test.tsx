import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { COUNTRIES, DEFAULT_APPLICATION_DATA, } from "../model/guide-application.types";
import { GuideApplicationStep2, type GuideApplicationStep2Props } from "./guide-application-step2";

const props = (over: Partial<GuideApplicationStep2Props> = {}): GuideApplicationStep2Props => ({
  formData: DEFAULT_APPLICATION_DATA,
  errors: {},
  isSubmitting: false,
  countries: COUNTRIES,
  applyingEmail: "samuels@gmail.com",
  accountExists: false,
  setField: vi.fn(),
  onContinue: vi.fn(),
  onBack: vi.fn(),
  onLogIn: vi.fn(),
  ...over,
});

describe("GuideApplicationStep2", () => {
  it("asks an individual for an optional brand name, a website and where they're registered", () => {
    renderWithProviders(<GuideApplicationStep2 {...props()} />);
    expect(screen.getByLabelText("Brand name (optional)")).toHaveAttribute("placeholder", "Samuel Tours");
    expect(screen.queryByLabelText("CAC registration number")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Website (optional)")).toBeInTheDocument();
    expect(screen.getByLabelText("Where are you registered?")).toHaveValue("");
    expect(screen.getByText("samuels@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "terms of service" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "privacy policy" })).toHaveAttribute("href", "/privacy");
  });

  it("asks a business for its brand name as on the CAC certificate, and the CAC number in capitals", async () => {
    const p = props({ formData: { ...DEFAULT_APPLICATION_DATA, verificationType: "business" } });
    const { user } = renderWithProviders(<GuideApplicationStep2 {...p} />);
    expect(screen.getByLabelText("Company's brand name")).toBeInTheDocument();
    expect(screen.getByText("As it appears on your CAC certificate.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("CAC registration number"), "r");
    expect(p.setField).toHaveBeenCalledWith("cacNumber", "R");
  });

  it("shows mistakes under their fields", () => {
    renderWithProviders(<GuideApplicationStep2 {...props({ errors: { country: "Choose where you're registered", website: "Enter a web address, like samuel.com" } })} />);
    expect(screen.getByLabelText("Where are you registered?")).toHaveAccessibleDescription("Choose where you're registered");
    expect(screen.getByLabelText("Website (optional)")).toHaveAccessibleDescription(/Enter a web address/);
  });

  it("submits, and says so while it sends", async () => {
    const p = props();
    const { user, rerender } = renderWithProviders(<GuideApplicationStep2 {...p} />);
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(p.onContinue).toHaveBeenCalled();
    rerender(<GuideApplicationStep2 {...p} isSubmitting />);
    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();
  });

  it("says when the email already has an account, and offers to log in", async () => {
    const p = props({ accountExists: true });
    const { user } = renderWithProviders(<GuideApplicationStep2 {...p} />);
    expect(screen.getByRole("alert")).toHaveTextContent("There's already an account with samuels@gmail.com");
    await user.click(screen.getByRole("button", { name: "Log in to continue" }));
    expect(p.onLogIn).toHaveBeenCalled();
  });
});
