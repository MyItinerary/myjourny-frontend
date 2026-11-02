import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostProfileViewModel } from "../view-model/use-host-profile-view-model";
import { HostProfileView } from "./host-profile-view";

const vm = (over: Partial<HostProfileViewModel> = {}): HostProfileViewModel => ({
  header: { title: "Your profile", subtitle: "", actions: [] },
  nav: [
    { key: "personal", label: "Personal information", icon: "person", active: true, badge: null },
    { key: "verify", label: "Verification", icon: "shield", active: false, badge: "1 left" },
    { key: "notify", label: "Notifications", icon: "bell", active: false, badge: null },
  ],
  onPane: vi.fn(),
  pane: "personal",
  title: "Personal information",
  subtitle: "Only you and MyJourny see this.",
  setup: null,
  rows: [
    { label: "Legal name", value: "Tunde Oluwaseun Bakare", action: "Edit" },
    { label: "Home address", value: "Not provided", action: "Add", muted: true, help: "Never shown to guests." },
    { label: "Identity", value: "NIN checked", action: "View", chip: { text: "Verified", kind: "Live" } },
  ],
  onRowAction: vi.fn(),
  preview: null,
  notifications: null,
  payouts: null,
  tax: null,
  danger: null,
  ...over,
});

describe("HostProfileView, the panes and rows", () => {
  it("lists the panes with the current one marked and a badge", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostProfileView vm={props} />);

    expect(screen.getByRole("button", { name: "Personal information" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("1 left")).toHaveClass("text-[#B4760A]");
    await user.click(screen.getByRole("button", { name: /Verification/ }));
    expect(props.onPane).toHaveBeenCalledWith("verify");
  });

  it("shows the heading, and each row with its chip, help and action", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostProfileView vm={props} />);

    expect(screen.getByRole("heading", { name: "Personal information" })).toBeInTheDocument();
    expect(screen.getByText("Only you and MyJourny see this.")).toBeInTheDocument();
    expect(screen.getByText("Tunde Oluwaseun Bakare")).toHaveClass("text-[#6F6B72]");
    expect(screen.getByText("Not provided")).toHaveClass("text-[#A09DA3]");
    expect(screen.getByText("Never shown to guests.")).toBeInTheDocument();
    expect(screen.getByText("Verified")).toHaveClass("text-[#0CBA65]");

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    expect(props.onRowAction).toHaveBeenCalledWith(expect.objectContaining({ label: "Legal name" }));
  });
});

