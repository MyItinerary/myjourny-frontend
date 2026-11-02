import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GUIDES, GUIDES_HEADING, HELP_CARDS, type HelpGuide, SUPPORT_COPY, SUPPORT_EMAIL } from "../model/help-content";
import type { HostPageHeader } from "./use-host-home-view-model";

export type HostHelpViewModel = {
  header: HostPageHeader;
  support: { heading: string; body: string; whatsapp: string; email: string; emailHref: string; onWhatsApp: () => void };
  guidesHeading: string;
  guides: (HelpGuide & { open: boolean })[];
  onToggleGuide: (index: number) => void;
  cards: typeof HELP_CARDS;
  /** The cards' buttons: nothing to open yet. */
  onCardAction: () => void;
};

const mailto = `mailto:${SUPPORT_EMAIL}`;

export function useHostHelpViewModel(): HostHelpViewModel {
  // ?guide=1 opens the first guide, as when a link says "How this works".
  const requested = Number(useSearchParams().get("guide"));
  const [openState, setOpen] = useState<number | null | undefined>(undefined);
  const open = openState === undefined ? (requested >= 1 && requested <= GUIDES.length ? requested - 1 : null) : openState;

  return {
    header: {
      title: "Help and resources",
      subtitle: "Guides, and a person on WhatsApp when you need one",
      actions: [{ label: "Message us", href: mailto, primary: true }],
    },
    support: {
      ...SUPPORT_COPY,
      emailHref: mailto,
      onWhatsApp: () => toast.info("WhatsApp support isn't set up yet. Send us an email for now."),
    },
    guidesHeading: GUIDES_HEADING,
    guides: GUIDES.map((guide, i) => ({ ...guide, open: open === i })),
    onToggleGuide: (index) => setOpen(open === index ? null : index),
    cards: HELP_CARDS,
    onCardAction: () => toast.info("This isn't available yet."),
  };
}
