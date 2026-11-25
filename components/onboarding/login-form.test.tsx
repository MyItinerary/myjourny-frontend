import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/utils/render";

import { LoginForm } from "./login-form";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("@/components/onboarding/google-auth-button", () => ({ GoogleAuthButton: () => null }));
const loader = vi.hoisted(() => ({ start: vi.fn(), stop: vi.fn() }));
vi.mock("@/features/sign-in-loader", () => ({ startSignInLoader: loader.start, stopSignInLoader: loader.stop }));

afterEach(() => vi.clearAllMocks());

async function submit() {
  const view = renderWithProviders(<LoginForm />);
  await view.user.type(screen.getByPlaceholderText("Enter email address"), "amara@example.com");
  await view.user.type(screen.getByPlaceholderText("Enter password"), "correct-horse-battery");
  await view.user.click(screen.getByRole("button", { name: "Continue" }));
  return view;
}

describe("LoginForm", () => {
  it("never shows the full-screen loader for a wrong password, only the error", async () => {
    server.use(http.post(apiUrl("/auth/login"), () => HttpResponse.json({ detail: "Incorrect email or password" }, { status: 400 })));
    await submit();

    await waitFor(() => expect(screen.getByRole("button", { name: "Continue" })).toBeEnabled());
    expect(loader.start).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("covers the screen once the details are accepted, then goes on", async () => {
    server.use(
      http.post(apiUrl("/auth/login"), () => HttpResponse.json({ access_token: "a", refresh_token: "r", token_type: "bearer" })),
      http.get(apiUrl("/auth/me"), () =>
        HttpResponse.json({ id: "user-1", email: "amara@example.com", full_name: "Amara", avatar_url: null, completed: true }),
      ),
    );
    await submit();

    await waitFor(() => expect(push).toHaveBeenCalledWith("/"));
    expect(loader.start).toHaveBeenCalledOnce();
  });

  it("asks for a two-factor code without the loader", async () => {
    server.use(http.post(apiUrl("/auth/login"), () => HttpResponse.json({ "2fa_required": true })));
    await submit();

    expect(await screen.findByLabelText("Two-factor code")).toBeInTheDocument();
    expect(loader.start).not.toHaveBeenCalled();
  });
});
