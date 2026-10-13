import { act } from "@testing-library/react";
import { toast } from "sonner";
import { describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useEmailTemplatesViewModel } from "./use-email-templates-view-model";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useEmailTemplatesViewModel", () => {
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

  it("copies HTML using navigator.clipboard", async () => {
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
    expect(toast.success).toHaveBeenCalledWith("Email template HTML copied to clipboard");
  });
});
