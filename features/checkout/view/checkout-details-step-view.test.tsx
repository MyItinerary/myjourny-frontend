import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutViewModel } from "../view-model/use-checkout-view-model";
import { CheckoutDetailsStepView } from "./checkout-details-step-view";

vi.mock("@/components/onboarding/google-auth-button", () => ({
  GoogleAuthButton: () => <button type="button">Continue with Google</button>,
}));

const form = (overrides: Partial<CheckoutViewModel["form"]> = {}): CheckoutViewModel["form"] => ({
  step: "details",
  email: "",
  onEmailChange: vi.fn(),
  emailLocked: false,
  phone: "",
  onPhoneChange: vi.fn(),
  phoneLocked: false,
  password: "",
  onPasswordChange: vi.fn(),
  confirmPassword: "",
  onConfirmPasswordChange: vi.fn(),
  passwordError: null,
  emailTaken: false,
  loginHref: "/login?next=%2Fcheckout",
  canContinue: false,
  onContinue: vi.fn(),
  canPay: false,
  pending: false,
  onConfirm: vi.fn(),
  onGoogleCredential: vi.fn(),
  googleLoading: false,
  ...overrides,
});

describe("CheckoutDetailsStepView", () => {
  it("first asks for email and phone, with Continue and Google", () => {
    renderWithProviders(<CheckoutDetailsStepView form={form()} />);

    expect(screen.getByRole("heading", { name: "Confirm your details and pay" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(screen.getByText("Continue with Google")).toBeInTheDocument();
    expect(screen.queryByText("Password")).not.toBeInTheDocument();
    expect(screen.getByText(/By continuing you agree/)).toBeInTheDocument();
  });

  it("passes the typed email and phone up and continues", async () => {
    const props = form({ canContinue: true, email: "juliet@example.com", phone: "7016377711" });
    const { user } = renderWithProviders(<CheckoutDetailsStepView form={props} />);

    await user.type(screen.getByPlaceholderText("Enter email address"), "x");
    await user.type(screen.getByLabelText("Phone number"), "1");
    expect(props.onEmailChange).toHaveBeenCalled();
    expect(props.onPhoneChange).toHaveBeenCalled();
    expect(screen.getByLabelText("Valid email")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(props.onContinue).toHaveBeenCalled();
  });

  it("then asks for a password, and pays on submit", async () => {
    const props = form({
      step: "password",
      emailLocked: true,
      phoneLocked: true,
      email: "juliet@example.com",
      phone: "7016377711",
      canPay: true,
    });
    const { user } = renderWithProviders(<CheckoutDetailsStepView form={props} />);

    expect(screen.getByPlaceholderText("Enter email address")).toHaveAttribute("readonly");
    expect(screen.queryByRole("button", { name: "Continue" })).not.toBeInTheDocument();
    expect(screen.getByText("Your password should contain at least 8 characters, a letter and a number")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Enter password here"), "a");
    await user.type(screen.getByPlaceholderText("Re enter password here"), "a");
    expect(props.onPasswordChange).toHaveBeenCalled();
    expect(props.onConfirmPasswordChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Confirm and pay" }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("shows password problems and the log-in offer", () => {
    renderWithProviders(
      <CheckoutDetailsStepView form={form({ step: "password", passwordError: "The passwords don't match", emailTaken: true })} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("The passwords don't match");
    expect(screen.getByText("Log in instead").closest("a")).toHaveAttribute("href", "/login?next=%2Fcheckout");
  });

  it("asks only for the phone once signed in", async () => {
    const props = form({ step: "pay", emailLocked: true, email: "juliet@example.com", canPay: true });
    const { user } = renderWithProviders(<CheckoutDetailsStepView form={props} />);

    expect(screen.queryByPlaceholderText("Enter password here")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirm and pay" }));
    expect(props.onConfirm).toHaveBeenCalled();
  });

  it("shows progress while starting checkout", () => {
    renderWithProviders(<CheckoutDetailsStepView form={form({ step: "pay", pending: true })} />);
    expect(screen.getByRole("button", { name: "Starting checkout…" })).toBeInTheDocument();
  });
});
