import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventScheduleView } from "./event-schedule-view";

describe("EventScheduleView", () => {
  it("lists each entry with its time and detail, in order", () => {
    renderWithProviders(
      <EventScheduleView
        rows={[
          { id: "doors", time: "8:30am", title: "Doors", detail: null, kind: "plain" },
          { id: "s1", time: "9:30am", title: "Session one", detail: "Amara Okoye and Dr. Femi Adeyemi", kind: "talk" },
          { id: "lunch", time: "12:30pm", title: "Lunch", detail: "Included with every ticket", kind: "muted" },
          { id: "launch", time: "4:30pm", title: "Launch and refreshments", detail: "Meet the speakers", kind: "launch" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual([
      "8:30amDoors",
      "9:30amSession oneAmara Okoye and Dr. Femi Adeyemi",
      "12:30pmLunchIncluded with every ticket",
      "4:30pmLaunch and refreshmentsMeet the speakers",
    ]);
  });
});
