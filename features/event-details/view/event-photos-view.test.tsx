import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { EventPhotosView } from "./event-photos-view";

describe("EventPhotosView", () => {
  it("fills the gallery with five tiles", () => {
    renderWithProviders(<EventPhotosView />);
    expect(screen.getByTestId("event-photo-placeholders").children).toHaveLength(5);
  });
});
