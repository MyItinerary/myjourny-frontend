import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { useHideOnScroll } from "./use-hide-on-scroll";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const PAGE_HEIGHT = 3000;

function scrollTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });
    window.dispatchEvent(new Event("scroll"));
  });
}

function stubMedia(matching: string[]) {
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: matching.includes(query) }));
}

beforeEach(() => {
  nav.pathname = "/";
  // Run each scroll's update straight away instead of on the next frame.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
  Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: PAGE_HEIGHT });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });
  Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  stubMedia([]);
});

afterEach(() => {
  vi.unstubAllGlobals();
  delete (navigator as Navigator & { standalone?: boolean }).standalone;
});

describe("useHideOnScroll", () => {
  it("shows the bar at first, hides it as you scroll down and brings it back as you scroll up", () => {
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    expect(result.current).toBe(false);

    scrollTo(400);
    expect(result.current).toBe(true);

    scrollTo(300);
    expect(result.current).toBe(false);
  });

  it("ignores tiny movements so a resting thumb doesn't flicker it", () => {
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(400);
    scrollTo(396);
    expect(result.current).toBe(true);
  });

  it("stays shown near the top of the page", () => {
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(60);
    expect(result.current).toBe(false);
  });

  it("comes back at the end of the page, so the last content is never covered", () => {
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(1500);
    expect(result.current).toBe(true);
    scrollTo(PAGE_HEIGHT - 800);
    expect(result.current).toBe(false);
  });

  it("comes back when you move to another page", () => {
    const { result, rerender } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(1500);
    expect(result.current).toBe(true);

    nav.pathname = "/experiences";
    rerender();
    expect(result.current).toBe(false);
  });

  it("never hides in the installed app, where there's no browser toolbar", () => {
    stubMedia(["(display-mode: standalone)"]);
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(1500);
    expect(result.current).toBe(false);
  });

  it("never hides when added to an iPhone's home screen", () => {
    Object.defineProperty(navigator, "standalone", { configurable: true, value: true });
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(1500);
    expect(result.current).toBe(false);
  });

  it("never hides for people who ask for reduced motion", () => {
    stubMedia(["(prefers-reduced-motion: reduce)"]);
    const { result } = renderHookWithProviders(() => useHideOnScroll());
    scrollTo(1500);
    expect(result.current).toBe(false);
  });
});
