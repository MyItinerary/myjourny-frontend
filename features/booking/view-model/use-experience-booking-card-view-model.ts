import type { BookingCardAction, BookingCardInfoRow, BookingCardPrice, BookingCardTotal } from "../model/booking-card.types";
import { trimWholeAmount } from "../model/format";
import {
  type BookingPanelProps,
  type BookingPanelViewModel,
  useBookingPanelViewModel,
} from "./use-booking-panel-view-model";
import type { SessionChoice } from "./use-session-choice";
import type { AddonRow, TicketSelection } from "./use-ticket-selection";

export type ExperienceBookingCardGuestRow = {
  id: string;
  label: string;
  /** "₦5,000 / person", shown when there are several ticket types. */
  sublabel: string | null;
  quantity: number;
  max: number;
  onChange: (quantity: number) => void;
};

/** Everything the experience booking card shows. */
export type ExperienceBookingCardProps = {
  price: BookingCardPrice;
  durationLabel: string;
  /** "Every Saturday · 3 days"; null without a schedule. */
  scheduleLabel: string | null;
  sessions: SessionChoice;
  guests: ExperienceBookingCardGuestRow[];
  /** Why the selection can't be booked yet, or what the schedule implies. */
  notices: string[];
  /** Days to book, for per-day tickets on unscheduled experiences. */
  days: TicketSelection["days"];
  addons: AddonRow[];
  promo: BookingPanelViewModel["promo"];
  total: BookingCardTotal;
  /** Null when this experience can't be booked yet. */
  action: BookingCardAction | null;
  info: BookingCardInfoRow[];
};

type CardContent = {
  /** Policy rows under the button. Only what the backend knows. */
  info?: BookingCardInfoRow[];
};

/** What the total line says while nothing can be priced. */
function totalHint(vm: BookingPanelViewModel): string {
  if (vm.minGuestsWarning) return "Add guests";
  if (vm.sessions.noSessions) return "No dates yet";
  if (vm.sessions.allSoldOut) return "Sold out";
  if (vm.sessions.scheduled && !vm.sessions.session) return "Select a time";
  return "Select a date";
}

/** The booking panel's state, laid out for the booking card. */
export function toExperienceBookingCard(vm: BookingPanelViewModel, content: CardContent = {}): ExperienceBookingCardProps {
  const { booking } = vm;
  return {
    price: {
      prefix: vm.priceFrom.showFrom ? "From" : null,
      amount: trimWholeAmount(vm.priceFrom.amount),
      unit: `per ${vm.priceFrom.unit.replace(/^\/\s*/, "")}`,
    },
    durationLabel: vm.durationLabel,
    scheduleLabel: vm.scheduleLabel,
    sessions: vm.sessions,
    guests: vm.tickets.map((ticket) => ({
      id: ticket.id,
      label: ticket.label === "Participants" ? "Guests" : ticket.label,
      sublabel: ticket.priceLabel ? trimWholeAmount(ticket.priceLabel) : null,
      quantity: ticket.quantity,
      max: ticket.max,
      onChange: ticket.onChange,
    })),
    notices: [vm.minGuestsWarning, vm.seatsWarning, vm.quoteError].filter((n): n is string => !!n),
    days: vm.days,
    addons: vm.addons,
    promo: vm.promo,
    total: {
      amount: vm.total ? trimWholeAmount(vm.total) : null,
      hint: vm.total ? null : totalHint(vm),
      note: vm.total ? "Fees and taxes included" : null,
    },
    action: booking.available
      ? {
          label: booking.pending ? booking.label : booking.label.startsWith("Select") ? booking.label : "Book now",
          disabled: booking.disabled,
          pending: booking.pending,
          onClick: booking.onBook,
        }
      : null,
    info: content.info ?? [],
  };
}

/** The booking card for an experience, backed by the live booking logic. */
export function useExperienceBookingCardViewModel(props: BookingPanelProps & CardContent): ExperienceBookingCardProps {
  const { info, ...panel } = props;
  return toExperienceBookingCard(useBookingPanelViewModel(panel), { info });
}
