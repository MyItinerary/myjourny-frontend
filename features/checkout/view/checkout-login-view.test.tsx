import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { CheckoutLogin } from "../view-model/use-checkout-view-model";
import { CheckoutLoginView } from "./checkout-login-view";

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

const login = (overrides: Partial<CheckoutLogin> = {}): CheckoutLogin => ({
  open: true,
  onOpenChange: vi.fn(),
  email: "juliet@example.com",
  onEmailChange: vi.fn(),
  password: "",
  onPasswordChange: vi.fn(),
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
  ["mobile bottom sheet", false],
])("CheckoutLoginView, %s", (_name, desktop) => {
  it("welcomes them back with Google, email and password", () => {
    viewport(desktop);
    renderWithProviders(<CheckoutLoginView login={login()} />);

    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByText("Pick up where you left off.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveValue("juliet@example.com");
    expect(screen.getByText("Forgot password?").closest("a")).toHaveAttribute("href", "/login/forgot-password");
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("notes where to come back to when they head off to reset their password", async () => {
    viewport(desktop);
    const props = login();
    const { user } = renderWithProviders(<CheckoutLoginView login={props} />);

    await user.click(screen.getByText("Forgot password?"));

    expect(props.onForgotPassword).toHaveBeenCalled();
  });

  it("sends the password up and logs in on submit", async () => {
    viewport(desktop);
    const props = login({ canSubmit: true });
    const { user } = renderWithProviders(<CheckoutLoginView login={props} />);

    await user.type(screen.getByPlaceholderText("Enter password"), "x");
    await user.type(screen.getByLabelText("Email address"), "y");
    expect(props.onPasswordChange).toHaveBeenCalled();
    expect(props.onEmailChange).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(props.onSubmit).toHaveBeenCalled();
  });

  it("logs in with Google", async () => {
    viewport(desktop);
    const props = login();
    const { user } = renderWithProviders(<CheckoutLoginView login={props} />);

    await user.click(screen.getByRole("button", { name: "Continue with Google" }));

    expect(props.onGoogleCredential).toHaveBeenCalledWith("cred");
  });

  it("shows progress while logging in", () => {
    viewport(desktop);
    renderWithProviders(<CheckoutLoginView login={login({ pending: true })} />);
    expect(screen.getByRole("button", { name: "Logging in…" })).toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    viewport(desktop);
    renderWithProviders(<CheckoutLoginView login={login({ open: false })} />);
    expect(screen.queryByText("Welcome back!")).not.toBeInTheDocument();
  });
});

describe("CheckoutLoginView on desktop", () => {
  it("can be closed with the X", async () => {
    viewport(true);
    const props = login();
    const { user } = renderWithProviders(<CheckoutLoginView login={props} />);

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(props.onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
