import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventLineupView } from "./event-lineup-view";

describe("EventLineupView", () => {
  it("shows each speaker, with initials when there is no photo", () => {
    renderWithProviders(
      <EventLineupView
        people={[
          { id: "a", name: "Amara Okoye", role: "Architecture", bio: "Designs walkable neighbourhoods.", imageUrl: null, tone: 1 },
          { id: "f", name: "Dr. Femi Adeyemi", role: "Urban research", bio: "Studies markets.", imageUrl: "https://img.test/f.jpg", tone: 2 },
        ]}
      />,
    );
    expect(screen.getByText("Amara Okoye")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("AO")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Dr. Femi Adeyemi" })).toBeInTheDocument();
    expect(screen.queryByText("FA")).not.toBeInTheDocument();
  });
});