describe("HostProfileView, finishing setup", () => {
  it("shows progress and opens a task", async () => {
    const onOpen = vi.fn();
    const props = vm({
      setup: {
        count: "1 of 3 done",
        percent: 33,
        note: "You cannot be paid until these three are done.",
        tasks: [
          { title: "Confirm who you are", body: "Your NIN.", pane: "verify", done: true, onOpen },
          { title: "Write your public profile", body: "A photo.", pane: "public", done: false, onOpen },
        ],
      },
    });
    const { user, container } = renderWithProviders(<HostProfileView vm={props} />);

    expect(screen.getByText("Finish setting up")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 done")).toBeInTheDocument();
    expect(container.querySelector("[style*='width: 33%']")).not.toBeNull();
    expect(screen.getByText("✓")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Write your public profile/ }));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe("HostProfileView, a guest's view of you", () => {
  it("previews the public profile", () => {
    renderWithProviders(
      <HostProfileView
        vm={vm({
          preview: {
            name: "Tunde Bakare",
            line: "Photographer · Lagos",
            badges: ["Verified host", "Replies in an hour"],
            bio: "Nine years on the island.",
            languages: "English and Yoruba",
          },
        })}
      />,
    );
    expect(screen.getByText("What a guest sees")).toBeInTheDocument();
    expect(screen.getByText("Verified host")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("Replies in an hour")).toHaveClass("text-[#6F6B72]");
    expect(screen.getByText("Nine years on the island.")).toBeInTheDocument();
    expect(screen.getByText("Speaks English and Yoruba")).toBeInTheDocument();
  });

  it("leaves out the badges when there are none", () => {
    renderWithProviders(
      <HostProfileView vm={vm({ preview: { name: "Your name", line: "Your trade", badges: [], bio: "A few lines.", languages: "the languages you add" } })} />,
    );
    expect(screen.queryByText("Verified host")).not.toBeInTheDocument();
  });
});

describe("HostProfileView, notifications", () => {
  const notifications = {
    channels: ["WhatsApp", "SMS", "Email", "Push"],
    rows: [
      { label: "Someone asks to book", cells: [{ on: true, locked: true }, { on: true, locked: false }, { on: true, locked: false }, { on: true, locked: false }] },
      { label: "A review comes in", cells: [{ on: false, locked: false }, { on: false, locked: false }, { on: true, locked: false }, { on: true, locked: false }] },
    ],
    note: "Booking requests always go to WhatsApp.",
    onToggle: vi.fn(),
  };

  it("shows a box per channel, with the locked one greyed", async () => {
    const { user } = renderWithProviders(<HostProfileView vm={vm({ rows: [], notifications })} />);

    for (const channel of notifications.channels) expect(screen.getByText(channel)).toBeInTheDocument();
    expect(screen.getByText("Booking requests always go to WhatsApp.")).toBeInTheDocument();
    const locked = screen.getByRole("checkbox", { name: "Someone asks to book, WhatsApp" });
    expect(locked).toHaveAttribute("aria-disabled", "true");
    expect(locked).toHaveClass("bg-[#BDBDBD]");

    await user.click(screen.getByRole("checkbox", { name: "A review comes in, SMS" }));
    expect(notifications.onToggle).toHaveBeenCalledWith(1, 1);
  });
});

describe("HostProfileView, payouts", () => {
  it("chooses a schedule and shows the currencies", async () => {
    const onSchedule = vi.fn();
    const { user } = renderWithProviders(
      <HostProfileView
        vm={vm({
          rows: [],
          payouts: {
            schedules: [
              { key: "booking", label: "After every experience", sub: "Within 24 hours.", selected: false },
              { key: "weekly", label: "All together on Tuesdays", sub: "One payment a week.", selected: true },
            ],
            onSchedule,
          },
        })}
      />,
    );

    expect(screen.getByRole("radio", { name: /All together on Tuesdays/ })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("radio", { name: /After every experience/ }));
    expect(onSchedule).toHaveBeenCalledWith("booking");
    expect(screen.getByText("In use")).toBeInTheDocument();
    expect(screen.getByText("Coming later")).toBeInTheDocument();
  });
});

describe("HostProfileView, tax and documents", () => {
  it("lists statements and what was sent, checked or not", async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(
      <HostProfileView
        vm={vm({
          rows: [],
          tax: {
            statements: [{ year: "2026, so far", sub: "₦1,046,000 earned" }],
            documents: [
              { name: "National identity number", sub: "Uploaded", checked: true, action: "View" },
              { name: "CAC certificate", sub: "Optional", checked: false, action: "Upload" },
            ],
            onAction,
          },
        })}
      />,
    );

    expect(screen.getByText("Yearly statements")).toBeInTheDocument();
    expect(screen.getByText("Checked")).toHaveClass("text-[#0CBA65]");
    expect(screen.getByText("Not sent")).toHaveClass("text-[#6F6B72]");
    await user.click(screen.getByRole("button", { name: "Download" }));
    await user.click(screen.getByRole("button", { name: "Upload" }));
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});

describe("HostProfileView, closing the account", () => {
  it("says what stands in the way and offers to start", async () => {
    const onStart = vi.fn();
    const { user } = renderWithProviders(
      <HostProfileView vm={vm({ rows: [], danger: { text: "You have 4 bookings still to come.", onStart } })} />,
    );

    const card = screen.getByText("Close your account").closest("section")!;
    expect(within(card).getByText("You have 4 bookings still to come.")).toBeInTheDocument();
    await user.click(within(card).getByRole("button", { name: "Start closing my account" }));
    expect(onStart).toHaveBeenCalled();
  });
});
