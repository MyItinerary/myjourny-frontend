import { act, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiUrl } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders } from "@/test/utils/render";

import { useShareDialogViewModel } from "./use-share-dialog-view-model";

const session = { user: null as { fullName: string | null } | null };
vi.mock("@/lib/auth/session-store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth/session-store")>()),
  useSession: () => session,
}));
const toast = { success: vi.fn(), error: vi.fn() };
vi.mock("sonner", () => ({ toast: { success: (m: string) => toast.success(m), error: (m: string) => toast.error(m) } }));

const options = { path: "/experiences/abc", title: "Sunrise Kayaking", kind: "experience" as const };
const render = () => renderHookWithProviders(() => useShareDialogViewModel(options));

beforeEach(() => {
  vi.clearAllMocks();
  session.user = null;
});

describe("useShareDialogViewModel", () => {
  it("opens and closes", () => {
    const { result } = render();
    expect(result.current.open).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(true);
    act(() => result.current.onClose());
    expect(result.current.open).toBe(false);
  });

  it("shares the page alone for a visitor", () => {
    const { result } = render();
    expect(result.current.url).toBe(`${window.location.origin}/experiences/abc`);
    expect(result.current.hasReferral).toBe(false);
    expect(result.current.message).toBe("Take a look at this experience: Sunrise Kayaking");
  });

  it("adds the signed-in user's referral code while their campaign is active", async () => {
    session.user = { fullName: "Daniel Okafor" };
    server.use(http.get(apiUrl("/referrals/me"), () => HttpResponse.json({ code: "DANIEL10", active: true })));
    const { result } = render();
    act(() => result.current.onOpen());
    await waitFor(() => expect(result.current.hasReferral).toBe(true));
    expect(result.current.url).toBe(`${window.location.origin}/experiences/abc?ref=DANIEL10`);
    expect(result.current.message).toBe("Daniel invited you to try Sunrise Kayaking");
    expect(result.current.targets.find((t) => t.id === "whatsapp")!.href).toContain(encodeURIComponent("ref=DANIEL10"));
  });

  it("leaves the code off when there is no campaign", async () => {
    session.user = { fullName: null };
    server.use(http.get(apiUrl("/referrals/me"), () => HttpResponse.json({ code: "X", active: false })));
    const { result, queryClient } = render();
    act(() => result.current.onOpen());
    await waitFor(() => expect(queryClient.getQueryState(["referrals", "me"])?.status).toBe("success"));
    expect(result.current.hasReferral).toBe(false);
  });

  it("copies the link", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    const { result } = render();
    await act(() => result.current.onCopy());
    expect(writeText).toHaveBeenCalledWith(result.current.url);
    expect(result.current.copied).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("says so when copying fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("no")) },
      configurable: true,
    });
    const { result } = render();
    await act(() => result.current.onCopy());
    expect(result.current.copied).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });

  it("uses the device's share sheet for More options, or copies without one", async () => {
    const { result } = render();
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: share, configurable: true });
    await act(() => result.current.onMoreOptions());
    expect(share).toHaveBeenCalledWith({ title: "Sunrise Kayaking", text: result.current.message, url: result.current.url });

    Object.defineProperty(navigator, "share", { value: undefined, configurable: true });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    await act(() => result.current.onMoreOptions());
    expect(writeText).toHaveBeenCalledWith(result.current.url);
  });
});
