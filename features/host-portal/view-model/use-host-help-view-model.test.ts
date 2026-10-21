import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHostHelpViewModel } from "./use-host-help-view-model";

const nav = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(nav.query) }));
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  nav.query = "";
  toast.info.mockReset();
});

const render = () => renderHook(() => useHostHelpViewModel()).result;
const openGuides = (result: { current: ReturnType<typeof useHostHelpViewModel> }) => result.current.guides.filter((g) => g.open).map((g) => g.n);

describe("useHostHelpViewModel", () => {
  it("offers support by email and WhatsApp, and the page header", () => {
    const { current } = render();

    expect(current.header).toMatchObject({ title: "Help and resources", subtitle: "Guides, and a person on WhatsApp when you need one" });
    expect(current.header.actions[0]).toMatchObject({ label: "Message us", href: "mailto:support@myjourny.app", primary: true });
    expect(current.support.emailHref).toBe("mailto:support@myjourny.app");
    expect(current.support.heading).toBe("Need support?");
  });

  it("says WhatsApp isn't set up yet", () => {
    const { current } = render();
    act(() => current.support.onWhatsApp());
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining("WhatsApp support isn't set up yet"));
  });

  it("lists the four guides, all closed to begin with", () => {
    const { current } = render();
    expect(current.guides).toHaveLength(4);
    expect(openGuides(render())).toEqual([]);
    expect(current.guidesHeading).toBe("Read these before your first one");
  });

  it("opens one guide at a time, and closes it again", () => {
    const result = render();
    act(() => result.current.onToggleGuide(1));
    expect(openGuides(result)).toEqual(["2"]);

    act(() => result.current.onToggleGuide(3));
    expect(openGuides(result)).toEqual(["4"]);

    act(() => result.current.onToggleGuide(3));
    expect(openGuides(result)).toEqual([]);
  });

  it("opens the guide named in the address", () => {
    nav.query = "guide=1";
    const result = render();
    expect(openGuides(result)).toEqual(["1"]);

    act(() => result.current.onToggleGuide(0));
    expect(openGuides(result)).toEqual([]);
  });

  it("ignores a guide that doesn't exist", () => {
    nav.query = "guide=9";
    expect(openGuides(render())).toEqual([]);
    nav.query = "guide=zero";
    expect(openGuides(render())).toEqual([]);
  });

  it("says the cards' buttons aren't available yet", () => {
    const { current } = render();
    act(() => current.onCardAction());
    expect(toast.info).toHaveBeenCalledWith("This isn't available yet.");
  });
});
