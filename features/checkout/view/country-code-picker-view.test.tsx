import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/utils/render";

import type { Country } from "../model/country.types";
import { CountryCodePickerView } from "./country-code-picker-view";

const nigeria: Country = { iso: "NG", name: "Nigeria", dial: "234" };
const ghana: Country = { iso: "GH", name: "Ghana", dial: "233" };
const britain: Country = { iso: "GB", name: "United Kingdom", dial: "44" };
const usa: Country = { iso: "US", name: "United States", dial: "1" };
const options = [nigeria, ghana, britain, usa];

function viewport(desktop: boolean) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: desktop,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
}

afterEach(() => vi.unstubAllGlobals());

function setup(props: Partial<React.ComponentProps<typeof CountryCodePickerView>> = {}) {
  const onSelect = vi.fn();
  const utils = renderWithProviders(
    <CountryCodePickerView selected={nigeria} options={options} onSelect={onSelect} {...props} />,
  );
  return { onSelect, ...utils };
}

describe.each([
  ["desktop dropdown", true],
  ["mobile bottom sheet", false],
])("CountryCodePickerView, %s", (_name, desktop) => {
  it("shows the selected code on a pill, without a flag", () => {
    viewport(desktop);
    setup();

    const trigger = screen.getByRole("button", { name: "Country code, +234 Nigeria" });
    expect(trigger).toHaveTextContent("+234");
    expect(trigger.querySelector("img")).toBeNull();
  });

  it("lists countries as '+code Name' and picks one", async () => {
    viewport(desktop);
    const { user, onSelect } = setup();

    await user.click(screen.getByRole("button", { name: /Country code/ }));
    const list = screen.getByRole("listbox", { name: "Country code" });
    expect(within(list).getByRole("option", { name: "+234 Nigeria" })).toHaveAttribute("aria-selected", "true");
    expect(within(list).getByRole("option", { name: "+44 United Kingdom" })).toBeInTheDocument();

    await user.click(within(list).getByRole("button", { name: "+44 United Kingdom" }));

    expect(onSelect).toHaveBeenCalledWith(britain);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("filters by name or calling code, with or without the plus", async () => {
    viewport(desktop);
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /Country code/ }));
    const search = screen.getByLabelText("Search country or code");

    await user.type(search, "united");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["+44 United Kingdom", "+1 United States"]);

    await user.clear(search);
    await user.type(search, "+23");
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["+234 Nigeria", "+233 Ghana"]);

    await user.clear(search);
    await user.type(search, "zzz");
    expect(screen.getByText("No countries found")).toBeInTheDocument();
  });

  it("can't be opened when locked", async () => {
    viewport(desktop);
    const { user } = setup({ disabled: true });

    await user.click(screen.getByRole("button", { name: /Country code/ }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("CountryCodePickerView on mobile", () => {
  it("titles the bottom sheet", async () => {
    viewport(false);
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /Country code/ }));

    expect(screen.getByText("Select country code")).toBeInTheDocument();
  });
});
