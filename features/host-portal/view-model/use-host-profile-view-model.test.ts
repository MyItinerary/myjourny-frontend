import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useHostProfileViewModel } from "./use-host-profile-view-model";

const nav = vi.hoisted(() => ({
  push: vi.fn(),
  query: "preview=full",
  user: { fullName: "Tunde Bakare", email: "tunde.bakare@gmail.com" } as { fullName: string | null; email: string | null } | null,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  useSearchParams: () => new URLSearchParams(nav.query),
}));
vi.mock("@/lib/auth/session-store", () => ({ useSession: () => ({ user: nav.user }) }));
const toast = vi.hoisted(() => ({ info: vi.fn() }));
vi.mock("sonner", () => ({ toast }));

beforeEach(() => {
  nav.query = "preview=full";
  nav.user = { fullName: "Tunde Bakare", email: "tunde.bakare@gmail.com" };
  nav.push.mockReset();
  toast.info.mockReset();
});

const render = () => renderHook(() => useHostProfileViewModel()).result;

describe("a host who has finished setting up", () => {
  it("opens on personal information, live, with the seven panes and 1 left to verify", () => {
    const { current } = render();

    expect(current.header).toMatchObject({ title: "Your profile", chip: "Live" });
    expect(current.nav.map((n) => n.label)).toEqual([
      "Personal information", "Your public profile", "Verification", "Notifications", "Payouts", "Tax and documents", "Login and security",
    ]);
    expect(current.nav.filter((n) => n.badge).map((n) => [n.key, n.badge])).toEqual([["verify", "1 left"]]);
    expect(current.pane).toBe("personal");
    expect(current.nav[0].active).toBe(true);
    expect(current.title).toBe("Personal information");
    expect(current.rows).toHaveLength(6);
    expect(current.setup).toBeNull();
  });

  it("switches pane, and shows what each one has", () => {
    const result = render();

    act(() => result.current.onPane("public"));
    expect(result.current.title).toBe("Your public profile");
    expect(result.current.preview?.name).toBe("Tunde Bakare");
    expect(result.current.rows).toHaveLength(6);

    act(() => result.current.onPane("verify"));
    expect(result.current.rows[0].chip).toEqual({ text: "Verified", kind: "Live" });
    expect(result.current.preview).toBeNull();

    act(() => result.current.onPane("tax"));
    expect(result.current.tax?.documents).toHaveLength(4);
    expect(result.current.tax?.statements).toHaveLength(2);

    act(() => result.current.onPane("security"));
    expect(result.current.danger?.text).toContain("4 bookings still to come and 11 guests holding tickets");

    act(() => result.current.onPane("personal"));
    expect(result.current.tax).toBeNull();
    expect(result.current.danger).toBeNull();
  });

  it("opens on the pane named in the address", () => {
    nav.query = "preview=full&pane=payouts";
    const { current } = render();
    expect(current.pane).toBe("payouts");
    expect(current.payouts?.schedules.find((s) => s.selected)?.key).toBe("weekly");
  });

  it("ignores a pane that doesn't exist", () => {
    nav.query = "preview=full&pane=nonsense";
    expect(render().current.pane).toBe("personal");
  });

  it("toggles notifications, except booking requests on WhatsApp", () => {
    const result = render();
    act(() => result.current.onPane("notify"));
    const cell = (r: number, c: number) => result.current.notifications!.rows[r].cells[c];
    expect(result.current.rows).toEqual([]);
    expect(result.current.notifications!.channels).toEqual(["WhatsApp", "SMS", "Email", "Push"]);
    expect(cell(0, 0)).toEqual({ on: true, locked: true });
    expect(cell(3, 0)).toEqual({ on: false, locked: false });

    act(() => result.current.notifications!.onToggle(0, 0));
    expect(cell(0, 0).on).toBe(true);

    act(() => result.current.notifications!.onToggle(3, 0));
    expect(cell(3, 0).on).toBe(true);
    act(() => result.current.notifications!.onToggle(3, 0));
    expect(cell(3, 0).on).toBe(false);
    expect(cell(3, 2).on).toBe(true);
  });

  it("chooses how to be paid", () => {
    const result = render();
    act(() => result.current.onPane("payouts"));
    act(() => result.current.payouts!.onSchedule("booking"));
    expect(result.current.payouts!.schedules.find((s) => s.selected)?.key).toBe("booking");
  });
});

describe("row actions", () => {
  it("goes to earnings and help from the payouts rows", () => {
    const result = render();
    act(() => result.current.onPane("payouts"));
    const [, , next, commission] = result.current.rows;

    act(() => result.current.onRowAction(next));
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/earnings");
    act(() => result.current.onRowAction(commission));
    expect(nav.push).toHaveBeenCalledWith("/host/dashboard/help?guide=1");
  });

  it("says edits and uploads aren't connected yet", () => {
    const result = render();
    act(() => result.current.onRowAction(result.current.rows[0]));
    act(() => result.current.header.actions[0].onClick?.());
    act(() => result.current.onPane("tax"));
    act(() => result.current.tax!.onAction());
    act(() => result.current.onPane("security"));
    act(() => result.current.danger!.onStart());
    expect(toast.info).toHaveBeenCalledTimes(4);
    expect(nav.push).not.toHaveBeenCalled();
  });
});

describe("a host who hasn't finished setting up", () => {
  beforeEach(() => {
    nav.query = "";
  });

  it("shows the account's own details, not live yet, with three things to finish", () => {
    const { current } = render();

    expect(current.header.chip).toBe("Not live yet");
    expect(current.rows[0].value).toBe("Tunde Bakare");
    expect(current.setup).toMatchObject({ count: "0 of 3 done", percent: 6, note: "You cannot be paid until these three are done." });
    expect(current.setup!.tasks.map((t) => t.title)).toEqual([
      "Confirm who you are", "Write your public profile", "Add the account we pay into",
    ]);
    expect(current.nav.find((n) => n.key === "verify")!.badge).toBe("3 left");
  });

  it("takes you to the pane a task is about, and only shows the card on personal information", () => {
    const result = render();
    act(() => result.current.setup!.tasks[2].onOpen());
    expect(result.current.pane).toBe("payouts");
    expect(result.current.setup).toBeNull();
  });

  it("says nothing stands in the way of closing the account", () => {
    const result = render();
    act(() => result.current.onPane("security"));
    expect(result.current.danger!.text).toContain("no bookings still to come");
  });
});
