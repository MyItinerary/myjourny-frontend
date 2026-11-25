import { describe, expect, it } from "vitest";

import { LAUNCH_SCREENS } from "./launch-screens";

describe("LAUNCH_SCREENS", () => {
  it("sizes each iPhone launch image in device pixels, matched by its screen", () => {
    expect(LAUNCH_SCREENS.find((s) => s.size === "1179x2556")).toEqual({
      size: "1179x2556",
      width: 1179,
      height: 2556,
      dpr: 3,
      media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    });
  });

  it("has one image per screen", () => {
    const media = LAUNCH_SCREENS.map((s) => s.media);
    expect(new Set(media).size).toBe(media.length);
  });
});
