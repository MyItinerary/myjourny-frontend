import { describe, expect, it } from "vitest";

import {
  DEFAULT_SAMPLE_EXPERIENCES,
  mapApiExperiences,
} from "./sample-experiences";

describe("sample-experiences model", () => {
  it("provides 8 default sample experiences matching Figma specifications", () => {
    expect(DEFAULT_SAMPLE_EXPERIENCES).toHaveLength(8);
    expect(DEFAULT_SAMPLE_EXPERIENCES[0].category).toBe("PHOTOGRAPHER");
    expect(DEFAULT_SAMPLE_EXPERIENCES[0].title).toBe("Neighbourhood photowalk");
    expect(DEFAULT_SAMPLE_EXPERIENCES[1].category).toBe("PRIVATE CHEF");
    expect(DEFAULT_SAMPLE_EXPERIENCES[7].category).toBe("FITNESS COACH");
  });

  it("maps valid API items into sample experiences", () => {
    const apiItems = [
      {
        id: "exp-1",
        title: "Lekki Art Walk",
        city: "Lagos",
        price_from: 15000,
        cover_image_url: "https://example.com/art.jpg",
      },
    ];

    const result = mapApiExperiences(apiItems);
    expect(result).toHaveLength(8);
    expect(result[0].id).toBe("exp-1");
    expect(result[0].title).toBe("Lekki Art Walk");
    expect(result[0].category).toBe("LAGOS");
    expect(result[0].priceFormatted).toBe("₦15,000");
    expect(result[0].imageUrl).toBe("https://example.com/art.jpg");
    // Padded with remaining default experiences to complete 8 cards
    expect(result[1].title).toBe("Supper club for strangers");
  });

  it("falls back to default experiences on empty or undefined API list", () => {
    expect(mapApiExperiences([])).toEqual(DEFAULT_SAMPLE_EXPERIENCES);
    expect(mapApiExperiences(undefined)).toEqual(DEFAULT_SAMPLE_EXPERIENCES);
  });
});
