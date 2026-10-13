import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { SocialButtonGroupView, TikTokIcon, VerifiedCheckIcon } from "./social-icons-view";

describe("social-icons-view", () => {
  it("renders social button group links", () => {
    renderWithProviders(<SocialButtonGroupView />);

    expect(screen.getByLabelText("Website")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
  });

  it("renders verified check icon and TikTok icon without throwing", () => {
    const { container } = renderWithProviders(
      <>
        <VerifiedCheckIcon />
        <TikTokIcon />
      </>,
    );
    expect(container.querySelectorAll("svg").length).toBe(2);
  });
});
