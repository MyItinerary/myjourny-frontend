import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventLineupView, LINEUP_PREVIEW } from "./event-lineup-view";

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

  const many = (count: number) =>
    Array.from({ length: count }, (_, i) => ({
      id: `p${i}`,
      name: `Speaker ${i}`,
      role: "Role",
      bio: "Bio",
      imageUrl: null,
      tone: 1 as const,
    }));

  it("shows everyone, with no dialog button, when they fit the page", () => {
    renderWithProviders(<EventLineupView people={many(LINEUP_PREVIEW)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(LINEUP_PREVIEW);
    expect(screen.queryByRole("button", { name: /See more/ })).not.toBeInTheDocument();
  });

  it("shows the first few, and the See more link opens a dialog with every speaker", async () => {
    const { user } = renderWithProviders(<EventLineupView people={many(9)} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(LINEUP_PREVIEW);
    expect(screen.queryByText("Speaker 8")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "See more: all 9 speakers" }));
    const dialog = screen.getByRole("dialog", { name: "Lineup" });
    expect(within(dialog).getAllByRole("listitem")).toHaveLength(9);
    expect(within(dialog).getByText("Speaker 8")).toBeInTheDocument();
  });

  it("closes the dialog from the X and from Escape", async () => {
    const { user } = renderWithProviders(<EventLineupView people={many(9)} />);
    await user.click(screen.getByRole("button", { name: "See more: all 9 speakers" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "See more: all 9 speakers" }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
