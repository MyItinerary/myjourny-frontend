import { act } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useEmailTemplatesViewModel } from "./use-email-templates-view-model";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useEmailTemplatesViewModel", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  it("initializes with default values", () => {
    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    expect(result.current.activeTemplateId).toBe("password-reset");
    expect(result.current.viewMode).toBe("preview");
    expect(result.current.viewport).toBe("desktop");
    expect(result.current.copied).toBe(false);
    expect(result.current.catalog.length).toBe(6);
  });

  it("accepts custom initial props", () => {
    const { result } = renderHookWithProviders(() =>
      useEmailTemplatesViewModel({
        initialTemplateId: "payment-confirmed",
        initialViewMode: "all",
        initialViewport: "mobile",
      }),
    );

    expect(result.current.activeTemplateId).toBe("payment-confirmed");
    expect(result.current.viewMode).toBe("all");
    expect(result.current.viewport).toBe("mobile");
  });

  it("updates active template when onSelectTemplate is called", () => {
    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    act(() => {
      result.current.onSelectTemplate("booking-confirmed");
    });

    expect(result.current.activeTemplateId).toBe("booking-confirmed");
  });

  it("updates view mode when onSelectViewMode is called", () => {
    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    act(() => {
      result.current.onSelectViewMode("all");
    });

    expect(result.current.viewMode).toBe("all");
  });

  it("updates viewport when onSelectViewport is called", () => {
    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    act(() => {
      result.current.onSelectViewport("mobile");
    });

    expect(result.current.viewport).toBe("mobile");
  });

  it("copies HTML using navigator.clipboard with explicit string", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    await act(async () => {
      await result.current.onCopyHtml("<html>test</html>");
    });

    expect(writeTextMock).toHaveBeenCalledWith("<html>test</html>");
    expect(result.current.copied).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Email template HTML copied to clipboard");
  });

  it("generates and copies full email template HTML when no string is passed", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    await act(async () => {
      await result.current.onCopyHtml();
    });

    expect(writeTextMock).toHaveBeenCalled();
    const copiedHtml = writeTextMock.mock.calls[0][0] as string;
    expect(copiedHtml).toContain("<!DOCTYPE html>");
    expect(copiedHtml).toContain("Let's get you back in");
    expect(toast.success).toHaveBeenCalledWith("Email template HTML copied to clipboard");
  });

  it("shows error toast when navigator.clipboard is missing", async () => {
    Object.assign(navigator, {
      clipboard: undefined,
    });

    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    await act(async () => {
      await result.current.onCopyHtml();
    });

    expect(toast.error).toHaveBeenCalledWith("Clipboard is not available in this environment");
    expect(result.current.copied).toBe(false);
  });

  it("shows error toast when writeText throws", async () => {
    const writeTextMock = vi.fn().mockRejectedValue(new Error("Permission denied"));
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    await act(async () => {
      await result.current.onCopyHtml();
    });

    expect(toast.error).toHaveBeenCalledWith("Failed to copy email template HTML");
    expect(result.current.copied).toBe(false);
  });

  it("clears timeout ref on unmount and on repeated clicks", async () => {
    vi.useFakeTimers();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const { result, unmount } = renderHookWithProviders(() => useEmailTemplatesViewModel());

    await act(async () => {
      await result.current.onCopyHtml();
    });
    expect(result.current.copied).toBe(true);

    // Fast-forward 1 second, then click again to verify timer resets
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await act(async () => {
      await result.current.onCopyHtml();
    });
    expect(result.current.copied).toBe(true);

    // After another 2 seconds, copied resets to false
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.copied).toBe(false);

    // Unmount safely clears any active timer
    unmount();
    vi.useRealTimers();
  });
});
