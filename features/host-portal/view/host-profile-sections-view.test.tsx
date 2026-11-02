import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostProfileViewModel } from "../view-model/use-host-profile-view-model";
import { DangerCard, NotificationsTable, PayoutsSection, PreviewCard, RowList, SetupCard, TaxSection } from "./host-profile-sections-view";

describe("SetupCard", () => {
  it("shows the count, the bar and a task that can be opened", async () => {
    const onOpen = vi.fn();
    const { user } = renderWithProviders(
      <SetupCard
        setup={{
          count: "0 of 3 done",
          percent: 6,
          note: "You cannot be paid until these three are done.",
          tasks: [{ title: "Confirm who you are", body: "Your NIN.", pane: "verify", done: false, onOpen }],
        }}
      />,
    );

    expect(screen.getByText("0 of 3 done")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Confirm who you are/ }));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe("RowList", () => {
  it("shows each row and runs its action", async () => {
    const onRowAction = vi.fn();
    const vm = { rows: [{ label: "City", value: "Lagos", action: "Edit" }], onRowAction } as unknown as HostProfileViewModel;
    const { user } = renderWithProviders(<RowList vm={vm} />);

    expect(screen.getByText("Lagos")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    expect(onRowAction).toHaveBeenCalledWith(expect.objectContaining({ label: "City" }));
  });
});

describe("PreviewCard", () => {
  it("shows a guest's view with initials and badges", () => {
    renderWithProviders(
      <PreviewCard preview={{ name: "Tunde Bakare", line: "Photographer", badges: ["Verified host"], bio: "Nine years.", languages: "English" }} />,
    );
    expect(screen.getByText("TB")).toBeInTheDocument();
    expect(screen.getByText("Verified host")).toBeInTheDocument();
    expect(screen.getByText("Speaks English")).toBeInTheDocument();
  });
});

describe("NotificationsTable", () => {
  it("toggles a box", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(
      <NotificationsTable
        notifications={{
          channels: ["WhatsApp", "SMS", "Email", "Push"],
          rows: [{ label: "A review comes in", cells: [{ on: false, locked: false }, { on: false, locked: false }, { on: true, locked: false }, { on: true, locked: false }] }],
          note: "Booking requests always go to WhatsApp.",
          onToggle,
        }}
      />,
    );
    await user.click(screen.getByRole("checkbox", { name: "A review comes in, SMS" }));
    expect(onToggle).toHaveBeenCalledWith(0, 1);
  });
});

describe("PayoutsSection", () => {
  it("picks a schedule", async () => {
    const onSchedule = vi.fn();
    const { user } = renderWithProviders(
      <PayoutsSection payouts={{ schedules: [{ key: "booking", label: "After every experience", sub: "Fast.", selected: false }], onSchedule }} />,
    );
    await user.click(screen.getByRole("radio", { name: /After every experience/ }));
    expect(onSchedule).toHaveBeenCalledWith("booking");
  });
});

describe("TaxSection", () => {
  it("lists statements and documents", async () => {
    const onAction = vi.fn();
    const { user } = renderWithProviders(
      <TaxSection
        tax={{
          statements: [{ year: "2026, so far", sub: "₦1,046,000 earned" }],
          documents: [{ name: "Identity selfie", sub: "Uploaded", checked: true, action: "View" }],
          onAction,
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Download" }));
    expect(onAction).toHaveBeenCalled();
    expect(screen.getByText("Checked")).toBeInTheDocument();
  });
});

describe("DangerCard", () => {
  it("offers to start closing the account", async () => {
    const onStart = vi.fn();
    const { user } = renderWithProviders(<DangerCard danger={{ text: "Nothing stands in the way.", onStart }} />);
    await user.click(screen.getByRole("button", { name: "Start closing my account" }));
    expect(onStart).toHaveBeenCalled();
  });
});
