import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { PreferencesSection } from "./preferences";
import { PreferencesView } from "./preferences-view";

const profile = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));
const mutate = vi.hoisted(() => vi.fn());
const localPrefs = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));
vi.mock("@/lib/queries/profile", () => ({
  useGetProfile: () => ({ data: profile.current }),
  useUpdateProfile: () => ({ mutate }),
}));
vi.mock("@/lib/onboarding/preferences-store", () => ({ getPreferences: () => localPrefs.current }));

beforeEach(() => {
  profile.current = undefined;
  localPrefs.current = {};
  mutate.mockReset();
});

describe("PreferencesView", () => {
  it("shows preferences saved on this device once hydrated", () => {
    localPrefs.current = { energyLevel: "slow-paced" };
    renderWithProviders(<PreferencesView />);

    expect(screen.getByText("slow-paced")).toBeInTheDocument();
  });

  it("prefers the saved profile over this device's draft", () => {
    localPrefs.current = { energyLevel: "slow-paced" };
    profile.current = { energy_level: "from-profile" };
    renderWithProviders(<PreferencesView />);

    expect(screen.getByText("from-profile")).toBeInTheDocument();
    expect(screen.queryByText("slow-paced")).not.toBeInTheDocument();
  });

  it("shows defaults when nothing is set", () => {
    renderWithProviders(<PreferencesView />);
    expect(screen.getByText("Packed & energetic")).toBeInTheDocument();
  });
});

describe("PreferencesSection", () => {
  beforeEach(() => {
    profile.current = {
      completed: true,
      interests: ["nature", "wellness"],
      energy_level: "chill",
      trip_intent: ["adventure"],
      social_style: "solo",
      budget_range: "high",
    };
  });

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
