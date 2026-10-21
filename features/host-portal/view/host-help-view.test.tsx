import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { HostHelpViewModel } from "../view-model/use-host-help-view-model";
import { HostHelpView } from "./host-help-view";

const GUIDES = [
  { n: "1", title: "How to price an experience without guessing", meta: "6 minutes · with a worked example in Naira", body: "Start with your day rate." },
  { n: "2", title: "Writing a description people actually finish", meta: "4 minutes · good and bad side by side", body: "Nobody books a list of stops." },
  { n: "3", title: "The guest who is late, drunk, or difficult", meta: "5 minutes · what we back you on", body: "You can refuse entry." },
  { n: "4", title: "Safety on water, with food, and with children", meta: "7 minutes · certifications", body: "On water you need life jackets." },
];

const vm = (open: number | null = null): HostHelpViewModel => ({
  header: { title: "Help and resources", subtitle: "", actions: [] },
  support: {
    heading: "Need support?",
    body: "A person answers, 8am to 10pm, every day. Average reply is under nine minutes.",
    whatsapp: "Message us on WhatsApp",
    email: "Send an email",
    emailHref: "mailto:support@myjourny.app",
    onWhatsApp: vi.fn(),
  },
  guidesHeading: "Read these before your first one",
  guides: GUIDES.map((g, i) => ({ ...g, open: open === i })),
  onToggleGuide: vi.fn(),
  cards: {
    safety: { title: "When something goes wrong on the day", body: "What to do if a guest is hurt.", action: "Read the safety rules" },
    community: { title: "Other hosts in Lagos", body: "A WhatsApp group of 40 hosts.", action: "Ask to join" },
  },
  onCardAction: vi.fn(),
});

describe("HostHelpView", () => {
  it("offers support, by WhatsApp and by email", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostHelpView vm={props} />);

    expect(screen.getByText("Need support?")).toBeInTheDocument();
    expect(screen.getByText(/Average reply is under nine minutes/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Send an email" })).toHaveAttribute("href", "mailto:support@myjourny.app");
    await user.click(screen.getByRole("button", { name: "Message us on WhatsApp" }));
    expect(props.support.onWhatsApp).toHaveBeenCalled();
  });

  it("lists the guides closed, each with its number and how long it takes", () => {
    renderWithProviders(<HostHelpView vm={vm()} />);

    expect(screen.getByText("Read these before your first one")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { expanded: false })).toHaveLength(4);
    expect(screen.getByText("How to price an experience without guessing")).toBeInTheDocument();
    expect(screen.getByText("6 minutes · with a worked example in Naira")).toBeInTheDocument();
    expect(screen.queryByText("Start with your day rate.")).not.toBeInTheDocument();
  });

  it("opens a guide to show it, and asks for another to be toggled", async () => {
    const props = vm(0);
    const { user } = renderWithProviders(<HostHelpView vm={props} />);

    expect(screen.getByRole("button", { name: /How to price an experience/, expanded: true })).toBeInTheDocument();
    expect(screen.getByText("Start with your day rate.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Writing a description/ }));
    expect(props.onToggleGuide).toHaveBeenCalledWith(1);
  });

  it("offers the safety rules and the host group", async () => {
    const props = vm();
    const { user } = renderWithProviders(<HostHelpView vm={props} />);

    expect(screen.getByText("When something goes wrong on the day")).toBeInTheDocument();
    expect(screen.getByText("Other hosts in Lagos")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Read the safety rules" }));
    await user.click(screen.getByRole("button", { name: "Ask to join" }));
    expect(props.onCardAction).toHaveBeenCalledTimes(2);
  });
});
