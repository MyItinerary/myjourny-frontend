import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostBooking } from "../model/bookings.types";
import type { HostBookingsViewModel } from "../view-model/use-host-bookings-view-model";
import { BookingDetailView } from "./host-booking-detail-view";

const booking = (over: Partial<HostBooking> = {}): HostBooking => ({
  id: "b1",
  ref: "MJ-4502",
  tab: "Requests",
  when: "tomorrow",
  listing: "Lagos Island Photowalk",
  date: "Sat 20 Sept",
  name: "Amaka Eze",
  avatarUrl: null,
  rowNote: "",
  line: "Photowalk · Sat 20 Sept, 16:00",
  money: "2 places · ₦20,000",
  guests: 2,
  gross: "₦20,000",
  net: "₦17,000",
  status: "Waiting on you",
  isRequest: true,
  deadline: "You have 2 hours to answer this",
  notes: "Nut allergy, so no groundnut.",
  contact: "You will see it 24 hours before.",
  facts: [
    { label: "Guests", value: "2" },
    { label: "They pay", value: "₦20,000" },
    { label: "Your commission", value: "₦3,000" },
    { label: "You receive", value: "₦17,000" },
  ],
  timeline: [],
  cancelNote: null,
  ...over,
});

const vm = (detailOver: Partial<NonNullable<HostBookingsViewModel["detail"]>> = {}, b: Partial<HostBooking> = {}) =>
  ({
    detail: { booking: booking(b), chip: "In review", acceptLabel: "Accept, 2 places", canCheckIn: false, scanHref: "/host/dashboard/bookings/scan", ...detailOver },
    onCloseDetail: vi.fn(),
    onAccept: vi.fn(),
    onSayNo: vi.fn(),
    onReportNoShow: vi.fn(),
  }) as unknown as HostBookingsViewModel;

describe("BookingDetailView", () => {
  it("renders nothing while closed", () => {
    renderWithProviders(<BookingDetailView vm={{ ...vm(), detail: null }} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows who, what and the money, with the guest's notes and phone", async () => {
    renderWithProviders(<BookingDetailView vm={vm()} />);

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Amaka Eze")).toBeInTheDocument();
    expect(within(dialog).getByText("Waiting on you")).toBeInTheDocument();
    expect(within(dialog).getByText("MJ-4502 · Photowalk · Sat 20 Sept, 16:00 · 2 places · ₦20,000")).toBeInTheDocument();
    for (const label of ["Guests", "They pay", "Your commission", "You receive"]) expect(within(dialog).getByText(label)).toBeInTheDocument();
    expect(within(dialog).getByText("Food and access notes")).toBeInTheDocument();
    expect(within(dialog).getByText("Nut allergy, so no groundnut.")).toBeInTheDocument();
    expect(within(dialog).getByText("Their phone number")).toBeInTheDocument();
    expect(within(dialog).getByText("You will see it 24 hours before.")).toBeInTheDocument();
  });

  it("asks a request to be accepted or turned down, with the deadline", async () => {
    const props = vm();
    const { user } = renderWithProviders(<BookingDetailView vm={props} />);

    expect(await screen.findByText("You have 2 hours to answer this")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Accept, 2 places" }));
    await user.click(screen.getByRole("button", { name: "Say no" }));
    expect(props.onAccept).toHaveBeenCalled();
    expect(props.onSayNo).toHaveBeenCalled();
  });

  it("closes", async () => {
    const props = vm();
    const { user } = renderWithProviders(<BookingDetailView vm={props} />);
    await user.click(await screen.findByRole("button", { name: "Close" }));
    expect(props.onCloseDetail).toHaveBeenCalled();
  });

  it("lets an upcoming booking be scanned in or reported as a no show", async () => {
    const props = vm({ canCheckIn: true, chip: "Live" }, { tab: "Upcoming", isRequest: false, status: "Confirmed" });
    const { user } = renderWithProviders(<BookingDetailView vm={props} />);

    expect(screen.queryByText("You have 2 hours to answer this")).not.toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Scan their ticket" })).toHaveAttribute("href", "/host/dashboard/bookings/scan");
    await user.click(screen.getByRole("button", { name: "Report a no show" }));
    expect(props.onReportNoShow).toHaveBeenCalled();
  });

  it("tells a cancelled booking's story and where the money went", async () => {
    renderWithProviders(
      <BookingDetailView
        vm={vm(
          { chip: "Rejected" },
          {
            tab: "Cancelled",
            isRequest: false,
            status: "Cancelled by guest",
            timeline: [
              { title: "Booked on Tue 2 September", body: "One place paid up front." },
              { title: "The place went back on sale", body: "Nobody took it." },
            ],
            cancelNote: "This one does not count against you.",
          },
        )}
      />,
    );

    expect(await screen.findByText("What happened, and where the money went")).toBeInTheDocument();
    expect(screen.getByText("Booked on Tue 2 September")).toBeInTheDocument();
    expect(screen.getByText("The place went back on sale")).toBeInTheDocument();
    expect(screen.getByText("This one does not count against you.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Scan their ticket" })).not.toBeInTheDocument();
  });

  it("leaves out the closing note when there isn't one", async () => {
    renderWithProviders(<BookingDetailView vm={vm({}, { tab: "Cancelled", isRequest: false, timeline: [{ title: "Cancelled", body: "By the guest." }], cancelNote: null })} />);
    expect(await screen.findByText("Cancelled")).toBeInTheDocument();
  });
});
