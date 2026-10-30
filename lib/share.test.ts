import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";

import { buildSharePayload, shareExperience } from "./share";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("shareExperience", () => {
  const originalNavigator = { ...globalThis.navigator };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, "navigator", {
      value: originalNavigator,
      configurable: true,
      writable: true,
    });
  });

  it("builds a share payload containing title, text, and url", () => {
    const payload = buildSharePayload({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(payload).toEqual({
      title: "Lagos Boat Cruise",
      text: "Check out Lagos Boat Cruise on MyJourny:",
      url: "https://myjourny.io/experiences/exp-1",
    });
  });

  it("calls navigator.share with the text payload when canShare returns true", async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    const mockCanShare = vi.fn().mockReturnValue(true);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: mockShare,
        canShare: mockCanShare,
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(mockCanShare).toHaveBeenCalledWith({
      title: "Lagos Boat Cruise",
      text: "Check out Lagos Boat Cruise on MyJourny:",
      url: "https://myjourny.io/experiences/exp-1",
    });
    expect(mockShare).toHaveBeenCalledWith({
      title: "Lagos Boat Cruise",
      text: "Check out Lagos Boat Cruise on MyJourny:",
      url: "https://myjourny.io/experiences/exp-1",
    });
    expect(mockWriteText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("does not fall back to clipboard when share rejects with an AbortError", async () => {
    const abortError = new Error("User cancelled");
    abortError.name = "AbortError";

    const mockShare = vi.fn().mockRejectedValue(abortError);
    const mockCanShare = vi.fn().mockReturnValue(true);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: mockShare,
        canShare: mockCanShare,
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(mockShare).toHaveBeenCalled();
    expect(mockWriteText).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("falls back to clipboard and shows success toast when share throws other errors", async () => {
    const networkError = new Error("Platform share failed");

    const mockShare = vi.fn().mockRejectedValue(networkError);
    const mockCanShare = vi.fn().mockReturnValue(true);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: mockShare,
        canShare: mockCanShare,
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(mockShare).toHaveBeenCalled();
    expect(mockWriteText).toHaveBeenCalledWith("https://myjourny.io/experiences/exp-1");
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("falls back to clipboard when canShare returns false", async () => {
    const mockShare = vi.fn();
    const mockCanShare = vi.fn().mockReturnValue(false);
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      value: {
        share: mockShare,
        canShare: mockCanShare,
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(mockShare).not.toHaveBeenCalled();
    expect(mockWriteText).toHaveBeenCalledWith("https://myjourny.io/experiences/exp-1");
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("falls back to clipboard when navigator.share is unavailable", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(globalThis, "navigator", {
      value: {
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(mockWriteText).toHaveBeenCalledWith("https://myjourny.io/experiences/exp-1");
    expect(toast.success).toHaveBeenCalledWith("Link copied");
  });

  it("shows error toast when copying to clipboard also fails", async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error("Clipboard denied"));

    Object.defineProperty(globalThis, "navigator", {
      value: {
        clipboard: { writeText: mockWriteText },
      },
      configurable: true,
      writable: true,
    });

    await shareExperience({
      title: "Lagos Boat Cruise",
      url: "https://myjourny.io/experiences/exp-1",
    });

    expect(toast.error).toHaveBeenCalledWith("Couldn't copy the link");
  });
});

