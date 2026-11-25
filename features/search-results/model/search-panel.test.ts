import { describe, expect, it } from "vitest";

import { buildDropdownGroups, isTonight, isWeekend } from "./search-panel";
import { EMPTY_FILTERS } from "./search-results";

describe("buildDropdownGroups", () => {
  it("lists the options behind the row's dropdowns and marks the chosen ones", () => {
    const groups = buildDropdownGroups({ ...EMPTY_FILTERS, duration: "half_day", languages: ["Igbo"], groups: { age: ["21+"] } });

    expect(groups.duration.options.find((o) => o.selected)?.label).toBe("Half day");
    expect(groups.languages.options.find((o) => o.selected)?.label).toBe("Igbo");
    expect(groups.languages.options.find((o) => o.value === "Hausa")?.disabled).toBe(true);
    expect(groups.age.options.find((o) => o.selected)?.label).toBe("21+");
  });
});

describe("featured date picks", () => {
  it("recognises tonight and the weekend by their range", () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    expect(isTonight({ ...EMPTY_FILTERS, dateRange: { start: today, end: today } })).toBe(true);
    expect(isTonight(EMPTY_FILTERS)).toBe(false);

    const saturday = new Date(2030, 10, 2);
    const sunday = new Date(2030, 10, 3);
    expect(isWeekend({ ...EMPTY_FILTERS, dateRange: { start: saturday, end: sunday } })).toBe(true);
    expect(isWeekend({ ...EMPTY_FILTERS, dateRange: { start: sunday, end: sunday } })).toBe(false);
  });
});
