import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { PreferencesSection } from "./preferences";

const profile = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));
const mutate = vi.hoisted(() => vi.fn());

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock("@/lib/queries/profile", () => ({
  useGetProfile: () => ({ data: profile.current }),
  useUpdateProfile: () => ({ mutate }),
}));

beforeEach(() => {
  mutate.mockReset();
  profile.current = {
    completed: true,
    interests: ["nature", "wellness"],
    energy_level: "chill",
    trip_intent: ["adventure"],
    social_style: "solo",
    budget_range: "high",
  };
});

describe("PreferencesSection", () => {
  it("shows the answers saved on the profile, not placeholder ones", () => {
    renderWithProviders(<PreferencesSection />);

    const chips = screen.getByText("Your interests").nextElementSibling as HTMLElement;
    expect(chips).not.toHaveTextContent("Art & creativity");
    expect(chips).not.toHaveTextContent("Street life");
    expect(chips.children).toHaveLength(2);
  });

  it("offers the quiz when the profile has no answers yet", () => {
    profile.current = { completed: false, interests: [] };
    renderWithProviders(<PreferencesSection />);

    expect(screen.getByRole("button", { name: "Take the preference quiz" })).toBeInTheDocument();
  });

  it("saves an edit back to the profile as the ids the quiz uses", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PreferencesSection />);

    await user.click(screen.getAllByRole("button", { name: "Edit" })[0]);
    await user.click(screen.getByText("Local food & drinks"));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(mutate).toHaveBeenCalledWith(
      expect.objectContaining({ interests: ["nature", "wellness", "food"] }),
      expect.anything(),
    );
  });
});
