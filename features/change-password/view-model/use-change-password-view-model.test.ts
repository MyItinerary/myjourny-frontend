import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useChangePasswordViewModel } from "./use-change-password-view-model";

const setTokens = vi.fn();
vi.mock("@/lib/auth/session-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session-store")>()),
  setTokens: (...args: unknown[]) => setTokens(...args),
}));

function stubApi(status = 200, body: Record<string, unknown> = { message: "Password updated successfully" }) {
  const sent: unknown[] = [];
  server.use(
    http.post(apiUrl("/auth/password/change"), async ({ request }) => {
      sent.push(await request.json());
      return HttpResponse.json(body, { status });
    }),
  );
  return sent;
}

const onClose = vi.fn();
const onChanged = vi.fn();

function setup() {
  return renderHookWithProviders(() => useChangePasswordViewModel({ open: true, onClose, onChanged }));
}

type Hook = ReturnType<typeof setup>["result"];

function fill(result: Hook, current: string, next: string, confirm: string) {
  act(() => {
    result.current.onChange("current", current);
    result.current.onChange("next", next);
    result.current.onChange("confirm", confirm);
  });
}

afterEach(() => vi.clearAllMocks());

describe("useChangePasswordViewModel", () => {
  it("keeps Save off until all three fields are filled", () => {
    const { result } = setup();
    expect(result.current.canSave).toBe(false);
    fill(result, "OldPassword123!", "NewPassword123!", "");
    expect(result.current.canSave).toBe(false);
    fill(result, "OldPassword123!", "NewPassword123!", "x");
    expect(result.current.canSave).toBe(true);
  });

  it("shows a field's problem once the person leaves it, not while they type", () => {
    const { result } = setup();
    fill(result, "OldPassword123!", "short", "different");
    expect(result.current.errors).toEqual({});

    act(() => result.current.onBlur("next"));
    expect(result.current.errors).toEqual({ next: "Use at least 10 characters." });

    act(() => result.current.onBlur("confirm"));
    expect(result.current.errors.confirm).toBe("The passwords don't match.");

    fill(result, "OldPassword123!", "NewPassword123!", "NewPassword123!");
    expect(result.current.errors).toEqual({});
  });

  it("explains what is wrong on Save and sends nothing", () => {
    const sent = stubApi();
    const { result } = setup();
    fill(result, "OldPassword123!", "NewPassword123!", "NewPassword124!");

    act(() => result.current.onSave());

    expect(result.current.errors.confirm).toBe("The passwords don't match.");
    expect(sent).toHaveLength(0);
    expect(onChanged).not.toHaveBeenCalled();
  });

  it("shows a wrong current password under that field and clears it on edit", async () => {
    const sent = stubApi(400, { detail: "Incorrect current password" });
    const { result } = setup();
    fill(result, "NotMyPassword1!", "NewPassword123!", "NewPassword123!");

    act(() => result.current.onSave());

    await waitFor(() => expect(result.current.errors.current).toBe("That isn't your current password."));
    expect(sent).toEqual([{ current_password: "NotMyPassword1!", new_password: "NewPassword123!" }]);
    expect(onClose).not.toHaveBeenCalled();
    expect(result.current.values.next).toBe("NewPassword123!");

    act(() => result.current.onChange("current", "OldPassword123!"));
    expect(result.current.errors.current).toBeUndefined();
  });

  it("shows an unexpected failure for the whole form", async () => {
    stubApi(500, {});
    const { result } = setup();
    fill(result, "OldPassword123!", "NewPassword123!", "NewPassword123!");

    act(() => result.current.onSave());

    await waitFor(() => expect(result.current.errors.form).toBe("We couldn't change your password. Try again."));
  });

  it("closes, reports the change and keeps new tokens on success", async () => {
    stubApi(200, { message: "ok", access_token: "new-access", refresh_token: "new-refresh" });
    const { result } = setup();
    fill(result, "OldPassword123!", "NewPassword123!", "NewPassword123!");

    act(() => result.current.onSave());

    await waitFor(() => expect(onChanged).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    expect(setTokens).toHaveBeenCalledWith({ access_token: "new-access", refresh_token: "new-refresh" });
    expect(result.current.values).toEqual({ current: "", next: "", confirm: "" });
  });

  it("forgets what was typed when the dialog is closed", () => {
    const { result } = setup();
    fill(result, "OldPassword123!", "short", "short");
    act(() => result.current.onBlur("next"));

    act(() => result.current.onClose());

    expect(result.current.values).toEqual({ current: "", next: "", confirm: "" });
    expect(result.current.errors).toEqual({});
    expect(onClose).toHaveBeenCalled();
  });
});
