import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import { PreferencesView } from "./preferences-view";

const profile = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }));
const localPrefs = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn() }) }));
vi.mock("@/lib/queries/profile", () => ({ useGetProfile: () => ({ data: profile.current }) }));
vi.mock("@/lib/onboarding/preferences-store", () => ({ getPreferences: () => localPrefs.current }));

beforeEach(() => {
  profile.current = undefined;
  localPrefs.current = {};
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
