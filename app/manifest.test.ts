import { describe, expect, it } from "vitest";

import manifest from "./manifest";

describe("web app manifest", () => {
  it("installs as Myjourny, opening full-screen from the home page", () => {
    const m = manifest();
    expect(m).toMatchObject({ name: "Myjourny", short_name: "Myjourny", start_url: "/", scope: "/", display: "standalone" });
  });

  it("has the home-screen icons Android and desktop Chrome need, including a maskable one", () => {
    const icons = manifest().icons ?? [];
    expect(icons.map((i) => [i.src, i.sizes, i.purpose])).toEqual([
      ["/app-icons/192", "192x192", "any"],
      ["/app-icons/512", "512x512", "any"],
      ["/app-icons/maskable-512", "512x512", "maskable"],
    ]);
  });
});
