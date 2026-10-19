import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutAuth } from "../view-model/use-checkout-view-model";
import { CheckoutAuthView } from "./checkout-auth-view";

vi.mock("@/components/onboarding/google-auth-button", () => ({
  GoogleAuthButton: ({ onCredential }: { onCredential: (credential: string) => void }) => (
    <button type="button" onClick={() => onCredential("cred")}>
      Continue with Google
    </button>
  ),
}));

afterEach(() => vi.unstubAllGlobals());

function viewport(desktop: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: desktop,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

const auth = (overrides: Partial<CheckoutAuth> = {}): CheckoutAuth => ({
  open: true,
  onOpenChange: vi.fn(),
  stage: "email",
  onBack: vi.fn(),
  email: "juliet@example.com",
  onEmailChange: vi.fn(),
  canContinue: true,
  checking: false,
  onContinue: vi.fn(async () => {}),
  password: "",
  onPasswordChange: vi.fn(),
  confirmPassword: "",
  onConfirmPasswordChange: vi.fn(),
  passwordError: null,
  code: "",
  onCodeChange: vi.fn(),
  canSubmit: false,
  pending: false,
  onSubmit: vi.fn(),
  onGoogleCredential: vi.fn(),
  googleLoading: false,
  forgotHref: "/login/forgot-password",
  onForgotPassword: vi.fn(),
  ...overrides,
});

describe.each([
  ["desktop dialog", true],
  ["phone bottom sheet", false],
])("CheckoutAuthView, %s", (_name, desktop) => {
  it("starts with the email, Google and the terms", async () => {
    viewport(desktop);
    const props = auth();
    const { user } = renderWithProviders(<CheckoutAuthView auth={props} />);

    expect(screen.getByText("Log in or sign up")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("juliet@example.com");
    expect(screen.getByText("terms of service")).toBeInTheDocument();
    expect(screen.queryByLabelText("Back")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(props.onContinue).toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Continue with Google" }));
    expect(props.onGoogleCredential).toHaveBeenCalledWith("cred");
  });

  it("asks an existing account for its password, with a way to reset it and go back", async () => {
    viewport(desktop);
    const props = auth({ stage: "login", password: "secret123", canSubmit: true });
    const { user } = renderWithProviders(<CheckoutAuthView auth={props} />);

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByText("juliet@example.com")).toBeInTheDocument();
    expect(screen.getByText("Forgot password?").closest("a")).toHaveAttribute("href", "/login/forgot-password");

    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(props.onSubmit).toHaveBeenCalled();
    await user.click(screen.getByLabelText("Back"));
    expect(props.onBack).toHaveBeenCalled();
  });

  it("asks a new email to create a password and explains the rule or the problem", () => {
    viewport(desktop);
    const { rerender } = renderWithProviders(<CheckoutAuthView auth={auth({ stage: "signup" })} />);

    expect(screen.getByText("Create a password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re enter password here")).toBeInTheDocument();
    expect(screen.getByText("At least 8 characters, with a letter and a number.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agree and continue" })).toBeDisabled();

    rerender(<CheckoutAuthView auth={auth({ stage: "signup", passwordError: "The passwords don't match" })} />);
    expect(screen.getByRole("alert")).toHaveTextContent("The passwords don't match");
  });

  it("points a Google-only account to Google", () => {
    viewport(desktop);
    renderWithProviders(<CheckoutAuthView auth={auth({ stage: "google" })} />);

    expect(screen.getByText("This email signs in with Google.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue with Google" })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Enter password")).not.toBeInTheDocument();
  });

  it("asks for the two-factor code", async () => {
    viewport(desktop);
    const props = auth({ stage: "code" });
    const { user } = renderWithProviders(<CheckoutAuthView auth={props} />);

    expect(screen.getByText("Enter your code")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Two-factor code"), "1");
    expect(props.onCodeChange).toHaveBeenCalledWith("1");
  });

  it("shows progress while working", () => {
    viewport(desktop);
    const { rerender } = renderWithProviders(<CheckoutAuthView auth={auth({ checking: true, canContinue: false })} />);
    expect(screen.getByRole("button", { name: "Checking…" })).toBeDisabled();

    rerender(<CheckoutAuthView auth={auth({ stage: "signup", pending: true })} />);
    expect(screen.getByRole("button", { name: "Creating your account…" })).toBeInTheDocument();
  });
});
