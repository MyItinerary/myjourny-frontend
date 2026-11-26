import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { DEFAULT_APPLICATION_DATA, VERIFICATION_TYPES } from "../model/guide-application.types";
import { GuideApplicationStep1, type GuideApplicationStep1Props } from "./guide-application-step1";

const RULES = ["Between 8 and 30 characters", "Include a number (1234) and one special character (#%!.^)", "Uppercase (ABC) and lowercase (abc) letters", "No blank spaces"];

const props = (over: Partial<GuideApplicationStep1Props> = {}): GuideApplicationStep1Props => ({
  formData: DEFAULT_APPLICATION_DATA,
  errors: {},
  verificationTypes: VERIFICATION_TYPES,
  passwordRules: RULES.map((label) => ({ label, met: false })),
  showPasswordErrors: false,
  signedInEmail: null,
  accountExists: false,
  checkingEmail: false,
  showPassword: false,
  onTogglePassword: vi.fn(),
  onLogIn: vi.fn(),
  setField: vi.fn(),
  setVerificationType: vi.fn(),
  onContinue: vi.fn(),
  onBack: vi.fn(),
  ...over,
});

describe("GuideApplicationStep1", () => {
  it("asks how they run their business, their names side by side, date of birth, phone, email and password", () => {
    renderWithProviders(<GuideApplicationStep1 {...props()} />);
    expect(screen.getByLabelText("How do you run your business?")).toHaveValue("individual");
    for (const label of ["First name", "Last name", "Date of birth", "Email address", "Password"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Phone number")).toHaveAttribute("type", "tel");
    expect(screen.getByText("+234")).toBeInTheDocument();
    expect(within(screen.getByRole("list", { name: "Password rules" })).getAllByRole("listitem")).toHaveLength(4);
  });

  it("switches to running it as a business", async () => {
    const p = props();
    const { user } = renderWithProviders(<GuideApplicationStep1 {...p} />);
    await user.selectOptions(screen.getByLabelText("How do you run your business?"), "business");
    expect(p.setVerificationType).toHaveBeenCalledWith("business");
  });

  it("leaves out email and password for someone signed in", () => {
    renderWithProviders(<GuideApplicationStep1 {...props({ signedInEmail: "amara@example.com" })} />);
    expect(screen.queryByLabelText("Email address")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("shows each mistake under its field, tied to it for screen readers", () => {
    renderWithProviders(<GuideApplicationStep1 {...props({ errors: { firstName: "Enter your first name", phoneNumber: "Enter a valid phone number" } })} />);
    expect(screen.getByLabelText("First name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("First name")).toHaveAccessibleDescription("Enter your first name");
    expect(screen.getByLabelText("Phone number")).toHaveAccessibleDescription("Enter a valid phone number");
  });

  it("ticks the rules that are met, and marks the rest once they've tried to continue", () => {
    renderWithProviders(
      <GuideApplicationStep1 {...props({ showPasswordErrors: true, passwordRules: RULES.map((label, i) => ({ label, met: i === 0 })) })} />,
    );
    expect(screen.getByText(RULES[0])).toHaveClass("text-[#333134]");
    expect(screen.getByText(RULES[1])).toHaveClass("text-[#DC2626]");
  });

  it("continues and goes back", async () => {
    const p = props();
    const { user } = renderWithProviders(<GuideApplicationStep1 {...p} />);
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(p.onContinue).toHaveBeenCalled();
    expect(p.onBack).toHaveBeenCalled();
  });

  it("has a placeholder in each field", () => {
    renderWithProviders(<GuideApplicationStep1 {...props()} />);
    expect(screen.getByLabelText("First name")).toHaveAttribute("placeholder", "Samuel");
    expect(screen.getByLabelText("Last name")).toHaveAttribute("placeholder", "Okafor");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("placeholder", "name@example.com");
    expect(screen.getByLabelText("Date of birth")).toHaveAttribute("placeholder", "DD/MM/YYYY");
  });

  it("shows and hides the password with the eye button", async () => {
    const p = props();
    const { user, rerender } = renderWithProviders(<GuideApplicationStep1 {...p} />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(p.onTogglePassword).toHaveBeenCalled();
    rerender(<GuideApplicationStep1 {...p} showPassword />);
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();
  });

  it("sends someone whose email already has an account to log in", async () => {
    const p = props({ accountExists: true });
    const { user } = renderWithProviders(<GuideApplicationStep1 {...p} />);
    expect(screen.getByRole("alert")).toHaveTextContent("There's already an account with this email");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(p.onLogIn).toHaveBeenCalled();
  });

  it("says it's checking the email while it does", () => {
    renderWithProviders(<GuideApplicationStep1 {...props({ checkingEmail: true })} />);
    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();
  });
});
