import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { SAMPLE_EVENT } from "@/test/fixtures/event-details";
import { EventSectionsView } from "./event-sections-view";

describe("EventSectionsView", () => {
  it("shows every section of the sample event, in order", () => {
    renderWithProviders(<EventSectionsView event={SAMPLE_EVENT} openQuestionId="friend" onToggleQuestion={vi.fn()} />);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "About this event",
      "What ticket includes",
      "Good to know",
      "Lineup",
      "Questions",
      "Where you’ll be",
      "Schedule",
      "More ways to experience Lagos",
      "Know before you go",
    ]);
    expect(screen.getByText("All three sessions")).toBeInTheDocument();
    expect(screen.getByText("Entry and ID")).toBeInTheDocument();
    expect(screen.getByText("Amara Okoye")).toBeInTheDocument();
    expect(screen.getByText("Harbour Hall, 14 Marina Road, Victoria Island, Lagos")).toBeInTheDocument();
    expect(screen.getByText("Nature & outdoors")).toBeInTheDocument();
    expect(screen.getByText("Afro Futures Collective")).toBeInTheDocument();
  });

  it("links each category card to its category page", () => {
    renderWithProviders(<EventSectionsView event={SAMPLE_EVENT} openQuestionId={null} onToggleQuestion={vi.fn()} />);
    expect(screen.getByRole("link", { name: /Nature & outdoors/ })).toHaveAttribute("href", "/categories/nature-outdoors");
    expect(screen.getByRole("link", { name: /Music & nightlife/ })).toHaveAttribute("href", "/categories/nightlife");
    expect(screen.getAllByRole("link", { name: /Local food|Nature|Art|Music/ })).toHaveLength(SAMPLE_EVENT.moreWays.length);
  });

  it("opens a question through the toggle", async () => {
    const onToggleQuestion = vi.fn();
    const { user } = renderWithProviders(
      <EventSectionsView event={SAMPLE_EVENT} openQuestionId={null} onToggleQuestion={onToggleQuestion} />,
    );
    await user.click(screen.getByRole("button", { name: /Is there parking/ }));
    expect(onToggleQuestion).toHaveBeenCalledWith("parking");
  });

  it("leaves out sections the event has no data for", () => {
    renderWithProviders(
      <EventSectionsView
        event={{
          ...SAMPLE_EVENT,
          included: [],
          goodToKnow: [],
          lineup: [],
          questions: [],
          schedule: [],
          moreWays: [],
          knowBeforeYouGo: [],
        }}
        openQuestionId={null}
        onToggleQuestion={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "About this event",
      "Where you’ll be",
    ]);
  });
});
