import { describe, expect, it, vi } from "vitest";

import { activityRows, destinationRows, matchGroups, popularAreaRows, recentRows, type SheetRowActions } from "./search-sheet-rows";

const actions = (): SheetRowActions => ({
  pickArea: vi.fn(),
  pickDestination: vi.fn(),
  pickActivity: vi.fn(),
  openExperience: vi.fn(),
  pickEvent: vi.fn(),
});

const lagos = { id: "lagos", city: "Lagos, Nigeria", description: "28 experiences" };
const food = { id: "local-food-drinks", label: "Local food & drinks", subtitle: "Street eats, cafés, and culinary tours" };
const canoe = {
  id: "exp-1",
  title: "Canoe the Lekki lagoon",
  city: "Lagos",
  cover_image_url: null,
  subtitle: "Lagos · from NGN 5,000",
  fallbackImage: "/fallback.jpg",
};
const carnival = { id: "carnival", title: "Lekki street carnival", subtitle: "Sat 21 Nov · Admiralty Way" };
const none = { destinations: [], activities: [], experiences: [], events: [] };

describe("search sheet rows", () => {
  it("lists destinations with a pin and activities with a compass, each picking itself", () => {
    const a = actions();
    const [dest] = destinationRows([lagos], a);
    const [act] = activityRows([food], a);
    expect(dest).toMatchObject({ title: "Lagos, Nigeria", subtitle: "28 experiences", icon: "location" });
    expect(act).toMatchObject({ title: "Local food & drinks", icon: "category" });

    dest.onSelect();
    act.onSelect();
    expect(a.pickDestination).toHaveBeenCalledWith(lagos);
    expect(a.pickActivity).toHaveBeenCalledWith(food);
  });

  it("lists the Lagos areas", () => {
    const a = actions();
    const rows = popularAreaRows(a);
    expect(rows[0]).toMatchObject({ title: "Lekki", icon: "location" });
    rows[1].onSelect();
    expect(a.pickArea).toHaveBeenCalledWith("Victoria Island");
  });

  it("describes recent searches by their dates and guests", () => {
    const onSelect = vi.fn();
    const now = new Date(2026, 10, 20, 12);
    const rows = recentRows(
      [
        { where: "Lekki", start: "2026-11-21", end: "2026-11-22", guests: { adults: 2, children: 0, infants: 0 } },
        { where: "Yaba", start: null, end: null, guests: { adults: 0, children: 0, infants: 0 } },
      ],
      onSelect,
      now,
    );
    expect(rows.map((r) => r.subtitle)).toEqual(["This weekend · 2 guests", "Any date"]);
    rows[1].onSelect();
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ where: "Yaba" }));
  });

  it("groups the predictions for what's typed, in order, leaving out empty groups", () => {
    const a = actions();
    const groups = matchGroups("lek", { destinations: [lagos], activities: [], experiences: [canoe], events: [carnival] }, a);

    expect(groups.map((g) => g.label)).toEqual(["Areas", "Destinations", "Experiences", "Events"]);
    expect(groups[0].rows[0].title).toEqual([
      { text: "Lek", match: true },
      { text: "ki", match: false },
    ]);
    expect(groups[2].rows[0]).toMatchObject({ subtitle: "Lagos", image: { src: null, fallback: "/fallback.jpg" } });

    groups[2].rows[0].onSelect();
    groups[3].rows[0].onSelect();
    expect(a.openExperience).toHaveBeenCalledWith(canoe);
    expect(a.pickEvent).toHaveBeenCalledWith(carnival);
  });

  it("has nothing to predict with nothing typed, or nothing matching", () => {
    expect(matchGroups("  ", { ...none, destinations: [lagos] }, actions())).toEqual([]);
    expect(matchGroups("qwzx", none, actions())).toEqual([]);
  });
});
