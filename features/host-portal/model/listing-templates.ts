import type { ExampleListing } from "./home-copy.types";
import { blankDraft } from "./listing-draft";
import type { ListingDraft } from "./listing-draft.types";

/** A ready-made listing a new host can start from: the card on Home, and what it fills in. */
export type ListingTemplate = {
  card: ExampleListing;
  /** The parts of a listing the template fills in. Location, when it runs and photos are the host's own. */
  fill: Partial<ListingDraft>;
};

// Stand-in photos until the design system imagery is brought across.
export const LISTING_TEMPLATES: ListingTemplate[] = [
  {
    card: {
      id: "portrait-walk",
      imageUrl: "/images/home/cities/abuja.jpg",
      eyebrow: "Art & creativity",
      title: "Golden hour portrait walk",
      sub: "Six people, three streets, everyone leaves with ten edited photos.",
      money: "8 guests × ₦10,000 = ₦80,000",
    },
    fill: {
      title: "Golden hour portrait walk",
      hook: "Three streets, the best light of the day, and ten edited photos of you to keep.",
      desc: "We meet an hour before sunset and walk three streets I shoot every week. I show you where to stand and what to do with your hands, and I take portraits of each of you along the way. Within two days you get ten edited photos you will actually post.",
      cats: ["Art & creativity"],
      subs: ["Photography walk"],
      tags: ["Photography", "Walking", "Golden hour", "Small group"],
      dur: "2",
      minG: "2",
      maxG: "8",
      price: "10000",
      refund: "full_refund_until",
      refundHours: "24",
      inc: ["Ten edited photos each, sent within two days", "Posing tips the whole way"],
      exc: ["Transport to the meeting point", "Food and drinks"],
      bring: ["Comfortable shoes"],
      wear: ["Something you like being photographed in"],
      fitness: "easy",
      agePolicy: "all_ages",
      access: "not_confirmed",
    },
  },
  {
    card: {
      id: "market-to-plate",
      imageUrl: "/images/home/cities/jos.jpg",
      eyebrow: "Local food & drinks",
      title: "Market to plate",
      sub: "Shop the market together, then cook and eat what you bought. Three hours.",
      money: "6 guests × ₦12,000 = ₦72,000",
    },
    fill: {
      title: "Market to plate",
      hook: "Shop a real market with someone who knows it, then cook and eat what you bought.",
      desc: "We start at the market, where I show you how to pick peppers, haggle for fish and tell good palm oil from bad. Then we go back to my kitchen and cook two dishes together from what we bought. You eat everything you make, and leave with the recipes.",
      cats: ["Local food & drinks"],
      subs: ["Market to table"],
      tags: ["Street food", "Small group", "Beginner friendly"],
      dur: "3",
      minG: "2",
      maxG: "6",
      price: "12000",
      refund: "full_refund_until",
      refundHours: "48",
      inc: ["Everything we buy at the market", "A full meal", "The recipes, written down"],
      exc: ["Transport to the market", "Drinks other than water"],
      bring: ["A tote bag"],
      wear: ["Closed shoes for the market"],
      fitness: "easy",
      agePolicy: "all_ages",
      diet: ["Vegetarian"],
      access: "not_confirmed",
    },
  },
  {
    card: {
      id: "boat-morning",
      imageUrl: "/images/home/experiences/kayaking.jpg",
      eyebrow: "Water activity",
      title: "Boat morning",
      sub: "One boat, a quiet stretch of water, back before the heat.",
      money: "5 guests × ₦18,000 = ₦90,000",
    },
    fill: {
      title: "Boat morning",
      hook: "Out on the water at first light, back on land before the heat.",
      desc: "We push off just after sunrise, when the water is flat and the city is still quiet. I take you along the creeks I grew up on, past fishing villages and the stilt houses, and stop for tea on the boat. We are back at the jetty before the sun gets hard.",
      cats: ["Water activity"],
      subs: ["Boat cruise"],
      tags: ["Small group", "Quiet"],
      dur: "3",
      minG: "2",
      maxG: "5",
      price: "18000",
      refund: "full_refund_until",
      refundHours: "48",
      inc: ["Life jackets", "Tea and bread on the boat"],
      exc: ["Transport to the jetty"],
      bring: ["Sunscreen", "A hat"],
      wear: ["Clothes you don't mind getting wet"],
      fitness: "easy",
      agePolicy: "adult_required_under",
      ageMin: "12",
      swim: "Guests don't need to know how to swim.",
      access: "not_suitable",
    },
  },
];

export const templateById = (id: string | null) => LISTING_TEMPLATES.find((t) => t.card.id === id) ?? null;

/** A fresh draft from a template. */
export function draftFromTemplate(template: ListingTemplate): ListingDraft {
  return { ...blankDraft(), ...template.fill };
}

/** The host has typed or picked something into this draft. */
export const hasContent = (d: ListingDraft) =>
  Boolean(d.title.trim() || d.desc.trim() || d.cats.length || d.locations.length || d.photos.length);
