import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderHookWithProviders } from "@/test/utils/render";

import { HOME_SECTION_IDS } from "../model/home-sections.types";
import { POPUP_DISMISSED_KEY, POPUP_IDLE_MS, useTasteQuizPopupViewModel } from "./use-taste-quiz-popup-view-model";

const VIEWPORT = 800;
// Where the two sections sit relative to the viewport, set per test.
const layout = { whyBookBottom: -100, newsletterTop: 2000 };

function addSection(id: string, rect: () => Partial<DOMRect>) {
  const el = document.createElement("div");
  el.id = id;
  el.getBoundingClientRect = () => rect() as DOMRect;
  document.body.appendChild(el);
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function activity(type = "mousemove") {
  act(() => {
    window.dispatchEvent(new Event(type));
  });
}

function render(visible = true) {
  return renderHookWithProviders(() => useTasteQuizPopupViewModel({ visible, href: "/onboarding" }));
}

describe("useTasteQuizPopupViewModel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.sessionStorage.clear();
    Object.defineProperty(window, "innerHeight", { value: VIEWPORT, configurable: true });
    layout.whyBookBottom = -100;
    layout.newsletterTop = 2000;
    addSection(HOME_SECTION_IDS.whyBook, () => ({ bottom: layout.whyBookBottom }));
    addSection(HOME_SECTION_IDS.newsletter, () => ({ top: layout.newsletterTop }));
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("appears only after the visitor has sat still for a while", () => {
    const { result } = render();
    expect(result.current.visible).toBe(false);

    advance(POPUP_IDLE_MS - 1);
    expect(result.current.visible).toBe(false);

    advance(1);
    expect(result.current.visible).toBe(true);
    expect(result.current.href).toBe("/onboarding");
  });

  it("starts the wait again whenever they scroll, move the mouse, click or type", () => {
    const { result } = render();

    advance(POPUP_IDLE_MS - 1000);
    activity("mousemove");
    advance(POPUP_IDLE_MS - 1000);
    activity("scroll");
    advance(POPUP_IDLE_MS - 1000);
    expect(result.current.visible).toBe(false);

    advance(1000);
    expect(result.current.visible).toBe(true);
  });

  it("isn't offered while 'Why book with us' is still on screen", () => {
    layout.whyBookBottom = 300;
    const { result } = render();

    advance(POPUP_IDLE_MS * 2);

    expect(result.current.visible).toBe(false);
  });

  it("isn't offered once the newsletter is on screen", () => {
    layout.newsletterTop = VIEWPORT - 50;
    const { result } = render();

    advance(POPUP_IDLE_MS * 2);

    expect(result.current.visible).toBe(false);
  });

  it("goes away when they scroll down to the newsletter, and is back if they return to the middle", () => {
    const { result } = render();
    advance(POPUP_IDLE_MS);
    expect(result.current.visible).toBe(true);

    layout.newsletterTop = VIEWPORT - 50;
    activity("scroll");
    expect(result.current.visible).toBe(false);

    layout.newsletterTop = 2000;
    activity("scroll");
    expect(result.current.visible).toBe(true);
  });

  it("stays up while they move around between those two sections", () => {
    const { result } = render();
    advance(POPUP_IDLE_MS);

    activity("mousemove");
    activity("wheel");

    expect(result.current.visible).toBe(true);
  });

  it("never shows for people the quiz isn't meant for", () => {
    const { result } = render(false);

    advance(POPUP_IDLE_MS * 2);

    expect(result.current.visible).toBe(false);
  });

  it("'Maybe later' closes it and keeps it closed for the rest of the visit", () => {
    const first = render();
    advance(POPUP_IDLE_MS);
    expect(first.result.current.visible).toBe(true);

    act(() => first.result.current.onDismiss());
    expect(first.result.current.visible).toBe(false);
    expect(window.sessionStorage.getItem(POPUP_DISMISSED_KEY)).toBe("1");

    first.unmount();
    const second = render();
    advance(POPUP_IDLE_MS * 2);
    expect(second.result.current.visible).toBe(false);
  });
});
