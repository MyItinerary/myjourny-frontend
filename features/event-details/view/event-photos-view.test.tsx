import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventPhotosView } from "./event-photos-view";

describe("EventPhotosView", () => {
  it("fills the large-screen gallery with five tiles and a View all chip", () => {
    renderWithProviders(<EventPhotosView />);
    expect(screen.getByTestId("event-photo-placeholders").children).toHaveLength(6);
    expect(screen.getByRole("button", { name: "View all" })).toBeDisabled();
  });

  it("gives small screens a strip of five with a counter that follows the swipe", () => {
    renderWithProviders(<EventPhotosView />);
    const strip = screen.getByTestId("event-photo-strip");
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    const scroller = strip.firstElementChild as HTMLElement;
    expect(scroller.children).toHaveLength(5);
    // jsdom has no layout: a zero-width strip must not report a slide.
    fireEvent.scroll(scroller);
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
    Object.defineProperty(scroller, "clientWidth", { value: 300 });
    scroller.scrollLeft = 610;
    fireEvent.scroll(scroller);
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });
});
